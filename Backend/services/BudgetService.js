import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import LogService from "./LogService.js";
import user from '../models/user.js';
import Alert from "../models/Alert.js";
import Category from "../models/Category.js";
import AlertService from "./AlertService.js";
import mailer from "../mailer/Transport.js";

class BudgetService {

    /**
     * Create a new budget for a user in a specific category for a given month/year.
     * Prevents duplicate budgets for the same category and time period.
     * @param {Object} budgetData - Budget data object containing categoryId, limit, month, year, isRecurring
     * @param {string} userId - The ID of the user creating the budget
     * @returns {Promise<Object>} The created budget object
     * @throws {Error} If budget already exists or creation fails
     */
    async CreateBudget(budgetData, userId) {
        try {

            const existingBudget = await Budget.findOne({
                userId: userId,
                categoryId: budgetData.categoryId,
                month: budgetData.month,
                year: budgetData.year,
                isDelete:false
            });

            if (existingBudget) {
                throw new Error("Budget already exists for this category and month");
            }

            const newBudget = new Budget({
                ...budgetData,
                userId: userId
            });

            await newBudget.save();

            // Check if budget is already exceeded by existing spending
            try {
                await this.checkBudgetExceededOnCreation(
                    userId,
                    budgetData.categoryId,
                    budgetData.month,
                    budgetData.year,
                    budgetData.limit
                );
            } catch (exceedErr) {
                console.error("Failed to check budget exceeded on creation", exceedErr);
            }

            // create audit log for budget creation
            try {
                const action = `User ${userId} created budget ₹${newBudget.limit} for ${newBudget.categoryId} (${newBudget.month}/${newBudget.year})`;
                await LogService.CreateLog(userId, action, {
                    budgetId: newBudget._id,
                    limit: newBudget.limit,
                    categoryId: newBudget.categoryId,
                    month: newBudget.month,
                    year: newBudget.year,
                });
            } catch (logErr) {
                console.error("Failed to create budget log", logErr);
            }

            return newBudget;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieve all unique month/year combinations for which budgets exist for a user.
     * Excludes soft-deleted budgets.
     * @param {string} userId - The ID of the user
     * @returns {Promise<Array>} Array of objects with month and year properties
     * @throws {Error} If retrieval fails
     */
    async getBudgetMonths(userId) {
        try {
            console.log("userId:" + userId);
            const months = await Budget.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        isDelete: false
                    },
                },
                {
                    $group: {
                        _id: {
                            year: "$year",
                            month: "$month"
                        },

                    },
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                },

                {
                    $project: {
                        _id: 0,
                        year: "$_id.year",
                        month: "$_id.month",

                    }
                }


            ]);
            console.log(months);
            return months;

        } catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Update an existing budget with new data and clear related alerts.
     * When budget is updated, clears any budget_exceeded alerts to allow new alerts
     * to be generated based on the updated limit.
     * @param {string} budgetId - The ID of the budget to update
     * @param {Object} updatedData - Object containing fields to update (limit, isRecurring, etc.)
     * @returns {Promise<Object>} The updated budget object
     * @throws {Error} If update fails
     */
    async UpdateBudget(budgetId, updatedData) {
        try {

            const updated = await Budget.findByIdAndUpdate(
                budgetId,
                updatedData,
                { new: true }
            );

            // Check if budget is already exceeded by existing spending (especially if limit was updated)
            if (updatedData.limit) {
                try {
                    await this.checkBudgetExceededOnCreation(
                        updated.userId,
                        updated.categoryId,
                        updated.month,
                        updated.year,
                        updatedData.limit
                    );
                } catch (exceedErr) {
                    console.error("Failed to check budget exceeded on update", exceedErr);
                }
            }

            try {
                const category = await Category.findById(updated?.categoryId);
                if (category && updated?.userId) {
    
                    await Alert.deleteMany({
                        userId: updated.userId,
                        type: "budget_exceeded",
                        message: { $regex: category.name }
                    });
                    console.log(`Cleared budget_exceeded alerts for user ${updated.userId} in category ${category.name}`);
                }
            } catch (alertErr) {
                console.error("Failed to clear budget alerts on update", alertErr);
        
            }

            try {
                const action = `User ${updated?.userId} updated budget ${updated?._id} to limit ₹${updated?.limit}`;
                await LogService.CreateLog(updated?.userId, action, {
                    budgetId: updated?._id,
                    limit: updated?.limit,
                    updatedFields: updatedData,
                });
            } catch (logErr) {
                console.error("Failed to create budget update log", logErr);
            }

            return updated;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieve all budgets for a user in a specific month/year.
     * Automatically creates recurring budgets if eligible.
     * Excludes soft-deleted budgets.
     * @param {string} userId - The ID of the user
     * @param {number} month - The month (1-12)
     * @param {number} year - The year
     * @returns {Promise<Array>} Array of budget objects with populated category names
     * @throws {Error} If retrieval fails
     */
    async GetBudgets(userId, month, year) {
        try {
            this.CreateRecurringBudget(userId);
            console.log(month);
            console.log(year);
            console.log(userId);
            const budgets = await Budget.find({ userId, month: month, year: year, isDelete: false })
                .populate("categoryId", "name");
            // console.log("Budgets:"+budgets);
            return budgets;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieve a specific budget for a user's category in a given month/year.
     * Excludes soft-deleted budgets.
     * @param {string} userId - The ID of the user
     * @param {string} categoryId - The ID of the category
     * @param {number} month - The month (1-12)
     * @param {number} year - The year
     * @returns {Promise<Object|null>} The budget object or null if not found
     * @throws {Error} If retrieval fails
     */
    async GetBudgetByCategory(userId, categoryId, month, year) {
        try {

            const budget = await Budget.findOne({
                userId,
                categoryId,
                month,
                year,
                isDelete: false
            });

            return budget;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Soft delete a budget by marking it as deleted without removing from database.
     * Preserves audit trail and historical data.
     * @param {string} budgetId - The ID of the budget to delete
     * @returns {Promise<Object>} The soft-deleted budget object with isDelete=true
     * @throws {Error} If deletion fails
     */
    async DeleteBudget(budgetId) {
        try {

            const budget = await Budget.findById(budgetId);
            
            // Soft delete: mark as deleted and set deletedAt timestamp
            const deleted = await Budget.findByIdAndUpdate(
                budgetId,
                { 
                    isDelete: true, 
                    deletedAt: new Date() 
                },
                { new: true }
            );

            try {
                const action = `User ${budget?.userId} deleted budget ${budget?._id} for category ${budget?.categoryId}`;
                await LogService.CreateLog(budget?.userId, action, {
                    budgetId: budget?._id,
                    categoryId: budget?.categoryId,
                    limit: budget?.limit,
                    month: budget?.month,
                    year: budget?.year,
                });
            } catch (logErr) {
                console.error("Failed to create budget deletion log", logErr);
            }

            return deleted;

        } catch (error) {
            throw error;
        }
    }
    /**
     * Create recurring budgets for the current month based on previous month's recurring budgets.
     * Only executed when fetching budgets for current month.
     * @param {string} userId - The ID of the user
     * @returns {Promise<void>}
     * @throws {Error} If user not found or creation fails
     */
    async CreateRecurringBudget(userId) {
    try {
        const now = new Date();

        const existingUser = await user.findById(userId);
        if (!existingUser) {
            throw new Error("No User Found");
        }

        let lastMonth = now.getMonth();
        let lastYear = now.getFullYear();

        if (lastMonth < 0) {
            lastMonth = 11;
            lastYear -= 1;
        }

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const lastMonthBudgets = await Budget.find({
            userId,
            month: lastMonth,
            year: lastYear,
            isRecurring: true,
            isDelete: false
        });
        console.log("last months "+lastMonth);
        if (!lastMonthBudgets.length) {
            return;
        }

        const currentBudgets = await Budget.find({
            userId,
            month: currentMonth+1,
            year: currentYear,
        });

        const existingCategories = new Set(
            currentBudgets.map(b => b.categoryId.toString())
        );

        const newBudgets = [];

        for (const budget of lastMonthBudgets) {
            if (existingCategories.has(budget.categoryId.toString())) {
                continue;
            }

            newBudgets.push({
                userId,
                categoryId: budget.categoryId,
                limit: budget.limit,
                month: currentMonth+1,
                year: currentYear,
                isRecurring: true
            });
        }

        if (newBudgets.length > 0) {
            await Budget.insertMany(newBudgets);
        }
        console.log("new Budgets"+newBudgets);
    } catch (error) {
        throw error;
    }
}
    /**
     * Calculate budget usage for a category in a specific month.
     * Returns the limit, spent amount, and remaining balance.
     * @param {string} userId - The ID of the user
     * @param {string} categoryId - The ID of the category
     * @param {number} month - The month (1-12)
     * @param {number} year - The year
     * @returns {Promise<Object>} Object with limit, spent, and remaining properties
     * @throws {Error} If calculation fails
     */
    async GetBudgetUsage(userId, categoryId, month, year) {

        try {



            // console.log(userId,categoryId,month,year);

            if (year == -1) {
                year = new Date().getFullYear();
            }
            if (month == -1) {
                year = new Date().getMonth();
            }
            const startDate = new Date(year, month - 2, 1);

            const endDate = new Date(year, month - 1, 30);

            const expenses = await Transaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        category: new mongoose.Types.ObjectId(categoryId),
                        type: "expense",
                        date: { $gte: startDate, $lte: endDate },
                        isDelete: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: "$amount" }
                    }
                }
            ]);
        
            const spent = expenses.length ? expenses[0].totalSpent : 0;
            // console.log(expenses);
            const budget = await Budget.findOne({
                userId: userId,
                categoryId: categoryId,
                month: month - 1,
                year: year,
                isDelete: false
            });
            // console.log(budget);
            if (!budget) {
                return { spent, remaining: 0, limit: 0 };
            }

            return {
                limit: budget.limit,
                spent: spent,
                remaining: budget.limit - spent
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if a budget is already exceeded by existing spending.
     * Creates an alert and sends an email if the budget limit is exceeded.
     * @param {string} userId - The ID of the user
     * @param {string} categoryId - The ID of the category
     * @param {number} month - The month (1-12)
     * @param {number} year - The year
     * @param {number} limit - The budget limit
     * @returns {Promise<boolean>} True if budget is exceeded, false otherwise
     * @throws {Error} If check fails
     */
    async checkBudgetExceededOnCreation(userId, categoryId, month, year, limit) {
        try {
            // Calculate spending for the specified month/year/category
            const start = new Date(year, month - 1, 1);
            const next = new Date(year, month, 1);

            const spendingAgg = await Transaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        category: new mongoose.Types.ObjectId(categoryId),
                        type: "expense",
                        isDelete: false,
                        date: { $gte: start, $lt: next }
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            const currentSpending = spendingAgg[0]?.total || 0;

            // If spending exceeds the limit, send alert and email
            if (currentSpending > limit) {
                const category = await Category.findById(categoryId);
                const userDoc = await user.findById(userId);

                const exceededAmount = (currentSpending - limit).toFixed(2);
                const percentageExceeded = ((currentSpending / limit) * 100 - 100).toFixed(1);

                // Create alert
                const message = `⚠️ Budget Alert! Your current spending in ${category?.name || "this category"} (₹${currentSpending.toFixed(2)}) exceeds the budget limit of ₹${limit}.`;
                
                try {
                    await AlertService.CreateAlert(userId, "budget_exceeded", message);
                } catch (alertErr) {
                    console.error("Failed to create budget exceeded alert", alertErr);
                }

                // Send email
                try {
                    await mailer.emails.send({
                        from: '"MoneyMint" <fincons@moneymint.tech>',
                        to: userDoc?.email,
                        subject: "🚨 Budget Already Exceeded - MoneyMint",
                        html: `
                            <div style="font-family: Arial, sans-serif; background-color:#f5f7fa; padding:20px;">
                                <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 3px 12px rgba(0,0,0,0.1); text-align:center;">
                                    <h2 style="color:#e74c3c; margin-bottom:10px;">🚨 Budget Already Exceeded!</h2>
                                    <p style="font-size:16px; color:#555;">Hello <b>${userDoc?.name || "User"}</b>,</p>
                                    <p style="font-size:15px; color:#555; line-height:1.6;">Your current spending in the category <b>${category?.name}</b> has already exceeded the budget limit you just set.</p>
                                    <div style="background:#fff3cd; border-radius:8px; padding:15px; margin-top:20px; border-left:4px solid #ff6b6b;">
                                        <p style="margin:6px 0; font-size:15px;"><b>Category:</b> ${category?.name}</p>
                                        <p style="margin:6px 0; font-size:15px;"><b>Budget Limit:</b> ₹${limit}</p>
                                        <p style="margin:6px 0; font-size:15px;"><b>Current Spending:</b> ₹${currentSpending.toFixed(2)}</p>
                                        <p style="margin:6px 0; font-size:15px; color:#e74c3c;"><b>Amount Exceeded:</b> ₹${exceededAmount} (${percentageExceeded}%)</p>
                                    </div>
                                    <p style="margin-top:20px; font-size:15px; color:#555;">Please review your expenses and consider adjusting your budget or reducing spending in this category.</p>
                                    <a href="${process.env.FRONTEND_URL || '#'}" style="display:inline-block; margin-top:20px; padding:12px 25px; background:#e74c3c; color:#ffffff; text-decoration:none; border-radius:6px; font-size:15px; font-weight:bold;">View Dashboard</a>
                                    <hr style="margin:30px 0;">
                                    <p style="font-size:12px; color:#888;">© ${new Date().getFullYear()} MoneyMint • Smart Expense Management</p>
                                </div>
                            </div>
                        `
                    });
                } catch (mailErr) {
                    console.error('Budget exceeded email send failed', mailErr);
                }

                return true;
            }

            return false;

        } catch (error) {
            console.error('checkBudgetExceededOnCreation error', error);
            throw error;
        }
    }
}

export default new BudgetService();
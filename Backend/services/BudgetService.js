import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import LogService from "./LogService.js";

class BudgetService {

    async CreateBudget(budgetData, userId) {
        try {

            const existingBudget = await Budget.findOne({
                userId: userId,
                categoryId: budgetData.categoryId,
                month: budgetData.month,
                year: budgetData.year
            });

            if (existingBudget) {
                throw new Error("Budget already exists for this category and month");
            }

            const newBudget = new Budget({
                ...budgetData,
                userId: userId
            });

            await newBudget.save();

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

    async UpdateBudget(budgetId, updatedData) {
        try {

            const updated = await Budget.findByIdAndUpdate(
                budgetId,
                updatedData,
                { new: true }
            );

            // log budget update
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

    async GetBudgets(userId) {
        try {

            const budgets = await Budget.find({ userId ,month:new Date().getMonth()+1,year:new Date().getFullYear()})
                .populate("categoryId", "name");
            console.log("Budgets:"+budgets);
            return budgets;

        } catch (error) {
            throw error;
        }
    }

    async GetBudgetByCategory(userId, categoryId, month, year) {
        try {

            const budget = await Budget.findOne({
                userId,
                categoryId,
                month,
                year
            });

            return budget;

        } catch (error) {
            throw error;
        }
    }

    async DeleteBudget(budgetId) {
        try {

            const budget = await Budget.findById(budgetId);
            const deleted = await Budget.findByIdAndDelete(budgetId);

            // log budget deletion
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

    async GetBudgetUsage(userId, categoryId, month, year) {
        try {
            console.log(userId,categoryId,month,year);
            const startDate = new Date(year, month - 2, 1);
            
            const endDate = new Date(year, month-1, 30);
            console.log(startDate+""+endDate);
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
                        _id:null,
                        totalSpent: { $sum: "$amount" }
                    }
                }
            ]);

            const spent = expenses.length ? expenses[0].totalSpent : 0;
            console.log(expenses);
            const budget = await Budget.findOne({
                userId:userId,
                categoryId:categoryId,
                month:month-1,
                year:year
            });
            console.log(budget);
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
}

export default new BudgetService();
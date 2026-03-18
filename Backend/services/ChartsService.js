
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
function getHealthLabel(score) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Poor";
}
class ChartService {

    /**
     * Retrieve all month/year combinations for which user has transactions.
     * Used to populate month/year dropdown filters.
     * @async
     * @param {string} userId - The ID of the user
     * @returns {Promise<Array>} Array of objects with year and month properties
     * @throws {Error} If aggregation fails
     */
    async getAvailableMonths(userId) {
        try {
            const userObjectId = new mongoose.Types.ObjectId(userId);
            const months = await Transaction.aggregate([
                {
                    $match: {
                        userId: userObjectId,
                        isDelete: false
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" }
                        }
                    }
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
                        month: "$_id.month"
                    }
                }
            ]);

            console.log("Available months:", months);
            return months;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Retrieve all years for which user has transactions.
     * Used to populate year dropdown filters.
     * @async
     * @param {string} userId - The ID of the user
     * @returns {Promise<Array>} Array of objects with year property
     * @throws {Error} If aggregation fails
     */
    async getAvailableYears(userId) {
        try {
            const userObjectId = new mongoose.Types.ObjectId(userId);
            const years = await Transaction.aggregate([
                {
                    $match: {
                        userId: userObjectId,
                        isDelete: false
                    }
                },
                {
                    $group: {
                        _id: { $year: "$date" }
                    }
                },
                {
                    $sort: {
                        "_id": -1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        year: "$_id"
                    }
                }
            ]);

            console.log("Available years:", years);
            return years;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Calculate predicted expense for the next month based on current spending pace.
     * Projects monthly spending from daily average of current month.
     * @async
     * @param {string} userId - The ID of the user
     * @returns {Promise<Object>} Object with predicted expense data amount
     * @throws {Error} If calculation fails
     */
    async PredictedExpense(userId) {
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 30);
        try {
            const pipeline = [
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        isDelete: false,
                        date: { $gte: startDate, $lte: endDate },
                        type: "expense"
                    },
                },
                {
                    $group: {
                        _id: "$type",
                        total: { $sum: "$amount" },
                    },
                },
            ];

            const rows = await Transaction.aggregate(pipeline);
            console.log(rows);
            const total = rows.reduce((sum, row) => sum + row.total, 0);
            const daysPassed = new Date().getDate();
            const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
            const data = (total / daysPassed) * daysInMonth;
            console.log(data, total, daysInMonth, daysPassed);
            return { data };
        } catch (error) {
            throw new Error(error);
        }
    }

    

    /**
     * Get income vs expense breakdown for a specific month.
     * Aggregates total income and expense amounts and returns by type.
     * @async
     * @param {string} userId - The ID of the user
     * @param {number} month - The month (1-12), defaults to current if 0/-1/undefined
     * @param {number} year - The year, defaults to current if 0/-1/undefined
     * @returns {Promise<Object>} Object with totals {income, expense} and byType array
     * @throws {Error} If aggregation fails
     */
    async IncomeExpense(userId,month,year) {
        try {
            if (!userId) return { totals: { income: 0, expense: 0 }, byType: [] };
            
            // Fallback: Convert 0/-1 to current month/year (controller should handle this, but defensive)
            let monthNum = (month == 0 || month == -1 || month === undefined) ? new Date().getMonth() + 1 : month;
            let yearNum = (year == 0 || year == -1 || year === undefined) ? new Date().getFullYear() : year;
            
            const startDate = new Date(yearNum, monthNum - 1, 1);
            const endDate = new Date(yearNum, monthNum, 0);
            const pipeline = [
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        isDelete: false,

                        date: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: "$type",
                        total: { $sum: "$amount" },
                    },
                },
            ];

            const rows = await Transaction.aggregate(pipeline);

            const totals = { income: 0, expense: 0 };
            rows.forEach((r) => {
                if (r._id === "income") totals.income = r.total ?? 0;
                else if (r._id === "expense") totals.expense = r.total ?? 0;
            });

            return { totals, byType: rows };
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Get spending breakdown by category for a specific month.
     * Returns expense amounts for each category with category names.
     * @async
     * @param {string} userId - The ID of the user
     * @param {number} month - The month (1-12), defaults to current if 0/-1/undefined
     * @param {number} year - The year, defaults to current if 0/-1/undefined
     * @returns {Promise<Array>} Array of objects with category and total for each category
     * @throws {Error} If aggregation fails
     */
    async CategorywiseSpendingChart(userId,month,year) {
        // Fallback: Convert 0/-1 to current month/year (controller should handle this, but defensive)
        let monthNum = (month == 0 || month == -1 || month === undefined) ? new Date().getMonth() + 1 : month;
        let yearNum = (year == 0 || year == -1 || year === undefined) ? new Date().getFullYear() : year;
        
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0);
        const pipeline = [
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    isDelete: false,
                    type: "expense",
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $project: {
                    _id: 0,
                    category: "$category.name",
                    total: 1
                }
            }
        ];
        const row = await Transaction.aggregate(pipeline);
        return row;
    }
    
    
    
    /**
     * Calculate comprehensive financial health score (0-100).
     * Scores based on: savings ratio (40), budget adherence (30), expense control (10), stability (20).
     * Compares current month against 3-month history.
     * @async
     * @param {string} userId - The ID of the user
     * @param {number} month - The month (1-12), defaults to current if -1
     * @param {number} year - The year, defaults to current if -1
     * @returns {Promise<Object>} Object with score, label (Excellent/Good/Average/Poor), breakdown of subscores, and summary
     * @throws {Error} If calculation fails
     */
    async getFinancialHealthScore(userId, month, year) {
        
        if(month==-1)
        {

            month=new Date().getMonth()+1;
        
        }
        if(year==-1)
        {

            year=new Date().getFullYear();
        }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // CURRENT MONTH TRANSACTIONS
    const transactions = await Transaction.find({
        userId: userObjectId,
        isDelete: false,
        date: { $gte: startDate, $lte: endDate }
    });

    // If no transactions, return all zeros
    if (!transactions || transactions.length === 0) {
        return {
            score: 0,
            label: "Poor",
            breakdown: {
                savings: 0,
                budget: 0,
                control: 0,
                stability: 0
            },
            summary: {
                income: 0,
                expense: 0,
                savings: 0
            }
        };
    }

    // CURRENT MONTH BUDGETS
    const budgets = await Budget.find({
        userId: userObjectId,
        month,
        year
    });

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    console.log("Financial Health - Transactions found:", transactions.length);
    console.log("Financial Health - Income:", income, "Expense:", expense);
    console.log("Financial Health - Budgets found:", budgets.length);

    // -------------------------------
    // 1. SAVINGS SCORE (40)
    // -------------------------------
    const savings = income - expense;
    const savingsRatio = income > 0 ? savings / income : 0;
    const scoreSavings = Math.max(0, savingsRatio * 40);

    // -------------------------------
    // 2. BUDGET ADHERENCE (30)
    // -------------------------------
    let totalBudget = 0;
    let overspend = 0;

    for (const b of budgets) {
        totalBudget += b.limit;

        const spent = transactions
            .filter(t =>
                t.category?.toString() === b.categoryId?.toString() &&
                t.type === "expense"
            )
            .reduce((sum, t) => sum + t.amount, 0);

        if (spent > b.limit) {
            overspend += (spent - b.limit);
        }
    }

    const adherence =
        totalBudget > 0 ? (totalBudget - overspend) / totalBudget : 1;

    const scoreBudget = Math.max(0, adherence * 30);

    // -------------------------------
    // 3. EXPENSE CONTROL (10)
    // -------------------------------
    const expenseRatio = income > 0 ? expense / income : 1;
    const scoreControl = Math.max(0, (1 - expenseRatio) * 10);

    // -------------------------------
    // 4. SPENDING STABILITY (20)
    // (Compare last 3 months)
    // -------------------------------
    const prevMonths = [];

    for (let i = 1; i <= 3; i++) {
        const d = new Date(year, month - 1 - i, 1);
        prevMonths.push({
            start: new Date(d.getFullYear(), d.getMonth()+1, 1),
            end: new Date(d.getFullYear(), d.getMonth() + 2, 0, 23, 59, 59)
        });
    }

    const monthlyExpenses = [];

    for (const m of prevMonths) {
        const prevTx = await Transaction.find({
            userId: userObjectId,
            isDelete: false,
            type: "expense",
            date: { $gte: m.start, $lte: m.end }
        });

        const total = prevTx.reduce((sum, t) => sum + t.amount, 0);
        monthlyExpenses.push(total);
    }

    let scoreStability = 20;

    if (monthlyExpenses.length > 0) {
        const avg =
            monthlyExpenses.reduce((a, b) => a + b, 0) /
            monthlyExpenses.length;

        const variance =
            monthlyExpenses.reduce((sum, val) => {
                return sum + Math.pow(val - avg, 2);
            }, 0) / monthlyExpenses.length;

        const stdDev = Math.sqrt(variance);

        scoreStability = Math.max(0, (1 / (1 + stdDev / (avg || 1))) * 20);
    }

    // -------------------------------
    // FINAL SCORE
    // -------------------------------
    let finalScore =
        scoreSavings +
        scoreBudget +
        scoreControl +
        scoreStability;

    finalScore = Math.max(0, Math.min(100, finalScore));

    return {
        score: Math.round(finalScore),
        label: getHealthLabel(finalScore),
        breakdown: {
            savings: Math.round(scoreSavings * 100) / 100,
            budget: Math.round(scoreBudget * 100) / 100,
            control: Math.round(scoreControl * 100) / 100,
            stability: Math.round(scoreStability * 100) / 100
        },
        summary: {
            income: income || 0,
            expense: expense || 0,
            savings: savings || 0
        }
    };
}

    /**
     * Get monthly expense trend for last 3 months including current month.
     * Shows total spending for each month for trend analysis.
     * @async
     * @param {string} userId - The ID of the user
     * @param {number} month - The month (1-12), defaults to current if 0/-1/undefined
     * @param {number} year - The year, defaults to current if 0/-1/undefined
     * @returns {Promise<Array>} Array of objects with year, month, and totalSpent
     * @throws {Error} If aggregation fails
     */
    async MonthlyBudget(userId,month,year) {
        // Fallback: Convert 0/-1 to current month/year (controller should handle this, but defensive)
        let monthNum = (month == 0 || month == -1 || month === undefined) ? new Date().getMonth() + 1 : month;
        let yearNum = (year == 0 || year == -1 || year === undefined) ? new Date().getFullYear() : year;
        console.log(month);

        console.log(year);
        // For monthly trends, show last 3 months
        const startDate = new Date(yearNum, monthNum - 3, 1);
        const endDate = new Date(yearNum, monthNum, 0);
        const pipeline = await Transaction.aggregate([
            {

                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: "expense",
                    isDelete: false,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalSpent: { $sum: "$amount" }
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
                    totalSpent: 1
                }
            }
        ]);
        console.log(pipeline, startDate, endDate);
        return pipeline;
    }



}

export default new ChartService();
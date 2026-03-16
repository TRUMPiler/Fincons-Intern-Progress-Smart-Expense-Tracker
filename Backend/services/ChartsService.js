// • Total income vs total expense
// • Category wise spending chart
// • Monthly spending trend
// • Budget usage indicators
// • Predicted monthly expense

import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";


class ChartService {

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
    async MonthlyBudget(userId,month,year) {
        // Fallback: Convert 0/-1 to current month/year (controller should handle this, but defensive)
        let monthNum = (month == 0 || month == -1 || month === undefined) ? new Date().getMonth() + 1 : month;
        let yearNum = (year == 0 || year == -1 || year === undefined) ? new Date().getFullYear() : year;
        
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

    // const 

}

export default new ChartService();
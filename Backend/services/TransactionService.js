import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import BudgetService from "./BudgetService.js";
import user from "../models/user.js";
import mailer from "../mailer/Transport.js";
import LogService from "./LogService.js";
import { checkOverspending, checkBudgetExceeded } from "./OverSpending.js";
import Alert from "../models/Alert.js";
class TransactionService {
    /**
     * Retrieve all non-deleted transactions for a user within a specific month and year.
     * @param {string} userid - The ID of the user
     * @param {number|string} month - The month (1-12), or system uses current month if invalid
     * @param {number|string} year - The year, or system uses current year if invalid
     * @returns {Promise<Array>} Array of transaction objects with populated category data
     * @throws {Error} If user not found or retrieval fails
     */
    async GetTranscationBasedOnDate(userid, month, year) {
        try {
            if (!user.findById(userid)) throw new Error("User Not Found", { statusCode: 404 });
            const monthNum = Number(month);
            const yearNum = Number(year);
            console.log('Service - monthNum:', monthNum, 'yearNum:', yearNum);

            let monthIndex;
            if (Number.isFinite(monthNum) && monthNum >= 1 && monthNum <= 12) {
                monthIndex = monthNum - 1;
            } else {
                monthIndex = new Date().getMonth();
            }

            const yearFinal = Number.isFinite(yearNum) && yearNum > 0 ? yearNum : new Date().getFullYear();
            console.log("Month Index:" + monthIndex);
            const startDate = new Date(yearFinal, monthIndex, 1, 0, 0, 0, 0);
            const endDate = new Date(yearFinal, monthIndex + 1, 0, 23, 59, 59, 999);
            console.log("Hello: GG:" + startDate, endDate);
            const allTranscation = await Transaction.find({
                userId: userid,
                isDelete: false,
                date: { $gte: startDate, $lte: endDate }
            }).populate("category");

            console.log(`Transcations fetched for Userid ${userid} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
            return allTranscation;
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Retrieve all non-deleted transactions for a user for an entire year.
     * @param {string} userId - The ID of the user
     * @param {number|string} year - The year, or system uses current year if invalid
     * @returns {Promise<Array>} Array of transaction objects with populated category data
     * @throws {Error} If retrieval fails
     */
    async GetTranscationAll(userId, year) {
        try {
            const yearNum = Number(year);
            const yearFinal = Number.isFinite(yearNum) && yearNum > 0 ? yearNum : new Date().getFullYear();
            
            const startDate = new Date(yearFinal, 0, 1, 0, 0, 0, 0);
            const endDate = new Date(yearFinal, 11, 31, 23, 59, 59, 999);
            
            const allTranscation = await Transaction.find({
                userId: userId,
                isDelete: false,
                date: { $gte: startDate, $lte: endDate }
            }).populate("category");
            
            console.log(`Transcations fetched for Userid ${userId} for year ${yearFinal}`);
            return allTranscation;
        } catch (error) {
            throw error;
        }
    }
    /**
     * Create a new transaction for a user and trigger alert checks.
     * Validates category ownership, checks for overspending patterns,
     * checks for budget exceeded, and logs the transaction.
     * @param {Object} transaction - Transaction object with category, amount, type, date, description
     * @param {string} userId - The ID of the user creating the transaction
     * @returns {Promise<Object>} The created transaction object with budget usage data
     * @throws {Error} If category not found, invalid category, or creation fails
     */
    async CreateTranscation(transaction, userId) {
        try {

            const category = await Category.findById(transaction.category);

            if (!category) {
                throw new Error("Category not found");
            }

            if (!category.isDefault && category.userId?.toString() !== userId) {
                throw new Error("Invalid category selected");
            }

            const newTransaction = new Transaction({
                ...transaction,
                userId
            });
            await newTransaction.save();

      
            try {
                await checkOverspending(userId, newTransaction.category,newTransaction._id);
                await checkBudgetExceeded(userId, newTransaction.category, newTransaction._id);
                const action = `User ${userId} added transaction ₹${newTransaction.amount} (${category.name})`;
                await LogService.CreateLog(userId, action, {
                    transactionId: newTransaction._id,
                    amount: newTransaction.amount,
                    category: category.name,
                    type: newTransaction.type,
                });
            } catch (logErr) {
                console.error("Failed to create transaction log", logErr);
            }
            const result = await BudgetService.GetBudgetUsage(
                userId,
                category._id,
                new Date(transaction.date).getMonth() + 2,
                new Date(transaction.date).getFullYear()
            );

            let budget;
            if (typeof result === "string") {
                try {
                    budget = JSON.parse(result);
                } catch (e) {
                    console.warn("Failed to parse budget result string:", e);
                    budget = {};
                }
            } else {
                budget = result || {};
            }

            const limit = budget?.limit ?? budget?.amount ?? null;
            let remaining = budget?.remaining ?? budget?.remainingAmount ?? budget?.remain ?? null;
            let spent = budget?.spent;
            if (remaining == null && limit != null && typeof budget?.used === "number") {
                remaining = limit - budget.used;
            }

            console.log("budget limit:", limit);
            console.log("budget remaining:", remaining);
            console.log(newTransaction.date);
            console.log("budget raw result:", result);
            console.log(spent);


            return newTransaction;

        } catch (err) {
            throw err;
        }
    }

    async DeleteTranscation(transcationID, userId) {
        try {
           
            const trx = await Transaction.findById(transcationID).populate("category", "name");
            if (!trx) throw new Error("Transaction not found");

            const result = await Transaction.updateOne({ _id: transcationID }, { isDelete: true, deletedAt: Date.now() });

            try {
                const categoryName = trx.category?.name ?? String(trx.category ?? "");
                const action = `User ${userId} deleted transaction ₹${trx.amount} (${categoryName})`;
                await LogService.CreateLog(userId ?? trx.userId, action, {
                    transactionId: transcationID,
                    amount: trx.amount,
                    category: categoryName,
                });
            } catch (logErr) {
                console.error("Failed to create delete transaction log", logErr);
            }

            return result;
        } catch (err) {
            throw new Error(err);
        }
    }
    async UpdateTranscation(transactionId, updatedTransaction, userId) {
        try {

            if (updatedTransaction.category) {

                const category = await Category.findById(updatedTransaction.category);

                if (!category) {
                    throw new Error("Category not found");
                }

                if (!category.isDefault && category.userId?.toString() !== userId) {
                    throw new Error("Invalid category selected");
                }
            }
            if(Number(updatedTransaction.amount)<=0)
            {
                throw new Error("Amount cannot be equal to or less than 0",{statusCode:400});
            }
            const updated = await Transaction.findByIdAndUpdate(
                transactionId,
                updatedTransaction,
                { new: true }
            );

            try {
              
                const categoryName = updated?.category?.name ?? updatedTransaction.category ?? null;
                const action = `User ${userId} updated transaction ₹${updated?.amount ?? updatedTransaction.amount} (${categoryName})`;
                await LogService.CreateLog(userId, action, {
                    transactionId: updated?._id ?? transactionId,
                    amount: updated?.amount ?? updatedTransaction.amount,
                    category: categoryName,
                });



                const category = await Category.findById(updatedTransaction.category);

                if (!category) {
                    throw new Error("Category not found");
                }

                if (!category.isDefault && category.userId?.toString() !== userId) {
                    throw new Error("Invalid category selected");
                }
                // await checkOverspending(userId, updated.category, updated._id);

            } catch (logErr) {
                console.error("Failed to create transaction log", logErr);
            }
            const result = await BudgetService.GetBudgetUsage(
                userId,
                Category._id,
                new Date(updated.date).getMonth() + 2,
                new Date(updated.date).getFullYear(),
                
            );

            let budget;
            if (typeof result === "string") {
                try {
                    budget = JSON.parse(result);
                } catch (e) {
                    console.warn("Failed to parse budget result string:", e);
                    budget = {};
                }
            } else {
                budget = result || {};
            }

            const limit = budget?.limit ?? budget?.amount ?? null;
            let remaining = budget?.remaining ?? budget?.remainingAmount ?? budget?.remain ?? null;
            let spent = budget?.spent;
            if (remaining == null && limit != null && typeof budget?.used === "number") {
                remaining = limit - budget.used;
            }

            console.log("budget limit:", limit);
            console.log("budget remaining:", remaining);
            console.log(updated.date);
            console.log("budget raw result:", result);
            console.log(spent);
            checkBudgetExceeded(userId,updated.category,transactionId);
            checkOverspending(userId,updated.category,transactionId);
           
            return updated;

        } catch (err) {
            throw err;
        }
    }
    async FilterTransactions(userId, category, startDate, endDate) {
        const query = { userId, isDelete: false };

        if (category)
            query.category = category;

        if (startDate && endDate)
            query.date = { $gte: startDate, $lte: endDate };

        return await Transaction.find(query);
    }
}

export default new TransactionService();
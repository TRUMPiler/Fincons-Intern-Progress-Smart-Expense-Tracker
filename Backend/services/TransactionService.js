import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import BudgetService from "./BudgetService.js";
import user from "../models/user.js";
import mailer from "../mailer/Transport.js";
import LogService from "./LogService.js";
import { checkOverspending, checkBudgetExceeded } from "./OverSpending.js";
import Alert from "../models/Alert.js";
class TransactionService {
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

            // if ((spent / limit) * 100 > 99) {
            //     const User = await user.findById(userId);
            //     if (limit === 0) return;
            //     if (User?.email) {
            //         (async () => {
            //             const info = await mailer.emails.send({
            //                 from: '"MoneyMint" <fincons@moneymint.tech>',
            //                 to: User.email,
            //                 subject: "⚠️ Budget Alert from MoneyMint",
            //                 text: `You have used more than 100% of your budget on ${category.name}.`,
            //                 html: `
            //     <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;">
            //         <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        
            //             <h2 style="color:#e74c3c;">⚠️ Budget Limit Alert</h2>

            //             <p style="font-size:16px; color:#555;">
            //                 Hello,
            //             </p>

            //             <p style="font-size:16px; color:#555;">
            //                 You have spent more than <b>100% of your monthly budget</b> for ${category.name}.
            //             </p>

            //             <div style="background:#f8f9fa; padding:15px; border-radius:8px; margin-top:15px;">
            //                 <p style="margin:5px; font-size:15px;"><b>Budget Limit:</b> ₹${limit}</p>
            //                 <p style="margin:5px; font-size:15px;"><b>Amount Spent:</b> ₹${spent}</p>
            //                 <p style="margin:5px; font-size:15px;"><b>Remaining:</b> ₹${remaining ?? 0}</p>
            //             </div>

            //             <p style="margin-top:20px; font-size:15px; color:#555;">
            //                 Please review your spending to avoid exceeding your budget.
            //             </p>

            //             <hr style="margin:25px 0;">

            //             <p style="font-size:12px; color:#aaa;">
            //                 © ${new Date().getFullYear()} MoneyMint. Manage your money smarter 💰
            //             </p>

            //         </div>
            //     </div>
            //     `
            //             });
                        
                    
            //         })();
            //     }
            // }

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
                await checkOverspending(userId, updated.category, updated._id);

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

            if ((spent / limit) * 100 > 80) {
                const User = await user.findById(userId);

                if (limit === 0) return;
                if (updated.date.getMonth() != new Date().getMonth) {
                    if (User?.email) {
                        (async () => {
                            const info = await mailer.emails.send({
                                from: '"MoneyMint" <fincons@moneymint.tech>',
                                to: User.email,
                                subject: "⚠️ Budget Alert from MoneyMint",
                                text: `You have used more than 100% of your budget on ${Category.name}.`,
                                html: `
                <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        
                        <h2 style="color:#e74c3c;">⚠️ Budget Limit Alert</h2>

                        <p style="font-size:16px; color:#555;">
                            Hello,
                        </p>

                        <p style="font-size:16px; color:#555;">
                            You have spent more than <b>100% of your monthly budget</b> for ${Category.name}.
                        </p>

                        <div style="background:#f8f9fa; padding:15px; border-radius:8px; margin-top:15px;">
                            <p style="margin:5px; font-size:15px;"><b>Budget Limit:</b> ₹${limit}</p>
                            <p style="margin:5px; font-size:15px;"><b>Amount Spent:</b> ₹${spent}</p>
                            <p style="margin:5px; font-size:15px;"><b>Remaining:</b> ₹${remaining ?? 0}</p>
                        </div>

                        <p style="margin-top:20px; font-size:15px; color:#555;">
                            Please review your spending to avoid exceeding your budget.
                        </p>

                        <hr style="margin:25px 0;">

                        <p style="font-size:12px; color:#aaa;">
                            © ${new Date().getFullYear()} MoneyMint. Manage your money smarter 💰
                        </p>

                    </div>
                </div>
                `
                            });

                            console.log("Budget alert email sent:", info.messageId);
                        })();
                    }
                }
            }
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
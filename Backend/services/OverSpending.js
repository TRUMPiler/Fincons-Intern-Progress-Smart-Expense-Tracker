import Transaction from "../models/Transaction.js";
import Alert from "../models/Alert.js";
import Category from "../models/Category.js";
import User from "../models/user.js";
import mailer from "../mailer/Transport.js";
import mongoose from "mongoose";

/**
 * Check overspending for a given transaction.
 * Only runs when the transaction date is in the current calendar month.
 */
export const checkOverspending = async (userId, categoryId, transcationId) => {
  try {
    console.log(transcationId);
    const transcation = await Transaction.findById(transcationId);
    if (!transcation) {
      console.warn("checkOverspending: transaction not found", transcationId);
      return;
    }

    // require a transaction date
    const txDate = transcation.date ? new Date(transcation.date) : null;
    if (!txDate) {
      console.warn("checkOverspending: transaction has no date", transcationId);
      return;
    }

    const now = new Date();
    console.log("Helofubfyew",txDate.getMonth,now.getMonth());
    // If the transaction's month/year is not the current month/year, skip checking
    if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
      return;
    }

    // Define the current month window
    const month = now.getMonth();
    const year = now.getFullYear();
    const start = new Date(year, month, 1);
    const next = new Date(year, month + 1, 1);
    // three months before the current month
    const threeMonthsAgo = new Date(year, month - 3, 1);

    // Sum of expenses in the current month for the category
    const currentAgg = await Transaction.aggregate([
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

    const currentTotal = currentAgg[0]?.total || 0;

    // History: aggregate totals for the three months preceding the current month
    const historyAgg = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: new mongoose.Types.ObjectId(categoryId),
          type: "expense",
          isDelete: false,
          date: { $gte: threeMonthsAgo, $lt: start }
        }
      },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Compute average over 3 months (include months with zero spending)
    const monthsToConsider = 3;
    const sumHistory = historyAgg.reduce((sum, m) => sum + (m.total || 0), 0);
    const avg = sumHistory / monthsToConsider;

    // If current month spending exceeds average * 1.4, create alert and send email
    if (currentTotal > avg * 1.4) {
      const category = await Category.findById(categoryId);
      const user = await User.findById(userId);

      const message = `You are spending significantly more on ${category?.name || "this category"} this month compared to your previous spending pattern.`;

      await Alert.create({
        userId,
        type: "overspending",
        message
      });

      // send email (mailer implementation assumed)
      try {
        await mailer.emails.send({
          from: '"MoneyMint" <fincons@moneymint.tech>',
          to: user?.email,
          subject: "⚠️ Overspending Alert - MoneyMint",
          html: `
            <div style="font-family: Arial, sans-serif; background-color:#f5f7fa; padding:20px;">
              <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 3px 12px rgba(0,0,0,0.1); text-align:center;">
                <h2 style="color:#e74c3c; margin-bottom:10px;">⚠️ Overspending Alert</h2>
                <p style="font-size:16px; color:#555;">Hello <b>${user?.name || "User"}</b>,</p>
                <p style="font-size:15px; color:#555; line-height:1.6;">Our system has detected that your spending in the category <b>${category?.name}</b> this month is significantly higher than your usual spending pattern.</p>
                <div style="background:#f8f9fb; border-radius:8px; padding:15px; margin-top:20px;">
                  <p style="margin:6px 0; font-size:15px;"><b>Current Month Spending:</b> ₹${currentTotal}</p>
                  <p style="margin:6px 0; font-size:15px;"><b>Average of Last 3 Months:</b> ₹${avg.toFixed(2)}</p>
                </div>
                <p style="margin-top:20px; font-size:15px; color:#555;">You have exceeded <b>40% more than your usual spending</b> in this category. Consider reviewing your expenses to stay within your financial goals.</p>
                <a href="${process.env.FRONTEND_URL || '#'}" style="display:inline-block; margin-top:20px; padding:12px 25px; background:#4CAF50; color:#ffffff; text-decoration:none; border-radius:6px; font-size:15px; font-weight:bold;">View Dashboard</a>
                <hr style="margin:30px 0;">
                <p style="font-size:12px; color:#888;">© ${new Date().getFullYear()} MoneyMint • Smart Expense Management</p>
              </div>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('OverSpending email send failed', mailErr);
      }
    }
  } catch (err) {
    console.error('checkOverspending error', err);
  }
};

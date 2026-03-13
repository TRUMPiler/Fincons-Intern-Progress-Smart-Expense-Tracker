import Transaction from "../models/Transaction.js";
import Alert from "../models/Alert.js";
import Category from "../models/category.js";
import User from "../models/user.js";
import mailer from "../mailer/Transport.js";
import mongoose from "mongoose";

export const checkOverspending = async (userId, categoryId) => {
 
   const now = new Date();
   const month = now.getMonth();
   const year = now.getFullYear();

   const start = new Date(year, month, 1);
   const next = new Date(year, month + 1, 1);
   const threeMonthsAgo = new Date(year, month - 2, 1);

const current = await Transaction.aggregate([
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

   const currentTotal = current[0]?.total || 0;
   console.log(currentTotal);
const history = await Transaction.aggregate([
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
      _id: { month: { $month: "$date" } },
      total: { $sum: "$amount" }
    }
  }
]);
  //  console.log(history);
   const avg =
     history.reduce((sum, m) => sum + m.total, 0) /
     (history.length || 1);

   if (currentTotal > avg * 1.4) {
     const category = await Category.findById(categoryId);
     const user = await User.findById(userId);

   
const message = `You are spending significantly more on ${category.name} this month compared to your previous spending pattern.`;
     await Alert.create({
       userId,
       type: "overspending",
       message
     });
    //  console.log("Invoked");
 await mailer.sendMail({
  from: '"MoneyMint" <naisal036@gmail.com>',
  to: user.email,
  subject: "⚠️ Overspending Alert - MoneyMint",
  html: `
  <div style="font-family: Arial, sans-serif; background-color:#f5f7fa; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 3px 12px rgba(0,0,0,0.1); text-align:center;">
      
      <h2 style="color:#e74c3c; margin-bottom:10px;">⚠️ Overspending Alert</h2>

      <p style="font-size:16px; color:#555;">
        Hello <b>${user.name || "User"}</b>,
      </p>

      <p style="font-size:15px; color:#555; line-height:1.6;">
        Our system has detected that your spending in the category 
        <b>${category.name}</b> this month is significantly higher 
        than your usual spending pattern.
      </p>

      <div style="background:#f8f9fb; border-radius:8px; padding:15px; margin-top:20px;">
        <p style="margin:6px 0; font-size:15px;"><b>Current Month Spending:</b> ₹${currentTotal}</p>
        <p style="margin:6px 0; font-size:15px;"><b>Average of Last 3 Months:</b> ₹${avg.toFixed(2)}</p>
      </div>

      <p style="margin-top:20px; font-size:15px; color:#555;">
        You have exceeded <b>40% more than your usual spending</b> in this category.
        Consider reviewing your expenses to stay within your financial goals.
      </p>

      <a href="http://localhost:5173/dashboard"
         style="
           display:inline-block;
           margin-top:20px;
           padding:12px 25px;
           background:#4CAF50;
           color:#ffffff;
           text-decoration:none;
           border-radius:6px;
           font-size:15px;
           font-weight:bold;
         ">
         View Dashboard
      </a>

      <hr style="margin:30px 0;">

      <p style="font-size:12px; color:#888;">
        © ${new Date().getFullYear()} MoneyMint • Smart Expense Management
      </p>

    </div>
  </div>
  `
});
   }
};
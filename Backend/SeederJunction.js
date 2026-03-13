import Transaction from "./models/Transaction.js";

export const seedTransactions = async () => {
  try {

    const userId = "69ae63b26f308fb45f1d80c3";

    const categories = [
      "69ae63fcc3814b46f463d785", // Food
      "69ae63fcc3814b46f463d789", // Transport
      "69ae63fcc3814b46f463d78c", // Shopping
      "69ae63fcc3814b46f463d78f", // Bills
      "69ae63fcc3814b46f463d792", // Entertainment
      "69ae63fcc3814b46f463d795", // Health
      "69ae641ec3814b46f463d7a8", // Mom Expense
      "69ae9d3496b5120a5c8a2752"  // Gaming
    ];

    const descriptions = [
      "Lunch",
      "Dinner",
      "Auto ride",
      "Metro travel",
      "Amazon order",
      "Electricity bill",
      "Internet bill",
      "Movie",
      "Steam game",
      "Groceries"
    ];

    const transactions = [];

    const start = new Date("2026-01-01");
    const end = new Date("2026-03-05");

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      const randomAmount =
        Math.floor(Math.random() * 1500) + 100;

      const randomDescription =
        descriptions[Math.floor(Math.random() * descriptions.length)];

      transactions.push({
        userId,
        amount: randomAmount,
        category: randomCategory,
        description: randomDescription,
        type: "expense",
        date: new Date(d),
        isDelete: false
      });
    }

    await Transaction.insertMany(transactions);

    console.log("Transactions inserted successfully");

  } catch (error) {
    console.error(error);
  }
};
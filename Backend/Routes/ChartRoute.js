import express from "express";
import authHandler from "../middleware/Authentication.js";
import ChartController from "../controllers/ChartController.js";

const router = express.Router();
router.get("/healthUpdate",authHandler,ChartController.FinancialHealthReview);
router.get("/:userId", authHandler,ChartController.getIncomeExpense);
router.get("/predict/:userId", authHandler,ChartController.getPredictedExpense);
router.get("/cspending/:userId",authHandler,ChartController.CategoryWiseSpending);
router.get("/monthlytrend/:userId",authHandler,ChartController.MonthlyBudget);

export default router;

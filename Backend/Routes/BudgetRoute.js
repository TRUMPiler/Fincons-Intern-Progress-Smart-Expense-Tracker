import express from "express";
import BudgetController from "../controllers/BudgetController.js";
import authHandler from "../middleware/Authentication.js";

const router = express.Router();
router.use(authHandler);


router.get("/usage", BudgetController.GetBudgetUsage);
router.get("/byCategory", BudgetController.GetBudgetByCategory);
router.get("/:userId", BudgetController.GetBudgets);
router.post("/", BudgetController.CreateBudget);
router.put("/:id", BudgetController.UpdateBudget);
router.delete("/:id", BudgetController.DeleteBudget);

export default router;

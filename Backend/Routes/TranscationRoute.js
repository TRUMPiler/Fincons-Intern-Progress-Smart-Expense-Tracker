import express from "express";
import TransactionController from "../controllers/TransactionController.js";
import authHandler from "../middleware/Authentication.js";

const router = express.Router();

router.get("/filter", authHandler,TransactionController.FilterTransactions);
router.get("/:userId", authHandler,TransactionController.GetBasedOnDate);
router.get("/all/:userId",authHandler,TransactionController.GetAllTranscation);
router.post("/", authHandler,TransactionController.CreateTranscation);
router.put("/:id",authHandler ,TransactionController.UpdateTranscation);
router.delete("/:id", authHandler,TransactionController.DeleteTranscation);

export default router;
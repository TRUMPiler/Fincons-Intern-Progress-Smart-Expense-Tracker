import express from "express";
import TransactionController from "../controllers/TransactionController.js";
import authHandler from "../middleware/Authentication.js";

const router = express.Router();

router.get("/filter", authHandler,TransactionController.FilterTransactions);
router.get("/:userId", authHandler,TransactionController.GetAllTranscations);
router.post("/", authHandler,TransactionController.CreateTranscation);
router.put("/:id",authHandler ,TransactionController.UpdateTranscation);
router.delete("/:id", authHandler,TransactionController.DeleteTranscation);

export default router;
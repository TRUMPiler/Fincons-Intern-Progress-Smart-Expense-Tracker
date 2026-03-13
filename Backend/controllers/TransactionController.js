import TransactionService from "../services/TransactionService.js";
import Response from "../utils/Response.js";

class TransactionController {
  async CreateTranscation(req, res, next) {
    try {
      const userId = req.userId || req.body.userId;
      const transaction = req.body;
      const created = await TransactionService.CreateTranscation(transaction, userId);
      res.status(201).json(Response.success(created, "Transaction created", 201));
    } catch (error) {
      next(error);
    }
  }
  async GetAllTranscations(req, res, next) {
    try {
      const userId = req.params.userId;
      const all = await TransactionService.GetAllTranscations(userId);
      res.json(Response.success(all, "Transactions fetched", 200));
    } catch (error) {
      next(error);
    }
  }

  async DeleteTranscation(req, res, next) {
    try {
      const id = req.params.id;
      const userId = req.userId;
      const deleted = await TransactionService.DeleteTranscation(id, userId);
      res.json(Response.success(deleted, "Transaction deleted", 200));
    } catch (error) {
      next(error);
    }
  }

  async UpdateTranscation(req, res, next) {
    try {
      const id = req.params.id;
      const userId = req.userId || req.body.userId;
      const updatedTransaction = req.body;
      const updated = await TransactionService.UpdateTranscation(id, updatedTransaction, userId);
      res.json(Response.success(updated, "Transaction updated", 200));
    } catch (error) {
      next(error);
    }
  }

  async FilterTransactions(req, res, next) {
    try {
      const { userId, category, startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const results = await TransactionService.FilterTransactions(userId, category, start, end);
      res.json(Response.success(results, "Filtered transactions", 200));
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionController();

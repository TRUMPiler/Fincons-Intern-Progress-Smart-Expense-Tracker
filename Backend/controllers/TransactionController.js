import TransactionService from "../services/TransactionService.js";
import Response from "../utils/Response.js";

class TransactionController {
  /**
   * Create a new transaction for a user.
   * Triggers overspending and budget exceeded checks.
   * @async
   * @param {Object} req - Express request object with transaction data in body and userId from auth
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with created transaction (201)
   */
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
  /**
   * Retrieve transactions for a user within a specific month and year.
   * @async
   * @param {Object} req - Express request object with userId in params, month/year in query
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with transactions array (200)
   */
  async GetBasedOnDate(req, res, next) {
    try {
      const userId = req.params.userId;
      let month = req.query.month;
      let year = req.query.year;
      
      // -1 or undefined means use current month/year
      if (month == -1 || month === undefined) month = new Date().getMonth() + 1;
      if (year == -1 || year === undefined) year = new Date().getFullYear();
      console.log('GetAllTranscations - month:', month, 'year:', year);
      const all = await TransactionService.GetTranscationBasedOnDate(userId, month, year);
      res.json(Response.success(all, "Transactions fetched", 200));
    } catch (error) {
      next(error);
    }
  }
  /**
   * Retrieve all transactions for a user for an entire year.
   * @async
   * @param {Object} req - Express request object with userId in params, year in query
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with all transactions array (200)
   */
  async GetAllTranscation(req,res,next)
  {
    try{
      const userId=req.params.userId;
      let year = req.query.year;
      
      // -1 or undefined means use current year
      if (year == -1 || year === undefined) year = new Date().getFullYear();
      console.log('GetAllTranscation - year:', year);
      
      const data=await TransactionService.GetTranscationAll(userId, year);
      res.status(200).json(Response.success(data,"Sending all transcations",200));
    }catch(error)
    {
      next(error);
    }
  }
  /**
   * Soft delete a transaction by its ID.
   * @async
   * @param {Object} req - Express request object with transaction id in params and userId from auth
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with deleted transaction (200)
   */
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

  /**
   * Update an existing transaction with new data.
   * @async
   * @param {Object} req - Express request object with transaction id in params, updated data in body, userId from auth
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with updated transaction (200)
   */
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

  /**
   * Filter transactions by user, category, and date range.
   * @async
   * @param {Object} req - Express request object with userId, category, startDate, endDate in query
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with filtered transactions array (200)
   */
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

import BudgetService from "../services/BudgetService.js";
import Response from "../utils/Response.js";

class BudgetController {
  /**
   * Create a new budget for a user.
   * @async
   * @param {Object} req - Express request object with budget data in body and userId from auth
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with created budget (201)
   */
  async CreateBudget(req, res, next) {
    try {
      const userId = req.userId || req.body.userId;
      const created = await BudgetService.CreateBudget(req.body, userId);
      res.status(201).json(Response.success(created, "Budget created", 201));
    } catch (error) {
      next(error);
    }
  }
  /**
   * Retrieve all unique month/year combinations for a user's budgets.
   * @async
   * @param {Object} req - Express request object with userId in params
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with month/year array (200)
   */
  async GetMonths(req,res,next)
  {
    try{
      const data=await BudgetService.getBudgetMonths(req.params.userId);
      return res.status(200).json(Response.success(data,"Budget Months Retrived Successfull",200));
    }catch(exception)
    {
      next(exception);
    }
  }
  /**
   * Update an existing budget with new limit and settings.
   * @async
   * @param {Object} req - Express request object with budget id in params and updated data in body
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with updated budget (200)
   */
  async UpdateBudget(req, res, next) {
    try {
      const id = req.params.id;
      const updated = await BudgetService.UpdateBudget(id, req.body);
      res.json(Response.success(updated, "Budget updated", 200));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve all budgets for a user in a specific month and year.
   * @async
   * @param {Object} req - Express request object with userId, month, year in query
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with budgets array (200)
   */
  async GetBudgets(req, res, next) {
    try {
      const userId = req.query.userId;
      const month=req.query.month==0?(new Date().getMonth()+1):(req.query.month);
      const year=req.query.year==0?new Date().getFullYear():req.query.year;
      // console.log(mon)
      const budgets = await BudgetService.GetBudgets(userId,month,year);
      res.json(Response.success(budgets, "Budgets fetched", 200));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve a specific budget for a user's category.
   * @async
   * @param {Object} req - Express request object with userId, categoryId, month, year in query
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with budget object (200)
   */
  async GetBudgetByCategory(req, res, next) {
    try {
      const { userId, categoryId, month, year } = req.query;
      const budget = await BudgetService.GetBudgetByCategory(userId, categoryId, parseInt(month), parseInt(year));
      res.json(Response.success(budget, "Budget fetched", 200));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete a budget by its ID.
   * @async
   * @param {Object} req - Express request object with budget id in params
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with deleted budget (200)
   */
  async DeleteBudget(req, res, next) {
    try {
      const id = req.params.id;
      const deleted = await BudgetService.DeleteBudget(id);
      res.json(Response.success(deleted, "Budget deleted", 200));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate budget usage (spent vs remaining) for a category in a specific month.
   * @async
   * @param {Object} req - Express request object with userId, categoryId, month, year in query
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with budget usage data (limit, spent, remaining) (200)
   */
  async GetBudgetUsage(req, res, next) {
    try {
      const { userId, categoryId, month, year } = req.query;
      const usage = await BudgetService.GetBudgetUsage(userId, categoryId, parseInt(month), parseInt(year));
      res.json(Response.success(usage, "Budget usage fetched", 200));
    } catch (error) {
      next(error);
    }
  }
}

export default new BudgetController();

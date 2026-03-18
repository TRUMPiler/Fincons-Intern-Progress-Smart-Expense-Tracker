import ChartService from "../services/ChartsService.js";
import Response from "../utils/Response.js";

class ChartController {
    /**
     * Get income vs expense breakdown for a specific month and year.
     * @async
     * @param {Object} req - Express request object with userId in params, month/year in query
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with income/expense aggregation (200)
     */
    async getIncomeExpense(req, res, next) {
        try {
            const userId = req.params.userId;
            const month = req.query.month == 0 ? (new Date().getMonth() + 1) : req.query.month;
            const year = req.query.year == 0 ? new Date().getFullYear() : req.query.year;
            const result = await ChartService.IncomeExpense(userId, month, year);

            return res.status(200).json(Response.success(result, "Transactions aggregated", 200));
        } catch (error) {
            next(error);
        }
    }
    /**
     * Get predicted expense for next month based on spending patterns.
     * @async
     * @param {Object} req - Express request object with userId in params
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with predicted expense amount (200)
     */
    async getPredictedExpense(req,res,next)
    {
        try{
              const userId = req.params.userId;
          const data=await ChartService.PredictedExpense(userId);
          res.status(200).json(Response.success(data,"Predicted Expense Sent",200));
        
        }catch(error)
        {
            next(error);
        }
    }
    /**
     * Get spending breakdown by category for a specific month and year.
     * @async
     * @param {Object} req - Express request object with userId in params, month/year in query
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with category-wise spending data (200)
     */
    async CategoryWiseSpending(req,res,next)
    {
        try{
            const month = req.query.month == 0 ? (new Date().getMonth() + 1) : req.query.month;
            const year = req.query.year == 0 ? new Date().getFullYear() : req.query.year;
            const data=await ChartService.CategorywiseSpendingChart(req.params.userId, month, year);
            res.status(200).json(Response.success(data,"Spending Sent",200));
        }catch(error)
        {
            next(error)
        }
    }
    /**
     * Get budget usage metrics for all categories in a specific month.
     * @async
     * @param {Object} req - Express request object with userId in params, month/year in query
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with budget data for month (200)
     */
    async MonthlyBudget(req,res,next)
    {   
        try{
            const month = req.query.month == 0 ? (new Date().getMonth() + 1) : req.query.month;
            const year = req.query.year == 0 ? new Date().getFullYear() : req.query.year;
            const data=await ChartService.MonthlyBudget(req.params.userId, month, year);
             res.status(200).json(Response.success(data,"Spending Sent",200));
        }catch(error)
        {
            next(error);
        }
    }
    /**
     * Calculate financial health score based on spending patterns, savings, and budget adherence.
     * @async
     * @param {Object} req - Express request object with userId, month, year in query
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with health score, label, and breakdown (200)
     */
    async FinancialHealthReview(req,res,next)
    {
        try{
            const data=await ChartService.getFinancialHealthScore(req.query.userId,req.query.month,req.query.year);
            console.log(data);
            return res.status(200).json(Response.success(data,"Financial Health Retrived",200));
        }catch(error)
        {
            next(error);
        }
    }
    /**
     * Retrieve all available months for which user has transactions or budgets.
     * @async
     * @param {Object} req - Express request object with userId in params
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with available months array (200)
     */
    async getAvailableMonths(req,res,next)
    {
        try{
            const userId = req.params.userId;
            const data = await ChartService.getAvailableMonths(userId);
            return res.status(200).json(Response.success(data,"Available months retrieved",200));
        }catch(error)
        {
            next(error);
        }
    }

    /**
     * Retrieve all available years for which user has transactions or budgets.
     * @async
     * @param {Object} req - Express request object with userId in params
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with available years array (200)
     */
    async getAvailableYears(req,res,next)
    {
        try{
            const userId = req.params.userId;
            const data = await ChartService.getAvailableYears(userId);
            return res.status(200).json(Response.success(data,"Available years retrieved",200));
        }catch(error)
        {
            next(error);
        }
    }
}
export default new ChartController();
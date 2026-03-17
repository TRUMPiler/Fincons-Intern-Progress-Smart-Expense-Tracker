import ChartService from "../services/ChartsService.js";
import Response from "../utils/Response.js";

class ChartController {
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
}

export default new ChartController();
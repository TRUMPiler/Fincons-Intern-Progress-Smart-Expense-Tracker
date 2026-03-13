import ChartService from "../services/ChartsService.js";
import Response from "../utils/Response.js";

class ChartController {
    async getIncomeExpense(req, res, next) {
        try {
            const userId = req.params.userId;
            const result = await ChartService.IncomeExpense(userId);

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
            const data=await ChartService.CategorywiseSpendingChart(req.params.userId);
            res.status(200).json(Response.success(data,"Spending Sent",200));
        }catch(error)
        {
            next(error)
        }
    }
    async MonthlyBudget(req,res,next)
    {   
        try{
            const data=await ChartService.MonthlyBudget(req.params.userId);
             res.status(200).json(Response.success(data,"Spending Sent",200));
        }catch(error)
        {
            next(error);
        }
    }
}

export default new ChartController();
import BudgetService from "../services/BudgetService.js";
import Response from "../utils/Response.js";

class BudgetController {
  async CreateBudget(req, res, next) {
    try {
      const userId = req.userId || req.body.userId;
      const created = await BudgetService.CreateBudget(req.body, userId);
      res.status(201).json(Response.success(created, "Budget created", 201));
    } catch (error) {
      next(error);
    }
  }
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
  async UpdateBudget(req, res, next) {
    try {
      const id = req.params.id;
      const updated = await BudgetService.UpdateBudget(id, req.body);
      res.json(Response.success(updated, "Budget updated", 200));
    } catch (error) {
      next(error);
    }
  }

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

  async GetBudgetByCategory(req, res, next) {
    try {
      const { userId, categoryId, month, year } = req.query;
      const budget = await BudgetService.GetBudgetByCategory(userId, categoryId, parseInt(month), parseInt(year));
      res.json(Response.success(budget, "Budget fetched", 200));
    } catch (error) {
      next(error);
    }
  }

  async DeleteBudget(req, res, next) {
    try {
      const id = req.params.id;
      const deleted = await BudgetService.DeleteBudget(id);
      res.json(Response.success(deleted, "Budget deleted", 200));
    } catch (error) {
      next(error);
    }
  }

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

import CategoryService from "../services/CategoryService.js";
import Response from "../utils/Response.js";

class CategoryController {
  async CreateCategory(req, res, next) {
    try {
      const created = await CategoryService.CreateCategory(req.body);
      res.status(201).json(Response.success(created, "Category created", 201));
    } catch (error) {
      next(error);
    }
  }

  async UpdateCategory(req, res, next) {
    try {
      const id = req.params.id;
      const { name } = req.body;
      const updated = await CategoryService.UpdateCategory(name, id);
      res.json(Response.success(updated, "Category updated", 200));
    } catch (error) {
      next(error);
    }
  }

  async GetAllCategories(req, res, next) {
    try {
      const { userId } = req.query;

      console.log(userId);
      const categories = await CategoryService.GetCategories(userId);
      res.json(Response.success(categories, "Categories fetched", 200));
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();

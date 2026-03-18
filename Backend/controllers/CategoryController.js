import CategoryService from "../services/CategoryService.js";
import Response from "../utils/Response.js";

class CategoryController {
  /**
   * Create a new expense category.
   * @async
   * @param {Object} req - Express request object with category data (name, userId) in body
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with created category (201)
   */
  async CreateCategory(req, res, next) {
    try {
      const created = await CategoryService.CreateCategory(req.body);
      res.status(201).json(Response.success(created, "Category created", 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing category's name.
   * @async
   * @param {Object} req - Express request object with category id in params and new name in body
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with updated category (200)
   */
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

  /**
   * Retrieve all categories (default and user-created) for a user.
   * @async
   * @param {Object} req - Express request object with userId in query
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void} JSON response with categories array (200)
   */
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

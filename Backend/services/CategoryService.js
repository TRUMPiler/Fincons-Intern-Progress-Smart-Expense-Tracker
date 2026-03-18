import Category from "../models/Category.js";

class CategoryService {

  /**
   * Create a new expense category (user-defined or default).
   * Prevents duplicate categories with same name for user or system-wide.
   * @async
   * @param {Object} userCategory - Category object with name, userId (optional), isDefault (optional)
   * @returns {Promise<Object>} The created category document
   * @throws {Error} If category already exists or creation fails
   */
  async CreateCategory(userCategory) {
    try {

      const existingCategory = await Category.findOne({
        name: userCategory.name,
        $or: [
          { isDefault: true },
          { userId: userCategory.userId }
        ]
      });

      if (existingCategory) {
        throw new Error("Category already exists");
      }

      const newCategory = new Category(userCategory);

      await newCategory.save();

      return newCategory;

    } catch (err) {
      throw err;
    }
  }

  /**
   * Update an existing category's name by ID.
   * @async
   * @param {string} name - The new category name
   * @param {string} categoryID - The category ID to update
   * @returns {Promise<Object>} MongoDB update result object
   * @throws {Error} If update fails
   */
  async UpdateCategory(name, categoryID) {
    try {

      const updated = await Category.updateOne(
        { _id: categoryID },
        { name }
      );

      return updated;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieve all categories accessible to a user.
   * Returns system default categories and user-created categories.
   * Results are sorted alphabetically by name.
   * @async
   * @param {string} userId - The ID of the user (optional for default-only retrieval)
   * @returns {Promise<Array>} Array of category objects
   * @throws {Error} If retrieval fails
   */
  async GetCategories(userId) {
    try {
      if (userId) {
        return await Category.find({
          $or: [{ isDefault: true }, { userId: userId }]
        }).sort({ name: 1 });
      }

      return await Category.find({ isDefault: true }).sort({ name: 1 });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Ensure all default expense categories exist in the database.
   * Creates any missing default categories like Food, Transport, Shopping, etc.
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If category creation fails
   */
  async ensureDefaultCategories() {
    try {
      const defaults = [
        "Food",
        "Transport",
        "Shopping",
        "Bills",
        "Entertainment",
        "Health",
      ];

      for (const name of defaults) {
        const exists = await Category.findOne({ name, isDefault: true });
        if (!exists) {
          const cat = new Category({ name, isDefault: true });
          await cat.save();
        }
      }
    } catch (err) {
      console.error("Error ensuring default categories", err);
      throw err;
    }
  }
}


export default new CategoryService();
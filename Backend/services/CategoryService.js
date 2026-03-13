import Category from "../models/Category.js";

class CategoryService {

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
import express from "express";
import CategoryController from "../controllers/CategoryController.js";
import authHandler from "../middleware/Authentication.js";

const router = express.Router();

router.get("/", authHandler,CategoryController.GetAllCategories);
router.post("/", authHandler,CategoryController.CreateCategory);
router.put("/:id", authHandler,CategoryController.UpdateCategory);

export default router;

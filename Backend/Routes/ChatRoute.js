import express from "express";
import CategoryController from "../controllers/ChatController.js";
import authHandler from "../middleware/Authentication.js";
import ChatController from "../controllers/ChatController.js";

const router = express.Router();


router.post("/", authHandler,CategoryController.SendChat);
router.get("/first/:id", authHandler,ChatController.FirstChat);
router.get("/:userId", authHandler,ChatController.GetChats);


export default router;

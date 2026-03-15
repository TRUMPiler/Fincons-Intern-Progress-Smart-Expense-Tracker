import express from "express";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

router.post("/refresh", AuthController.RefreshToken);
router.post("/verify-refresh", AuthController.VerifyRefreshToken);
router.post("/logout", AuthController.Logout);

export default router;

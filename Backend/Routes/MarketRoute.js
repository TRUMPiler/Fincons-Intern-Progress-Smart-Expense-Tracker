import express from "express";
import MarketController from "../controllers/MarketController.js";

const router = express.Router();

router.get('/overview', MarketController.Overview);

export default router;

import AlertController from "../controllers/AlertController.js";
import authHandler from "../middleware/Authentication.js";
import express from 'express';
const router = express.Router();
router.use(authHandler);
console.log("alerts");
router.get("/:userId",AlertController.GetAlert);
router.put("/:AlertId",AlertController.updateAlert);

export default router;
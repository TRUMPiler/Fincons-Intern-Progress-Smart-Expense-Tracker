import express from "express";
import cronjob from "../services/cronjob";


const router = express.Router();

router.get("/", cronjob.SendReq);

export default router;

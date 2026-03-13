import express from "express";
import UserController from "../controllers/UserController.js";

const routes = express.Router();
console.log("User routes loaded");

routes.post("/", UserController.Login);
routes.post("/register", UserController.Register);
routes.get("/verify/:id", UserController.verify);

export default routes;
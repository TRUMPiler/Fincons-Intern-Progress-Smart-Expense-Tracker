import express from "express";
import UserController from "../controllers/UserController.js";
import authHandler from "../middleware/Authentication.js";

const routes = express.Router();
console.log("User routes loaded");

routes.post("/", UserController.Login);
routes.post("/register", UserController.Register);
routes.get("/verify/:id", UserController.verify);
// Protected endpoints for profile management
routes.get("/profile", authHandler, UserController.GetProfile);
routes.put("/profile", authHandler, UserController.UpdateProfile);

export default routes;
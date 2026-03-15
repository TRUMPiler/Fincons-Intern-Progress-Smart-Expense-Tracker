import express from "express";
import { DBconfig } from "./config/config.js";
import cookieParser from "cookie-parser";

import userRoutes from "./Routes/UserRoute.js";
import authRoutes from "./Routes/AuthRoute.js";
import chatsRoutes from './Routes/ChatRoute.js'
import categoryRoutes from "./Routes/CategoryRoute.js";
import transcationRoutes from "./Routes/TranscationRoute.js";
import budgetRoutes from "./Routes/BudgetRoute.js";
import Error from "./middleware/ErrorHandling.js";
import cors from "cors";
import CategoryService from "./services/CategoryService.js";
import ChartRoute from './Routes/ChartRoute.js';
import CronJobRouter from './Routes/CronJobRoute.js'
import AlertRoute from './Routes/AlertRoute.js';
import { seedTransactions } from "./SeederJunction.js";

const app = express();
const Port = process.env.PORT || 3000;
const db = new DBconfig();

app.use(express.json());

// CORS configuration for token refresh with credentials
app.use(cors({
//   origin: 'https://smart-expense-tracker-xi-seven.vercel.app',
    origin:"https://smart-expense-tracker-xi-seven.vercel.app",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/cronJob",CronJobRouter);
app.use("/api/chats",chatsRoutes)
app.use("/api/user", userRoutes);
app.use("/api/alert",AlertRoute);
app.use("/api/category", categoryRoutes);
app.use("/api/transcation", transcationRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/charts",ChartRoute);

app.use(Error);

(async function start() {
    try {
        await db.connect();
        await CategoryService.ensureDefaultCategories();
        app.listen(Port, async() => {
            console.log("Server is listening at http://localhost:" + Port);
            // await seedTransactions();
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();

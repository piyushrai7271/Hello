import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { globalRateLimiter } from "./middlewares/rateLimiter.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { corsOptions } from "./config/cors.js"; // ✅ IMPORT

const app = express();

// ✅ USE SHARED CORS CONFIG
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// trust proxy (very important in production)
app.set("trust proxy", 1);

app.use(globalRateLimiter);

// import routes
import userRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

// global error handler
app.use(errorMiddleware);

export default app;
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalRateLimiter } from "./middlewares/rateLimiter.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { corsOptions } from "./config/cors.js"; // ✅ IMPORT

const app = express();

// trust proxy (very important in production)
app.set("trust proxy", 1);

// ✅ USE SHARED CORS CONFIG
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// global rate limiter
app.use(globalRateLimiter);

// import routes
import userRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// global error handler
app.use(errorMiddleware);

export default app;
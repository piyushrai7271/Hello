import express from "express";
import {errorMiddleware} from "./middlewares/error.middleware.js";
const app = express();

import userRouter from "./routes/auth.routes.js";

app.use("/api/user", userRouter);


// global error handler
app.use(errorMiddleware);

export default app;

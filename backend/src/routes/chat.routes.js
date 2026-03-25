import express from "express";
import jwtValidation from "../middlewares/auth.middleware.js";
import {
  getChatMessages,
  getUserChats,
  createNewChat
} from "../controllers/chat.controller.js";
const router = express.Router();

router.get("/messages/:chatId", jwtValidation, getChatMessages);
router.get("/allMessages", jwtValidation, getUserChats);
router.post("/create-new-chat",jwtValidation,createNewChat);

export default router;

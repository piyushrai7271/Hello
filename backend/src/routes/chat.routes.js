import express from "express";
import jwtValidation from "../middlewares/auth.middleware.js";
import { userRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { upload } from "../config/cloudinary.js";
import {
  getChatMessages,
  getUserChats,
  createNewChat,
  uploadMessageFile,
  getSharedMedia,
  getSharedFiles,
} from "../controllers/chat.controller.js";
const router = express.Router();

router.get("/messages/:chatId", jwtValidation, getChatMessages);
router.get("/allMessages", jwtValidation, getUserChats);
router.post("/create-new-chat", jwtValidation, userRateLimiter, createNewChat);
router.post(
  "/upload-message-file",
  jwtValidation,
  userRateLimiter,
  upload.single("message"),
  uploadMessageFile
);

router.get("/:chatId/media", jwtValidation, getSharedMedia);
router.get("/:chatId/files", jwtValidation, getSharedFiles);

export default router;

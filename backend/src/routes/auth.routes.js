import express from "express";
import {registerUser,loginUser,logOut} from "../controllers/auth.controller.js";
const router = express.Router();


router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logOut);


export default router;
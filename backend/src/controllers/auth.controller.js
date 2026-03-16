import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../middlewares/error.middleware.js";


const registerUser = async(req,res)=>{
    res.send("This is register page")
}
const loginUser = async(req,res) =>{
    res.send("This is login page")
}
const logOut = async(req,res)=>{
    res.send("This is logout page")
}

export {
    registerUser,
    loginUser,
    logOut
}
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      "somthing went worng while generating access and refresh token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // take input from body
  const { fullName, email, mobileNumber, bio, gender, password } = req.body;

  // validate comming input
  if (!fullName || !email || !mobileNumber || !bio || !gender || !password) {
    throw new ApiError(404, "Please provide all the required field");
  }

  // check gender match or not
  if (!["Male", "Female", "Other"].includes(gender)) {
    throw new ApiError(400, "Please provide valid gender");
  }

  // check if user already exist with that email if not than only create user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "user already exist with this email");
  }

  // creating user if already not exist
  const user = await User.create({
    fullName,
    email,
    mobileNumber,
    bio,
    gender,
    password, // password is hashed in model
  });

  // fetch created user without sensitive data
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong");
  }

  // return success response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  // take login details
  const { email, password } = req.body;

  // validate comming input
  if (!email || !password) {
    throw new ApiError(400, "email or password is missing");
  }

  // find user with email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found !!");
  }

  // if user found validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Please provide valid password");
  }

  // if password is correct generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // handle cookie options to send token inside it
  const isProduction = process.env.NODE_DEV === "PRODUCTION";

  const accessTokenOption = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  };

  const refreshTokenOption = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  // removing password and refreshToken from user before sending
  user.password = undefined;
  user.refreshToken = undefined;

  // return response with token
  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOption)
    .cookie("refreshToken", refreshToken, refreshTokenOption)
    .json(new ApiResponse(200, user, "User logged in successfully !!"));
});
const logOut = asyncHandler(async (req, res) => {
  // take user from middleware
  const user = req.user;

  // check user is there or not
  if (!user) {
    throw new ApiError(404, "User is not found");
  }

  // Invalidate refreshToken in db
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  // cleare cookies of access and refresh token with response
  const isProduction = process.env.NODE_ENV === "PRODUCTION";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  // clear cookies
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully !!"));
});
const changePassword = asyncHandler(async (req, res) => {
  // take input currentPassword, newPassword, confirmPassword
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.userId;

  // validate comming input
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "Please provide all the required field");
  }

  // user id from middleware
  if (!userId) {
    throw new ApiError(401, "Unauthorized access !!");
  }

  // check that newPassword and confirmPassword is equal or not
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "newPassword is not equal to confirm password");
  }

  // find user with userId using middleware
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found with user id");
  }

  // check current password is good or not
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is invalid");
  }
  // if current password is correct than update the password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  //return response
  return res
    .status(200)
    .json(new ApiResponse(200,{}, "Password is changed successfully !!"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  // token comming from cookies or body
  const incommingRefreshToken =
    req.cookie?.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorize access");
  }
  try {
    // decoding token with jwt
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(402, "Decoded token is not comming");
    }

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(404, "Invalid refreshToken");
    }

    // compair saved refreshToken with incomming refreshToken
    if (incommingRefreshToken !== user.refreshToken) {
      throw new ApiError(405, "Refresh token is expired or used");
    }

    // generating new refresh and access token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // handle cookie options to send token inside it
    const isProduction = process.env.NODE_DEV === "PRODUCTION";

    const accessTokenOption = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    };

    const refreshTokenOption = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // return response
    return res
      .status(200)
      .cookie("accessToken", accessToken, accessTokenOption)
      .cookie("refreshToken", refreshToken, refreshTokenOption)
      .json(new ApiResponse(200, {}, "Access token refreshed !!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error !!"));
  }
});
const getUserDetails = asyncHandler(async (req, res) => {
  // comming from middleware
  const userId = req.userId;

  // validate userId
  if (!userId) {
    throw new ApiError(401, "UserId not found");
  }

  // find user with userId
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found !!");
  }

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        bio: user.bio,
        avatar: user.avatar,
      },
      "User data fetched successfully !!"
    )
  );
});
const addAvatar = asyncHandler(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized user !!");
  }

  if (!req.file) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Upload to Cloudinary
  const uploadResult = await uploadOnCloudinary(req.file, "avatars");

  if (!uploadResult) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const avatarUrl = uploadResult.secure_url;
  const public_id = uploadResult.public_id;

  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete old avatar (if exists)
  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  // Update user avatar
  user.avatar = {
    url: avatarUrl,
    public_id: public_id,
  };

  await user.save();

  // Send response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        avatar: user.avatar,
      },
      "Avatar updated successfully"
    )
  );
});
const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized user !!");
  }

  if (!req.file) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Store old public_id (for later deletion)
  const oldPublicId = user.avatar?.public_id;

  // Upload new avatar FIRST (safe step)
  const uploadResult = await uploadOnCloudinary(req.file, "avatars");

  if (!uploadResult) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  // Update DB with new avatar
  user.avatar = {
    url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };

  await user.save();

  // Delete old avatar (AFTER success)
  if (oldPublicId) {
    try {
      await deleteFromCloudinary(oldPublicId);
    } catch (error) {
      console.error("Old avatar deletion failed:", error);
      // ❗ Don't throw error (user already updated)
    }
  }

  // Response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { avatar: user.avatar },
        "Avatar updated successfully"
      )
    );
});
const deleteAvatar = asyncHandler(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized user !!");
  }

  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if avatar exists
  if (!user.avatar?.public_id) {
    throw new ApiError(400, "No avatar to delete");
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(user.avatar.public_id);

  // Remove from DB
  user.avatar = {
    url: "",
    public_id: "",
  };

  await user.save();

  // Response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Avatar deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logOut,
  changePassword,
  refreshAccessToken,
  getUserDetails,
  addAvatar,
  updateAvatar,
  deleteAvatar,
};

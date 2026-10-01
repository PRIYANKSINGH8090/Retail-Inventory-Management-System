import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";

// Reads the token from the Authorization header (Bearer) or the accessToken cookie
export const verifyJWT = asyncHandler(async (req, _res, next) => {
    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    const token = headerToken || req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized request. Please login.");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Session expired. Please login again.");
    }

    const user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
});

export const authorizeRoles = (...roles) => (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return next(new ApiError(403, "You are not allowed to do this"));
    }
    next();
};

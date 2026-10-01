
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

const registerUser = asyncHandler(async (req, res) => {
    const {
        fullName,
        username,
        email,
        password,
        role
    } = req.body;

    console.log("email:", email);

    if (
        [fullName, email, username, password, role].some(
            (field) => !field?.trim()
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [
            { username: username.toLowerCase().trim() },
            { email: email.toLowerCase().trim() }
        ]
    });

    if (existedUser) {
        throw new ApiError(409, "User already existed");
    }

    const user = await User.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password,
        username: username.toLowerCase().trim(),
        role: role.toLowerCase().trim()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Error occurred while registering the user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const {
        username,
        email,
        password
    } = req.body;

    if (!username && !email) {
        throw new ApiError(
            400,
            "Username or email is required"
        );
    }

    if (!password) {
        throw new ApiError(
            400,
            "Password is required"
        );
    }

    const userPresent = await User.findOne({
        $or: [
            ...(username
                ? [{ username: username.toLowerCase().trim() }]
                : []),
            ...(email
                ? [{ email: email.toLowerCase().trim() }]
                : [])
        ]
    });

    if (!userPresent) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const passCheck = await userPresent.isPasswordCorrect(password);

    if (!passCheck) {
        throw new ApiError(
            401,
            "Incorrect password"
        );
    }

    const accessToken = userPresent.generateAccessToken();
    const refreshToken = userPresent.generateRefreshToken();

    userPresent.refreshToken = refreshToken;

    await userPresent.save({
        validateBeforeSave: false
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    return res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        user: {
            id: userPresent._id,
            fullName: userPresent.fullName,
            email: userPresent.email,
            username: userPresent.username,
            role: userPresent.role
        }
    });
});

const getMe = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Profile fetched")
    );
});

const updateMe = asyncHandler(async (req, res) => {
    const fullName = req.body.fullName?.trim();

    if (!fullName) {
        throw new ApiError(400, "Full name is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated")
    );
});

const addAddress = asyncHandler(async (req, res) => {
    const { label, fullName, phone, line1, city, state, pincode } = req.body;

    if ([fullName, phone, line1, city, state, pincode].some((f) => !String(f || "").trim())) {
        throw new ApiError(400, "Name, phone, address, city, state and pincode are required");
    }

    const user = await User.findById(req.user._id);

    user.addresses.push({
        label: label?.trim() || "Home",
        fullName,
        phone,
        line1,
        city,
        state,
        pincode,
        isDefault: user.addresses.length === 0
    });

    await user.save();

    return res.status(201).json(
        new ApiResponse(201, user.addresses, "Address added")
    );
});

const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user.addresses, "Address deleted")
    );
});

const setDefaultAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user.addresses.id(req.params.addressId)) {
        throw new ApiError(404, "Address not found");
    }

    user.addresses.forEach((a) => {
        a.isDefault = a._id.toString() === req.params.addressId;
    });

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user.addresses, "Default address updated")
    );
});

export {
    registerUser,
    loginUser,
    getMe,
    updateMe,
    addAddress,
    deleteAddress,
    setDefaultAddress
};


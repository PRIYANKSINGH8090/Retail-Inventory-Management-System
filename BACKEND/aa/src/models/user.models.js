import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        role: {
            type: String,
            required: true,
            enum: ["admin", "staff", "customer"]
        },

        password: {
            type: String,
            required: [true, "Password is required"]
        },

        refreshToken: {
            type: String
        },

        addresses: [
            {
                label: { type: String, trim: true, default: "Home" },
                fullName: { type: String, trim: true, required: true },
                phone: { type: String, trim: true, required: true },
                line1: { type: String, trim: true, required: true },
                city: { type: String, trim: true, required: true },
                state: { type: String, trim: true, required: true },
                pincode: { type: String, trim: true, required: true },
                isDefault: { type: Boolean, default: false }
            }
        ]
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);
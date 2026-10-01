import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        supplierEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        mfg: {
            type: Date,
            required: true
        },

        exp: {
            type: Date
        },

        categoryId: {
            type: String,
            required: true,
            trim: true
        },

        cost: {
            type: Schema.Types.Decimal128,
            required: true
        },

        productDesc: {
            type: String,
            trim: true
        },

        image: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", productSchema);
import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        minimumQuantity: {
            type: Number,
            required: true,
            default: 15,
            min: 0
        }
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        }
    }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);
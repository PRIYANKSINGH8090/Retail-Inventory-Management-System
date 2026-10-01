import mongoose, { Schema } from "mongoose";

export const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
export const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];
export const PAYMENT_METHODS = ["UPI", "Card", "COD"];

const orderItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 }
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        orderNumber: { type: String, required: true, unique: true },

        customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },

        items: { type: [orderItemSchema], required: true },

        totalAmount: { type: Number, required: true, min: 0 },

        shippingAddress: {
            label: String,
            fullName: String,
            phone: String,
            line1: String,
            city: String,
            state: String,
            pincode: String
        },

        paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
        paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "Pending" },

        status: { type: String, enum: ORDER_STATUSES, default: "Pending", index: true }
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

import mongoose, { Schema } from "mongoose";

export const PO_STATUSES = ["Ordered", "Received", "Cancelled"];

const poItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitCost: { type: Number, required: true, min: 0 }
    },
    { _id: false }
);

const purchaseOrderSchema = new Schema(
    {
        poNumber: { type: String, required: true, unique: true },
        supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
        supplierName: { type: String, required: true },
        supplierEmail: { type: String, required: true },
        items: { type: [poItemSchema], required: true },
        totalCost: { type: Number, required: true, min: 0 },
        status: { type: String, enum: PO_STATUSES, default: "Ordered" },
        receivedAt: { type: Date }
    },
    { timestamps: true }
);

export const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

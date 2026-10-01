import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Supplier } from "../models/supplier.models.js";
import { Product } from "../models/product.models.js";
import { Inventory } from "../models/inventory.models.js";
import { PurchaseOrder } from "../models/purchasing.models.js";

const getSuppliers = asyncHandler(async (_req, res) => {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, suppliers, "Suppliers fetched"));
});

const getPurchaseOrders = asyncHandler(async (_req, res) => {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, "Purchase orders fetched"));
});

const createPurchaseOrder = asyncHandler(async (req, res) => {
    const { supplierId, items } = req.body;

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        throw new ApiError(400, "Choose a supplier");
    }
    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Add at least one product");
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new ApiError(404, "Supplier not found");

    const lines = [];

    for (const item of items) {
        const qty = Number(item.quantity);

        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
            throw new ApiError(400, "Invalid product");
        }
        if (!Number.isInteger(qty) || qty < 1) {
            throw new ApiError(400, "Quantity must be a positive whole number");
        }

        const product = await Product.findById(item.productId);
        if (!product) throw new ApiError(404, "Product not found");

        if (product.supplierEmail !== supplier.email) {
            throw new ApiError(400, `"${product.name}" does not belong to this supplier`);
        }

        // Unit cost: use what was typed, otherwise the product's current cost
        const typed = Number(item.unitCost);
        const unitCost =
            item.unitCost !== undefined && item.unitCost !== "" && typed >= 0
                ? typed
                : Number(product.cost.toString());

        lines.push({ productId: product._id, name: product.name, quantity: qty, unitCost });
    }

    const order = await PurchaseOrder.create({
        poNumber:
            "PO-" +
            Date.now().toString(36).toUpperCase() +
            Math.floor(Math.random() * 36).toString(36).toUpperCase(),
        supplier: supplier._id,
        supplierName: supplier.name,
        supplierEmail: supplier.email,
        items: lines,
        totalCost: lines.reduce((s, l) => s + l.unitCost * l.quantity, 0)
    });

    return res.status(201).json(new ApiResponse(201, order, "Purchase order created"));
});

// Mark received -> stock goes up in inventory
const receivePurchaseOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid purchase order ID");

    // Only one request can flip Ordered -> Received, so stock is never added twice
    const order = await PurchaseOrder.findOneAndUpdate(
        { _id: id, status: "Ordered" },
        { $set: { status: "Received", receivedAt: new Date() } },
        { new: true }
    );

    if (!order) {
        throw new ApiError(400, "Only purchase orders with status Ordered can be received");
    }

    for (const item of order.items) {
        await Inventory.updateOne(
            { productId: item.productId },
            { $inc: { quantity: item.quantity } },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Stock added to inventory"));
});

const cancelPurchaseOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid purchase order ID");

    const order = await PurchaseOrder.findOneAndUpdate(
        { _id: id, status: "Ordered" },
        { $set: { status: "Cancelled" } },
        { new: true }
    );

    if (!order) {
        throw new ApiError(400, "Only purchase orders with status Ordered can be cancelled");
    }

    return res.status(200).json(new ApiResponse(200, order, "Purchase order cancelled"));
});

export {
    getSuppliers,
    getPurchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    cancelPurchaseOrder
};

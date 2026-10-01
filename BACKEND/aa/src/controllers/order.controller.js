import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/cart.models.js";
import { Product } from "../models/product.models.js";
import { Inventory } from "../models/inventory.models.js";
import { User } from "../models/user.models.js";
import {
    Order,
    ORDER_STATUSES,
    PAYMENT_STATUSES,
    PAYMENT_METHODS
} from "../models/order.models.js";

const makeOrderNumber = () =>
    "ORD-" +
    Date.now().toString(36).toUpperCase() +
    Math.floor(Math.random() * 36).toString(36).toUpperCase();

// Put stock back (used when an order is cancelled or placing fails)
const restock = async (items) => {
    for (const item of items) {
        await Inventory.updateOne(
            { productId: item.productId },
            { $inc: { quantity: item.quantity } },
            { upsert: true }
        );
    }
};

// Cancel: restock + refund if it was already paid
const cancelOrder = async (order) => {
    await restock(order.items);
    order.status = "Cancelled";
    if (order.paymentStatus === "Paid") order.paymentStatus = "Refunded";
    else if (order.paymentStatus === "Pending") order.paymentStatus = "Failed";
    await order.save();
};

/* ---------------------------------- CUSTOMER ---------------------------------- */

const placeOrder = asyncHandler(async (req, res) => {
    const { addressId, paymentMethod } = req.body;

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
        throw new ApiError(400, "Choose a valid payment method");
    }

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);
    if (!address) throw new ApiError(400, "Choose a delivery address");

    const cart = await Cart.findOne({ user: user._id });
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Your cart is empty");
    }

    const products = await Product.find({
        _id: { $in: cart.items.map((i) => i.productId) }
    });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const lines = cart.items.map((item) => {
        const p = productMap.get(item.productId.toString());
        if (!p) throw new ApiError(400, "A product in your cart is no longer available");

        return {
            productId: p._id,
            name: p.name,
            image: p.image,
            price: Number(p.cost.toString()),
            quantity: item.quantity
        };
    });

    // Reduce stock one product at a time, only if enough is left
    const reserved = [];
    try {
        for (const line of lines) {
            const inv = await Inventory.findOneAndUpdate(
                { productId: line.productId, quantity: { $gte: line.quantity } },
                { $inc: { quantity: -line.quantity } },
                { new: true }
            );

            if (!inv) {
                throw new ApiError(
                    409,
                    `Not enough stock for "${line.name}". Please update your cart.`
                );
            }
            reserved.push(line);
        }

        const totalAmount = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

        const order = await Order.create({
            orderNumber: makeOrderNumber(),
            customer: user._id,
            customerName: user.fullName,
            customerEmail: user.email,
            items: lines,
            totalAmount,
            shippingAddress: {
                label: address.label,
                fullName: address.fullName,
                phone: address.phone,
                line1: address.line1,
                city: address.city,
                state: address.state,
                pincode: address.pincode
            },
            paymentMethod,
            // No real payment gateway: UPI/Card are recorded as Paid, COD stays Pending until delivery
            paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
            status: "Pending"
        });

        cart.items = [];
        await cart.save();

        return res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
    } catch (err) {
        await restock(reserved);
        throw err;
    }
});

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched"));
});

const cancelMyOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid order ID");

    const order = await Order.findOne({ _id: id, customer: req.user._id });
    if (!order) throw new ApiError(404, "Order not found");

    if (order.status !== "Pending") {
        throw new ApiError(400, "Only orders that are still Pending can be cancelled");
    }

    await cancelOrder(order);
    return res.status(200).json(new ApiResponse(200, order, "Order cancelled"));
});

/* ------------------------------- ADMIN / STAFF ------------------------------- */

const getAllOrders = asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const filter = {};

    if (status && ORDER_STATUSES.includes(status)) filter.status = status;

    if (search) {
        const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ orderNumber: rx }, { customerName: rx }, { customerEmail: rx }];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid order ID");
    if (!ORDER_STATUSES.includes(status)) throw new ApiError(400, "Invalid status");

    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.status === status) {
        return res.status(200).json(new ApiResponse(200, order, "Status unchanged"));
    }

    if (order.status === "Cancelled" || order.status === "Delivered") {
        throw new ApiError(400, `A ${order.status} order cannot be changed`);
    }

    if (status === "Cancelled") {
        await cancelOrder(order);
    } else {
        order.status = status;
        // Cash on delivery is collected when the order is delivered
        if (status === "Delivered" && order.paymentStatus === "Pending") {
            order.paymentStatus = "Paid";
        }
        await order.save();
    }

    return res.status(200).json(new ApiResponse(200, order, "Order status updated"));
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid order ID");
    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        throw new ApiError(400, "Invalid payment status");
    }

    const order = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    if (!order) throw new ApiError(404, "Order not found");

    return res.status(200).json(new ApiResponse(200, order, "Payment status updated"));
});

const getSales = asyncHandler(async (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const valid = { status: { $ne: "Cancelled" }, createdAt: { $gte: since } };

    const [totals, byStatus, topProducts, daily, recent] = await Promise.all([
        Order.aggregate([
            { $match: valid },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                    units: { $sum: { $sum: "$items.quantity" } }
                }
            }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Order.aggregate([
            { $match: valid },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    name: { $first: "$items.name" },
                    units: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]),
        Order.aggregate([
            { $match: valid },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Order.find(valid).sort({ createdAt: -1 }).limit(8)
    ]);

    const t = totals[0] || { revenue: 0, orders: 0, units: 0 };

    const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    byStatus.forEach((s) => (statusCounts[s._id] = s.count));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                days,
                revenue: t.revenue,
                orders: t.orders,
                units: t.units,
                averageOrderValue: t.orders ? t.revenue / t.orders : 0,
                statusCounts,
                topProducts: topProducts.map((p) => ({
                    productId: p._id,
                    name: p.name,
                    units: p.units,
                    revenue: p.revenue
                })),
                daily: daily.map((d) => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
                recent
            },
            "Sales fetched"
        )
    );
});

export {
    placeOrder,
    getMyOrders,
    cancelMyOrder,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getSales
};

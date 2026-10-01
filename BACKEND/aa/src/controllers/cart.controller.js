import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/cart.models.js";
import { Product } from "../models/product.models.js";
import { Inventory } from "../models/inventory.models.js";

const checkId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product ID");
    }
};

const getStock = async (productId) => {
    const inv = await Inventory.findOne({ productId });
    return inv ? inv.quantity : 0;
};

// Cart with product details + live stock
const buildCartResponse = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    const rawItems = cart?.items || [];

    const ids = rawItems.map((i) => i.productId);
    const [products, inventories] = await Promise.all([
        Product.find({ _id: { $in: ids } }),
        Inventory.find({ productId: { $in: ids } })
    ]);

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const stockMap = new Map(inventories.map((i) => [i.productId.toString(), i.quantity]));

    const items = [];

    for (const item of rawItems) {
        const p = productMap.get(item.productId.toString());
        if (!p) continue; // product deleted

        const price = Number(p.cost.toString());
        const stock = stockMap.get(item.productId.toString()) || 0;

        items.push({
            productId: item.productId,
            name: p.name,
            image: p.image,
            price,
            quantity: item.quantity,
            stock,
            subtotal: price * item.quantity
        });
    }

    const total = items.reduce((sum, i) => sum + i.subtotal, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);

    return { items, total, count };
};

const getCart = asyncHandler(async (req, res) => {
    const data = await buildCartResponse(req.user._id);
    return res.status(200).json(new ApiResponse(200, data, "Cart fetched"));
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const qty = Number(req.body.quantity || 1);

    checkId(productId);

    if (!Number.isInteger(qty) || qty < 1) {
        throw new ApiError(400, "Quantity must be a positive whole number");
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const stock = await getStock(productId);
    if (stock <= 0) throw new ApiError(400, "This product is out of stock");

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find((i) => i.productId.toString() === productId);
    const newQty = (existing ? existing.quantity : 0) + qty;

    if (newQty > stock) {
        throw new ApiError(400, `Only ${stock} left in stock`);
    }

    if (existing) existing.quantity = newQty;
    else cart.items.push({ productId, quantity: qty });

    await cart.save();

    const data = await buildCartResponse(req.user._id);
    return res.status(200).json(new ApiResponse(200, data, "Added to cart"));
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const qty = Number(req.body.quantity);

    checkId(productId);

    if (!Number.isInteger(qty)) {
        throw new ApiError(400, "Quantity must be a whole number");
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, "Cart is empty");

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) throw new ApiError(404, "Item not in cart");

    if (qty <= 0) {
        cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    } else {
        const stock = await getStock(productId);
        if (qty > stock) throw new ApiError(400, `Only ${stock} left in stock`);
        item.quantity = qty;
    }

    await cart.save();

    const data = await buildCartResponse(req.user._id);
    return res.status(200).json(new ApiResponse(200, data, "Cart updated"));
});

const removeCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    checkId(productId);

    await Cart.updateOne(
        { user: req.user._id },
        { $pull: { items: { productId } } }
    );

    const data = await buildCartResponse(req.user._id);
    return res.status(200).json(new ApiResponse(200, data, "Item removed"));
});

const clearCart = asyncHandler(async (req, res) => {
    await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    const data = await buildCartResponse(req.user._id);
    return res.status(200).json(new ApiResponse(200, data, "Cart cleared"));
});

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };

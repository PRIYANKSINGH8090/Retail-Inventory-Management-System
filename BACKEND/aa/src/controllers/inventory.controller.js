import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Inventory } from "../models/inventory.models.js";
import { Product } from "../models/product.models.js";
import { Cart } from "../models/cart.models.js";


// Get all products with inventory
const getInventorys = asyncHandler(async (req, res) => {

    // Get all products from Product model
    const products = await Product.find()
        .sort({ createdAt: -1 });


    // Get all inventory records
    const inventories = await Inventory.find();


    // Create map using productId
    const inventoryMap = new Map();

    inventories.forEach((item) => {

        inventoryMap.set(
            item.productId.toString(),
            item
        );

    });


    // Combine Product + Inventory
    const inventoryData = products.map((product) => {

        const inventory =
            inventoryMap.get(
                product._id.toString()
            );


        return {

            productId: product._id,

            name: product.name,

            supplierEmail: product.supplierEmail,

            categoryId: product.categoryId,

            cost: product.cost,

            image: product.image,

            mfg: product.mfg,

            exp: product.exp,

            productDesc: product.productDesc,

            quantity: inventory
                ? inventory.quantity
                : 0,

            minimumQuantity: inventory
                ? inventory.minimumQuantity
                : 15,

            inventoryId: inventory
                ? inventory._id
                : null

        };

    });


    return res.status(200).json(

        new ApiResponse(
            200,
            inventoryData,
            "Inventory fetched successfully"
        )

    );
});



// Update inventory
const updateInventory = asyncHandler(async (req, res) => {

    const { productId } = req.params;

    const {
        quantity,
        minimumQuantity
    } = req.body;


    // Check product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {

        throw new ApiError(
            400,
            "Invalid product ID"
        );

    }


    // Check product exists
    const product = await Product.findById(
        productId
    );


    if (!product) {

        throw new ApiError(
            404,
            "Product not found"
        );

    }


    const updateFields = {};


    if (quantity !== undefined) {

        if (Number(quantity) < 0) {

            throw new ApiError(
                400,
                "Quantity cannot be negative"
            );

        }

        updateFields.quantity =
            Number(quantity);

    }


    if (minimumQuantity !== undefined) {

        if (Number(minimumQuantity) < 0) {

            throw new ApiError(
                400,
                "Minimum quantity cannot be negative"
            );

        }

        updateFields.minimumQuantity =
            Number(minimumQuantity);

    }


    if (
        Object.keys(updateFields).length === 0
    ) {

        throw new ApiError(
            400,
            "Provide quantity or minimumQuantity"
        );

    }


    // Create inventory if it doesn't exist
    const inventory =
        await Inventory.findOneAndUpdate(

            {
                productId: productId
            },

            {
                $set: updateFields
            },

            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }

        );


    return res.status(200).json(

        new ApiResponse(
            200,
            inventory,
            "Inventory updated successfully"
        )

    );

});


// Remove product completely (catalogue + inventory + carts)
const removeProduct = asyncHandler(async (req, res) => {

    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {

        throw new ApiError(
            400,
            "Invalid product ID"
        );

    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {

        throw new ApiError(
            404,
            "Product not found"
        );

    }

    await Inventory.deleteMany({ productId });

    // Take it out of every customer's cart
    await Cart.updateMany(
        { "items.productId": productId },
        { $pull: { items: { productId } } }
    );

    return res.status(200).json(

        new ApiResponse(
            200,
            null,
            "Product removed successfully"
        )

    );

});


export {
    getInventorys,
    updateInventory,
    removeProduct
};
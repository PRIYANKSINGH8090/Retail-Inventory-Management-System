import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.models.js";
import { Supplier } from "../models/supplier.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const addproduct = asyncHandler(async (req, res) => {

    const {
        supplierEmail,
        name,
        mfg,
        exp,
        categoryId,
        cost,
        productDesc
    } = req.body;


    // Required fields
    if (
        !supplierEmail ||
        !name ||
        !mfg ||
        !categoryId ||
        !cost
    ) {
        throw new ApiError(
            400,
            "All required product fields are required"
        );
    }


    // Supplier ko email se check karo
    const email = supplierEmail.trim().toLowerCase();

    const supplier = await Supplier.findOne({
        email: email
    });


    if (!supplier) {
        throw new ApiError(
            404,
            "Supplier not found with this email"
        );
    }


    // Same supplier ka same product already hai ya nahi
    const existedProduct = await Product.findOne({
        name: name.trim(),
        supplierEmail: email
    });


    if (existedProduct) {
        throw new ApiError(
            409,
            "Product already exists for this supplier"
        );
    }


    // Image from multer
    const imageLocalPath = req.files?.image?.[0]?.path;

    if (!imageLocalPath) {
        throw new ApiError(
            400,
            "Product image is required"
        );
    }


    // Upload image
    const image = await uploadOnCloudinary(imageLocalPath);

    if (!image) {
        throw new ApiError(
            500,
            "Failed to upload product image"
        );
    }


    // Create product
    const product = await Product.create({

        supplierEmail: email,

        name: name.trim(),

        mfg,

        exp: exp || undefined,

        categoryId: categoryId.trim(),

        cost,

        productDesc: productDesc?.trim() || "",

        image: image.url
    });


    if (!product) {
        throw new ApiError(
            500,
            "Error occurred while adding product"
        );
    }


    return res.status(201).json(
        new ApiResponse(
            201,
            product,
            "Product added successfully"
        )
    );
});



const getProducts = asyncHandler(async (req, res) => {

    const products = await Product.find()
        .sort({ createdAt: -1 });


    return res.status(200).json(
        new ApiResponse(
            200,
            products,
            "Products fetched successfully"
        )
    );
});


export {
    addproduct,
    getProducts
};
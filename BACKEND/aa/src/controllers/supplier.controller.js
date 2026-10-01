import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Supplier } from "../models/supplier.models.js";

const registersupplier = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phone,
        address
    } = req.body;

    const supplierExists = await Supplier.findOne({
        $or: [
            { email: email.toLowerCase().trim() },
            { phone: phone.trim() }
        ]
    });

    if (supplierExists) {
        throw new ApiError(
            409,
            "Supplier with this email or phone already exists"
        );
    }

    const supplier = await Supplier.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim()
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            supplier,
            "Supplier registered successfully"
        )
    );
});

export {
    registersupplier
};
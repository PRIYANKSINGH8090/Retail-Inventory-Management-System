import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.models.js";
import { Inventory } from "../models/inventory.models.js";

// Customer-facing product list: Product + Inventory, price as a plain number
const getShopProducts = asyncHandler(async (_req, res) => {
    const [products, inventories] = await Promise.all([
        Product.find().sort({ createdAt: -1 }),
        Inventory.find()
    ]);

    const stockMap = new Map(inventories.map((i) => [i.productId.toString(), i]));

    const data = products.map((p) => {
        const inv = stockMap.get(p._id.toString());
        const quantity = inv ? inv.quantity : 0;

        return {
            productId: p._id,
            name: p.name,
            categoryId: p.categoryId,
            price: Number(p.cost.toString()),
            image: p.image,
            productDesc: p.productDesc,
            mfg: p.mfg,
            exp: p.exp,
            quantity,
            minimumQuantity: inv ? inv.minimumQuantity : 15,
            inStock: quantity > 0
        };
    });

    return res.status(200).json(new ApiResponse(200, data, "Products fetched"));
});

export { getShopProducts };

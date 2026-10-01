import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../controllers/cart.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("customer"));

router.get("/", getCart);
router.post("/add", addToCart);
router.patch("/item/:productId", updateCartItem);
router.delete("/item/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;

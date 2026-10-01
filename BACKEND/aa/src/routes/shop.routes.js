import { Router } from "express";
import { getShopProducts } from "../controllers/shop.controller.js";

const router = Router();

router.get("/products", getShopProducts);

export default router;

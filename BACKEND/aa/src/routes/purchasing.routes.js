import { Router } from "express";
import {
    getSuppliers,
    getPurchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    cancelPurchaseOrder
} from "../controllers/purchasing.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("admin", "staff"));

router.get("/suppliers", getSuppliers);
router.get("/orders", getPurchaseOrders);
router.post("/orders", createPurchaseOrder);
router.patch("/orders/:id/receive", receivePurchaseOrder);
router.patch("/orders/:id/cancel", cancelPurchaseOrder);

export default router;

import { Router } from "express";
import {
    placeOrder,
    getMyOrders,
    cancelMyOrder,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getSales
} from "../controllers/order.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// customer
router.post("/", authorizeRoles("customer"), placeOrder);
router.get("/my", authorizeRoles("customer"), getMyOrders);
router.patch("/my/:id/cancel", authorizeRoles("customer"), cancelMyOrder);

// admin + staff
router.get("/admin/all", authorizeRoles("admin", "staff"), getAllOrders);
router.get("/admin/sales", authorizeRoles("admin", "staff"), getSales);
router.patch("/admin/:id/status", authorizeRoles("admin", "staff"), updateOrderStatus);
router.patch("/admin/:id/payment", authorizeRoles("admin", "staff"), updatePaymentStatus);

export default router;

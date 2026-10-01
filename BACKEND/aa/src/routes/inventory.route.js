import { Router } from "express";

import {
    getInventorys,
    updateInventory,
    removeProduct
} from "../controllers/inventory.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/view", getInventorys);

router.patch("/update/:productId", updateInventory);

router.delete(
    "/remove/:productId",
    verifyJWT,
    authorizeRoles("admin", "staff"),
    removeProduct
);

export default router;
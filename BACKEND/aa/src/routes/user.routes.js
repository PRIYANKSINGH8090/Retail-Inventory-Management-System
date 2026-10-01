import { Router } from 'express';
import {
    registerUser,
    loginUser,
    getMe,
    updateMe,
    addAddress,
    deleteAddress,
    setDefaultAddress
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/me").get(verifyJWT, getMe).patch(verifyJWT, updateMe)

router.route("/addresses").post(verifyJWT, addAddress)
router.route("/addresses/:addressId").delete(verifyJWT, deleteAddress)
router.route("/addresses/:addressId/default").patch(verifyJWT, setDefaultAddress)

export default router;

import {Router} from 'express';
import { registersupplier} from '../controllers/supplier.controller.js';

            
const router=Router();
router.route("/register").post(registersupplier)



export default router;
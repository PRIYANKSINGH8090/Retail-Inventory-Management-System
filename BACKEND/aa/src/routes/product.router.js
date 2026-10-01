import {Router} from 'express';
import { addproduct ,getProducts} from '../controllers/product.controller.js';
import {upload,} from '../middlewares/multer.middlewares.js'
const router=Router();
router.route("/add").post(
    upload.fields([
        {name:"image", maxCount:1}
    ]),
    addproduct)
router.route("/view").get(getProducts)



export default router;
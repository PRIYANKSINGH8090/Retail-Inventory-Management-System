import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
import supplierRouter from './routes/supplier.routes.js'
import productRouter from './routes/product.router.js'
import inventoryRouter from './routes/inventory.route.js'
import shopRouter from './routes/shop.routes.js'
import cartRouter from './routes/cart.routes.js'
import orderRouter from './routes/order.routes.js'
import purchasingRouter from './routes/purchasing.routes.js'


app.use('/api/v1/users', userRouter)
app.use('/api/v1/supplier', supplierRouter)
app.use('/api/v1/product', productRouter)
app.use("/api/v1/inventory",inventoryRouter);
app.use('/api/v1/shop', shopRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/purchasing', purchasingRouter)

// JSON error handler so the frontend always gets { message }
app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500
    if (statusCode >= 500) console.error(err)
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Something went wrong",
        errors: err.errors || []
    })
})




export default app;

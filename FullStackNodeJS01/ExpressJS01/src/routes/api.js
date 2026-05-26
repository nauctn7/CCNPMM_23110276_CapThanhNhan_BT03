const express = require('express');
const { 
    register,
    verifyRegistrationOTP,
    resendRegistrationOTP,
    login,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    resendResetOTP,
    getUser,
    getAccount 
} = require('../controllers/userController');

const {
    getProducts,
    getProductBySlug,
    getFeaturedProducts,
    getCategories,
    getTopBestSellerProducts,
    getTopMostViewedProducts,
    getProductsByCategory,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const delay = require('../middleware/delay');
const {
    getCart,
    addCartItem,
    updateCartItem,
    deleteCartItem,
    clearCart,
    checkoutCod,
} = require('../controllers/cartController');
const {
    getAllOrders,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    reviewCancelRequest,
    updateOrderStatus,
} = require('../controllers/orderController');

const routerAPI = express.Router();

// User routes (public)
routerAPI.post("/register", register);
routerAPI.post("/verify-registration-otp", verifyRegistrationOTP);
routerAPI.post("/resend-registration-otp", resendRegistrationOTP);
routerAPI.post("/login", login);
routerAPI.post("/forgot-password", forgotPassword);
routerAPI.post("/verify-reset-otp", verifyResetOTP);
routerAPI.post("/reset-password", resetPassword);
routerAPI.post("/resend-reset-otp", resendResetOTP);

// Product routes (public)
routerAPI.get("/products", getProducts);
routerAPI.get("/products/featured", getFeaturedProducts);
routerAPI.get("/products/top/bestsellers", getTopBestSellerProducts);
routerAPI.get("/products/top/mostviewed", getTopMostViewedProducts);
routerAPI.get("/products/category", getProductsByCategory);
routerAPI.get("/products/categories", getCategories);
routerAPI.get("/products/:slug", getProductBySlug);

// Product routes (admin)
routerAPI.get('/admin/products', auth, adminOnly, getAdminProducts);
routerAPI.post('/admin/products', auth, adminOnly, createProduct);
routerAPI.put('/admin/products/:id', auth, adminOnly, updateProduct);
routerAPI.delete('/admin/products/:id', auth, adminOnly, deleteProduct);

// User routes (private)
routerAPI.get("/", auth, (req, res) => {
    return res.status(200).json({ 
        message: "Hello world api",
        status: "success"
    });
});

routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", auth, delay, getAccount);

// Cart and checkout routes (private)
routerAPI.get('/cart', auth, getCart);
routerAPI.post('/cart/items', auth, addCartItem);
routerAPI.patch('/cart/items/:productId', auth, updateCartItem);
routerAPI.delete('/cart/items/:productId', auth, deleteCartItem);
routerAPI.delete('/cart', auth, clearCart);
routerAPI.post('/orders/checkout', auth, checkoutCod);

routerAPI.get('/orders', auth, getMyOrders);
routerAPI.get('/orders/:id', auth, getMyOrderById);
routerAPI.patch('/orders/:id/cancel', auth, cancelMyOrder);

routerAPI.get('/admin/orders', auth, adminOnly, getAllOrders);
routerAPI.patch('/admin/orders/:id/cancel-review', auth, adminOnly, reviewCancelRequest);
routerAPI.patch('/admin/orders/:id/status', auth, adminOnly, updateOrderStatus);

module.exports = routerAPI;
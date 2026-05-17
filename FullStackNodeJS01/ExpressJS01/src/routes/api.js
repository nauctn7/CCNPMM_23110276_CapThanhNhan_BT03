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
    getCategories
} = require('../controllers/productController');

const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

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
routerAPI.get("/products/categories", getCategories);
routerAPI.get("/products/:slug", getProductBySlug);

// User routes (private)
routerAPI.get("/", auth, (req, res) => {
    return res.status(200).json({ 
        message: "Hello world api",
        status: "success"
    });
});

routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", auth, delay, getAccount);

module.exports = routerAPI;
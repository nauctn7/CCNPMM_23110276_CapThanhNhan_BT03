const express = require('express');
const { 
    createUser,
    handleLogin,
    forgotPassword,
    verifyOTP,
    resetPassword,
    resendOTP,
    getUser,
    getAccount 
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

// Routes công khai (KHÔNG cần auth)
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/forgot-password", forgotPassword);    // Gửi OTP
routerAPI.post("/verify-otp", verifyOTP);              // Xác thực OTP
routerAPI.post("/reset-password", resetPassword);      // Đặt lại mật khẩu
routerAPI.post("/resend-otp", resendOTP);              // Gửi lại OTP

// Routes cần auth
routerAPI.get("/", auth, (req, res) => {
    return res.status(200).json({ 
        message: "Hello world api",
        status: "success"
    });
});

routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", auth, delay, getAccount);

module.exports = routerAPI;
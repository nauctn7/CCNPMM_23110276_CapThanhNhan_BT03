const express = require('express');
const { 
    createUser, 
    handleLogin, 
    getUser,
    getAccount 
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

// Áp dụng auth cho tất cả (nhưng middleware sẽ bỏ qua public routes)
routerAPI.use(auth);

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.get("/", (req, res) => {
    return res.status(200).json({ 
        message: "Hello world api",
        status: "success"
    });
});
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI;
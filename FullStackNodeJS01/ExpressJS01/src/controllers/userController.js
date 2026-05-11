const { 
    createUserService, 
    loginService, 
    getUserService,
    getAccountService 
} = require('../services/userService');

// Controller đăng ký user
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                EC: 1,
                EM: "Vui lòng điền đầy đủ thông tin"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                EC: 1,
                EM: "Mật khẩu phải có ít nhất 6 ký tự"
            });
        }

        const result = await createUserService(name, email, password);
        
        if (result.EC === 0) {
            return res.status(201).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 2,
            EM: "Lỗi server"
        });
    }
};

// Controller đăng nhập
const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                EC: 1,
                EM: "Vui lòng điền email và mật khẩu"
            });
        }

        const result = await loginService(email, password);
        
        if (result.EC === 0) {
            return res.status(200).json(result);
        } else {
            return res.status(401).json(result);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 2,
            EM: "Lỗi server"
        });
    }
};

// Controller lấy danh sách user
const getUser = async (req, res) => {
    try {
        const result = await getUserService();
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi server"
        });
    }
};

// Controller lấy thông tin account
const getAccount = async (req, res) => {
    try {
        // userId được gán từ middleware auth
        const userId = req.user.userId;
        const result = await getAccountService(userId);
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi server"
        });
    }
};

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount
};
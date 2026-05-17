const { 
    registerService,
    verifyRegistrationOTPService,
    resendRegistrationOTPService,
    loginService,
    forgotPasswordService,
    verifyResetOTPService,
    resetPasswordService,
    resendResetOTPService,
    getUserService,
    getAccountService 
} = require('../services/userService');

// Đăng ký - Gửi OTP
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
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

        const result = await registerService(name, email, password);
        
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

// Xác thực OTP đăng ký
const verifyRegistrationOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({
                EC: 1,
                EM: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        const result = await verifyRegistrationOTPService(email, otp);
        
        if (result.EC === 0) {
            return res.status(200).json(result);
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

// Gửi lại OTP đăng ký
const resendRegistrationOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                EC: 1,
                EM: "Vui lòng nhập email"
            });
        }

        const result = await resendRegistrationOTPService(email);
        
        if (result.EC === 0) {
            return res.status(200).json(result);
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

// Đăng nhập
const login = async (req, res) => {
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

// Quên mật khẩu - Gửi OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                EC: 1,
                EM: "Vui lòng nhập email"
            });
        }

        const result = await forgotPasswordService(email);
        
        if (result.EC === 0) {
            return res.status(200).json(result);
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

// Xác thực OTP quên mật khẩu
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({
                EC: 1,
                EM: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        const result = await verifyResetOTPService(email, otp);
        
        if (result.EC === 0) {
            return res.status(200).json(result);
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

// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        if (!email || !newPassword) {
            return res.status(400).json({
                EC: 1,
                EM: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                EC: 1,
                EM: "Mật khẩu mới phải có ít nhất 6 ký tự"
            });
        }

        const result = await resetPasswordService(email, newPassword);
        
        if (result.EC === 0) {
            return res.status(200).json(result);
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

// Gửi lại OTP quên mật khẩu
const resendResetOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                EC: 1,
                EM: "Vui lòng nhập email"
            });
        }

        const result = await resendResetOTPService(email);
        
        if (result.EC === 0) {
            return res.status(200).json(result);
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

const getAccount = async (req, res) => {
    try {
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
};
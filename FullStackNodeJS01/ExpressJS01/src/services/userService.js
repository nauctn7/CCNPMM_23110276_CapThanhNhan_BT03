const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail, sendVerificationEmail } = require('./emailService');

// Tạo mã OTP ngẫu nhiên 6 số
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Service gửi OTP khi quên mật khẩu
const forgotPasswordService = async (email) => {
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại trong hệ thống"
            };
        }

        // Tạo OTP 6 số
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

        // Lưu OTP vào database
        user.resetOTP = otp;
        user.resetOTPExpires = otpExpires;
        await user.save();

        // Gửi OTP qua email
        const emailSent = await sendOTPEmail(email, user.name, otp);

        if (!emailSent) {
            return {
                EC: 2,
                EM: "Không thể gửi email, vui lòng thử lại sau"
            };
        }

        return {
            EC: 0,
            EM: "Mã OTP đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư."
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: "Lỗi server, vui lòng thử lại sau"
        };
    }
};

// Service xác thực OTP
const verifyOTPService = async (email, otp) => {
    try {
        const user = await User.findOne({ 
            email: email,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return {
                EC: 1,
                EM: "Mã OTP không hợp lệ hoặc đã hết hạn"
            };
        }

        // Tạo token tạm thời để reset password
        const tempToken = crypto.randomBytes(32).toString('hex');
        
        // Lưu token tạm thời (có thể lưu vào session hoặc database)
        // Ở đây đơn giản là xóa OTP và trả về token
        user.resetOTP = null;
        user.resetOTPExpires = null;
        await user.save();

        return {
            EC: 0,
            EM: "Xác thực OTP thành công",
            tempToken: tempToken
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 1,
            EM: "Lỗi xác thực OTP"
        };
    }
};

// Service reset password với OTP đã xác thực
const resetPasswordService = async (email, newPassword) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return {
                EC: 1,
                EM: "Không tìm thấy người dùng"
            };
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return {
            EC: 0,
            EM: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới."
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 1,
            EM: "Lỗi đặt lại mật khẩu"
        };
    }
};

// Resend OTP
const resendOTPService = async (email) => {
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại trong hệ thống"
            };
        }

        // Tạo OTP mới
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.resetOTP = otp;
        user.resetOTPExpires = otpExpires;
        await user.save();

        // Gửi lại OTP
        const emailSent = await sendOTPEmail(email, user.name, otp);

        if (!emailSent) {
            return {
                EC: 2,
                EM: "Không thể gửi email, vui lòng thử lại sau"
            };
        }

        return {
            EC: 0,
            EM: "Mã OTP mới đã được gửi đến email của bạn!"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: "Lỗi server, vui lòng thử lại sau"
        };
    }
};

// Các service khác giữ nguyên...
const createUserService = async (name, email, password) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return {
                EC: 1,
                EM: "Email đã được sử dụng"
            };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user',
            isVerified: false,
            verificationToken,
            verificationTokenExpires
        });

        await user.save();
        await sendVerificationEmail(email, name, verificationToken);

        return {
            EC: 0,
            EM: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: "Lỗi server, vui lòng thử lại sau"
        };
    }
};

const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            };
        }

        if (!user.isVerified) {
            return {
                EC: 1,
                EM: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực."
            };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            };
        }

        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            EC: 0,
            EM: "Đăng nhập thành công",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: "Lỗi server, vui lòng thử lại sau"
        };
    }
};

const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password -resetOTP -verificationToken");
        return {
            EC: 0,
            EM: "Lấy danh sách thành công",
            users: result
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 1,
            EM: "Lỗi lấy danh sách user"
        };
    }
};

const getAccountService = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password -resetOTP -verificationToken");
        if (!user) {
            return {
                EC: 1,
                EM: "Không tìm thấy user"
            };
        }
        return {
            EC: 0,
            EM: "Lấy thông tin thành công",
            user: user
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 1,
            EM: "Lỗi lấy thông tin"
        };
    }
};

module.exports = {
    createUserService,
    loginService,
    forgotPasswordService,
    verifyOTPService,
    resetPasswordService,
    resendOTPService,
    getUserService,
    getAccountService
};
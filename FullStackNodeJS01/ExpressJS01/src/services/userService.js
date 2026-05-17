const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationOTP, sendResetPasswordOTP } = require('./emailService');

const normalizeEmail = (value) => value.toLowerCase().trim();

// Tạo mã OTP ngẫu nhiên 6 số
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Service đăng ký - Gửi OTP xác thực
const registerService = async (name, email, password) => {
    try {
        const normalizedEmail = normalizeEmail(email);

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            // Nếu tài khoản đã xác thực thì không cho đăng ký lại
            if (existingUser.isVerified) {
                return {
                    EC: 1,
                    EM: "Email đã được sử dụng"
                };
            }

            // Nếu chưa xác thực thì cập nhật thông tin và gửi lại OTP mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const otp = generateOTP();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.verificationOTP = otp;
            existingUser.verificationOTPExpires = otpExpires;
            await existingUser.save();

            const emailSent = await sendVerificationOTP(normalizedEmail, name, otp);

            if (!emailSent) {
                existingUser.isVerified = true;
                existingUser.verificationOTP = null;
                existingUser.verificationOTPExpires = null;
                await existingUser.save();

                return {
                    EC: 0,
                    EM: 'Đăng ký thành công (chế độ dev: email chưa cấu hình, tài khoản đã được xác thực tự động).',
                    email: normalizedEmail,
                    autoVerified: true
                };
            }

            return {
                EC: 0,
                EM: "Email chưa xác thực. Chúng tôi đã gửi lại mã OTP mới.",
                email: normalizedEmail
            };
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

        // Tạo user mới (chưa xác thực)
        const user = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user',
            isVerified: false,
            verificationOTP: otp,
            verificationOTPExpires: otpExpires
        });

        await user.save();

        // Gửi OTP qua email
        const emailSent = await sendVerificationOTP(normalizedEmail, name, otp);

        if (!emailSent) {
            user.isVerified = true;
            user.verificationOTP = null;
            user.verificationOTPExpires = null;
            await user.save();

            return {
                EC: 0,
                EM: 'Đăng ký thành công (chế độ dev: email chưa cấu hình, tài khoản đã được xác thực tự động).',
                email: normalizedEmail,
                autoVerified: true
            };
        }

        return {
            EC: 0,
            EM: "Đăng ký thành công! Mã OTP đã được gửi đến email của bạn.",
            email: normalizedEmail
        };
    } catch (error) {
        console.log(error);

        if (error && error.code === 11000) {
            return {
                EC: 1,
                EM: "Email đã được sử dụng"
            };
        }

        return {
            EC: 2,
            EM: "Lỗi server, vui lòng thử lại sau"
        };
    }
};

// Xác thực OTP đăng ký
const verifyRegistrationOTPService = async (email, otp) => {
    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ 
            email: normalizedEmail,
            isVerified: false,
            verificationOTP: otp,
            verificationOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return {
                EC: 1,
                EM: "Mã OTP không hợp lệ hoặc đã hết hạn"
            };
        }

        // Xác thực thành công
        user.isVerified = true;
        user.verificationOTP = null;
        user.verificationOTPExpires = null;
        await user.save();

        return {
            EC: 0,
            EM: "Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay."
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 1,
            EM: "Lỗi xác thực OTP"
        };
    }
};

// Gửi lại OTP đăng ký
const resendRegistrationOTPService = async (email) => {
    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại trong hệ thống"
            };
        }

        if (user.isVerified) {
            return {
                EC: 1,
                EM: "Tài khoản đã được xác thực rồi!"
            };
        }

        // Tạo OTP mới
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.verificationOTP = otp;
        user.verificationOTPExpires = otpExpires;
        await user.save();

        // Gửi lại OTP
        const emailSent = await sendVerificationOTP(normalizedEmail, user.name, otp);

        if (!emailSent) {
            user.isVerified = true;
            user.verificationOTP = null;
            user.verificationOTPExpires = null;
            await user.save();

            return {
                EC: 0,
                EM: 'Đã xác thực tự động trong chế độ dev vì email chưa cấu hình.',
                autoVerified: true
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

// Service đăng nhập (kiểm tra đã xác thực chưa)
const loginService = async (email, password) => {
    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            };
        }

        // Kiểm tra email đã xác thực chưa
        if (!user.isVerified) {
            return {
                EC: 1,
                EM: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để nhập mã OTP xác thực."
            };
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            };
        }

        // Tạo token JWT
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

// Quên mật khẩu - Gửi OTP
const forgotPasswordService = async (email) => {
    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại trong hệ thống"
            };
        }

        // Tạo OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.resetOTP = otp;
        user.resetOTPExpires = otpExpires;
        await user.save();

        // Gửi OTP qua email
        const emailSent = await sendResetPasswordOTP(normalizedEmail, user.name, otp);
        
        if (!emailSent) {
            return {
                EC: 0,
                EM: "OTP đã được tạo trong chế độ dev vì email chưa cấu hình.",
                otp,
                devMode: true
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

// Xác thực OTP quên mật khẩu
const verifyResetOTPService = async (email, otp) => {
    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ 
            email: normalizedEmail,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return {
                EC: 1,
                EM: "Mã OTP không hợp lệ hoặc đã hết hạn"
            };
        }

        return {
            EC: 0,
            EM: "Xác thực OTP thành công"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 1,
            EM: "Lỗi xác thực OTP"
        };
    }
};

// Đặt lại mật khẩu
const resetPasswordService = async (email, newPassword) => {
    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

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
        user.resetOTP = null;
        user.resetOTPExpires = null;
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

// Gửi lại OTP quên mật khẩu
const resendResetOTPService = async (email) => {
    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại trong hệ thống"
            };
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.resetOTP = otp;
        user.resetOTPExpires = otpExpires;
        await user.save();

        const emailSent = await sendResetPasswordOTP(normalizedEmail, user.name, otp);
        
        if (!emailSent) {
            return {
                EC: 0,
                EM: "OTP mới đã được tạo trong chế độ dev vì email chưa cấu hình.",
                otp,
                devMode: true
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

const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password -verificationOTP -resetOTP");
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
        const user = await User.findById(userId).select("-password -verificationOTP -resetOTP");
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
};
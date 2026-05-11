const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Service tạo user mới
const createUserService = async (name, email, password) => {
    try {
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return {
                EC: 1,
                EM: "Email đã được sử dụng"
            };
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user mới
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await user.save();

        return {
            EC: 0,
            EM: "Đăng ký thành công",
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

// Service đăng nhập
const loginService = async (email, password) => {
    try {
        // Tìm user theo email
        const user = await User.findOne({ email });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
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

// Service lấy danh sách user
const getUserService = async () => {
    try {
        // Lấy tất cả user, không bao gồm password
        let result = await User.find({}).select("-password");
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

// Service lấy thông tin account hiện tại
const getAccountService = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password");
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
    getUserService,
    getAccountService
};
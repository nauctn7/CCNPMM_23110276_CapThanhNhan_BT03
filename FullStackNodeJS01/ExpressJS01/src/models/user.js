const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // OTP xác thực đăng ký
    verificationOTP: {
        type: String,
        default: null
    },
    verificationOTPExpires: {
        type: Date,
        default: null
    },
    // OTP quên mật khẩu
    resetOTP: {
        type: String,
        default: null
    },
    resetOTPExpires: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
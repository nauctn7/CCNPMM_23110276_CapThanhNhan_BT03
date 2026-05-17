const nodemailer = require('nodemailer');

const isEmailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Gửi mã OTP xác thực đăng ký
const sendVerificationOTP = async (email, name, otp) => {
    if (!isEmailConfigured) {
        console.warn('Email credentials are not configured. Skipping verification email.');
        return false;
    }

    const mailOptions = {
        from: `"LUXURY JEWELRY" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Xác thực tài khoản - Mã OTP đăng ký',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #ec4899;">✨ LUXURY JEWELRY</h2>
                    <h3 style="color: #ec4899;">XÁC THỰC TÀI KHOẢN</h3>
                </div>
                
                <p>Xin chào <strong>${name}</strong>,</p>
                
                <p>Cảm ơn bạn đã đăng ký tài khoản tại LUXURY JEWELRY.</p>
                
                <p>Vui lòng nhập mã OTP dưới đây để xác thực tài khoản của bạn:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #fce7f3; padding: 20px; border-radius: 10px; display: inline-block;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #be185d;">Mã OTP của bạn là:</p>
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ec4899; background: white; padding: 15px 25px; border-radius: 8px;">
                            ${otp}
                        </div>
                    </div>
                </div>
                
                <p>Mã OTP này có hiệu lực trong <strong style="color: #ec4899;">5 phút</strong>.</p>
                
                <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Trang sức cao cấp - Tỏa sáng cùng bạn
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

// Gửi mã OTP đặt lại mật khẩu
const sendResetPasswordOTP = async (email, name, otp) => {
    if (!isEmailConfigured) {
        console.warn('Email credentials are not configured. Skipping reset password email.');
        return false;
    }

    const mailOptions = {
        from: `"LUXURY JEWELRY" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Đặt lại mật khẩu - Mã OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #ec4899;">✨ LUXURY JEWELRY</h2>
                    <h3 style="color: #ec4899;">ĐẶT LẠI MẬT KHẨU</h3>
                </div>
                
                <p>Xin chào <strong>${name}</strong>,</p>
                
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                
                <p>Vui lòng nhập mã OTP dưới đây để đặt lại mật khẩu:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #fce7f3; padding: 20px; border-radius: 10px; display: inline-block;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #be185d;">Mã OTP của bạn là:</p>
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ec4899; background: white; padding: 15px 25px; border-radius: 8px;">
                            ${otp}
                        </div>
                    </div>
                </div>
                
                <p>Mã OTP này có hiệu lực trong <strong style="color: #ec4899;">5 phút</strong>.</p>
                
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Trang sức cao cấp - Tỏa sáng cùng bạn
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset password OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

module.exports = { sendVerificationOTP, sendResetPasswordOTP };
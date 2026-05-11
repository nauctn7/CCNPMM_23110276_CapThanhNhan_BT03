const nodemailer = require('nodemailer');

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Gửi mã OTP
const sendOTPEmail = async (email, name, otp) => {
    const mailOptions = {
        from: `"FullStack App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Mã OTP đặt lại mật khẩu - FullStack App',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1890ff;">FullStack App</h2>
                    <h3 style="color: #ff4d4f;">🔐 ĐẶT LẠI MẬT KHẨU</h3>
                </div>
                
                <p>Xin chào <strong>${name}</strong>,</p>
                
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #f0f2f5; padding: 20px; border-radius: 10px; display: inline-block;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Mã OTP của bạn là:</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1890ff; background: white; padding: 15px 25px; border-radius: 8px; display: inline-block;">
                            ${otp}
                        </div>
                    </div>
                </div>
                
                <p>Mã OTP này có hiệu lực trong <strong style="color: #ff4d4f;">5 phút</strong>.</p>
                
                <p>Vui lòng <strong>KHÔNG chia sẻ mã OTP này với bất kỳ ai</strong> để bảo vệ tài khoản của bạn.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.<br>
                    Tài khoản của bạn vẫn được bảo mật.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

// Gửi email xác thực đăng ký (giữ nguyên)
const sendVerificationEmail = async (email, name, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: `"FullStack App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Xác thực tài khoản - FullStack App',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1890ff;">Chào mừng ${name}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại FullStack App.</p>
                <p>Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>
                <a href="${verificationLink}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #1890ff; 
                          color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
                    Xác thực tài khoản
                </a>
                <p>Link này sẽ hết hạn sau 24 giờ.</p>
                <hr>
                <p style="color: #999; font-size: 12px;">Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

module.exports = { sendOTPEmail, sendVerificationEmail };
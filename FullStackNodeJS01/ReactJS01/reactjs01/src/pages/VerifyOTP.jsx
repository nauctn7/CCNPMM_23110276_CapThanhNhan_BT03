import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Alert } from 'antd';
import { KeyOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const VerifyOTP = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailParam = queryParams.get('email');
        const otpParam = queryParams.get('otp');
        
        if (!emailParam) {
            message.error('Email không hợp lệ!');
            navigate('/forgot-password');
            return;
        }
        setEmail(emailParam);
        if (otpParam) {
            form.setFieldsValue({ otp: otpParam });
        }
    }, [location, navigate, form]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/api/verify-otp', {
                email: email,
                otp: values.otp
            });
            
            if (response.data.EC === 0) {
                message.success('Xác thực OTP thành công!');
                // Chuyển đến trang đặt lại mật khẩu
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                message.error(response.data.EM);
            }
        } catch (error) {
            message.error(error.response?.data?.EM || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;
        
        setResendLoading(true);
        try {
            const response = await api.post('/api/resend-otp', { email: email });
            
            if (response.data.EC === 0) {
                message.success('Mã OTP mới đã được gửi!');
                setCountdown(60); // 60 giây countdown
            } else {
                message.error(response.data.EM);
            }
        } catch (error) {
            message.error(error.response?.data?.EM || 'Có lỗi xảy ra');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 64px)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <Card style={{ width: 450, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Title level={2} style={{ color: '#1890ff' }}>Xác thực OTP</Title>
                    <Text type="secondary">
                        Mã OTP đã được gửi đến email <strong>{email}</strong>
                    </Text>
                </div>

                <Alert
                    message="Lưu ý"
                    description="Mã OTP có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã OTP với bất kỳ ai."
                    type="info"
                    showIcon
                    style={{ marginBottom: 20 }}
                />

                <Form
                    form={form}
                    name="verify-otp"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        label="Mã OTP"
                        name="otp"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã OTP!' },
                            { len: 6, message: 'Mã OTP phải có 6 chữ số!' },
                            { pattern: /^\d+$/, message: 'Mã OTP chỉ chứa số!' }
                        ]}
                    >
                        <Input 
                            prefix={<KeyOutlined />} 
                            placeholder="Nhập mã 6 số" 
                            size="large"
                            maxLength={6}
                            style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading} 
                            block
                            size="large"
                        >
                            Xác thực OTP
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Button 
                            type="link" 
                            onClick={handleResendOTP}
                            loading={resendLoading}
                            disabled={countdown > 0}
                            icon={<ReloadOutlined />}
                        >
                            {countdown > 0 
                                ? `Gửi lại sau ${countdown} giây` 
                                : 'Gửi lại mã OTP'
                            }
                        </Button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                        <Link to="/login">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default VerifyOTP;
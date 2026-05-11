import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/api/forgot-password', { 
                email: values.email 
            });
            
            if (response.data.EC === 0) {
                setEmail(values.email);
                setSubmitted(true);
                message.success(response.data.EM);
            } else {
                message.error(response.data.EM);
            }
        } catch (error) {
            message.error(error.response?.data?.EM || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 64px)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Card style={{ width: 500, textAlign: 'center', borderRadius: 10 }}>
                    <MailOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 20 }} />
                    <Title level={3}>Mã OTP đã được gửi!</Title>
                    <Text>
                        Chúng tôi đã gửi mã OTP đến email <strong>{email}</strong>.<br />
                        Vui lòng kiểm tra hộp thư (cả mục Spam) để lấy mã OTP.
                    </Text>
                    <div style={{ marginTop: 24 }}>
                        <Button 
                            type="primary" 
                            onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(email)}`)}
                            size="large"
                        >
                            Nhập mã OTP
                        </Button>
                        <Button 
                            style={{ marginTop: 10 }}
                            onClick={() => navigate('/login')}
                            type="link"
                        >
                            Quay lại đăng nhập
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

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
                    <Title level={2} style={{ color: '#ff4d4f' }}>Quên mật khẩu?</Title>
                    <Text type="secondary">
                        Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
                    </Text>
                </div>

                <Form
                    name="forgot-password"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input 
                            prefix={<MailOutlined />} 
                            placeholder="example@email.com" 
                            size="large"
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
                            Gửi mã OTP
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login">
                            <ArrowLeftOutlined /> Quay lại đăng nhập
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
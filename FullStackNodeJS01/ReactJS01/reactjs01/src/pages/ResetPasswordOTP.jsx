import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const ResetPasswordOTP = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailParam = queryParams.get('email');
        
        if (!emailParam) {
            message.error('Email không hợp lệ!');
            navigate('/forgot-password');
            return;
        }
        setEmail(emailParam);
    }, [location, navigate]);

    const onFinish = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (values.newPassword.length < 6) {
            message.error('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/api/reset-password', {
                email: email,
                newPassword: values.newPassword
            });
            
            if (response.data.EC === 0) {
                setSuccess(true);
                message.success(response.data.EM);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                message.error(response.data.EM);
            }
        } catch (error) {
            message.error(error.response?.data?.EM || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 64px)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Card style={{ width: 500, textAlign: 'center', borderRadius: 10 }}>
                    <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 20 }} />
                    <Title level={3}>Đặt lại mật khẩu thành công!</Title>
                    <Text>Đang chuyển hướng đến trang đăng nhập...</Text>
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
                    <Title level={2} style={{ color: '#1890ff' }}>Đặt lại mật khẩu</Title>
                    <Text type="secondary">
                        Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
                    </Text>
                </div>

                <Form
                    name="reset-password"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="********" 
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                        hasFeedback
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="********" 
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
                            Đặt lại mật khẩu
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPasswordOTP;
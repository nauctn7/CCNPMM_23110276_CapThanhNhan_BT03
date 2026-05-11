import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        const result = await login(values.email, values.password);
        setLoading(false);

        if (result.success) {
            message.success('Đăng nhập thành công!');
            navigate('/');
        } else {
            message.error(result.error || 'Đăng nhập thất bại');
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
                    <Title level={2} style={{ color: '#1890ff' }}>Đăng nhập</Title>
                    <Typography.Text type="secondary">
                        Chào mừng bạn trở lại!
                    </Typography.Text>
                </div>

                <Form
                    name="login"
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
                        <Input prefix={<UserOutlined />} placeholder="example@email.com" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="********" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Typography.Text>
                            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                        </Typography.Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
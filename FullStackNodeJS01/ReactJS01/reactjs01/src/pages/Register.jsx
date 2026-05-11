import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';

const { Title } = Typography;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        const result = await register(values.name, values.email, values.password);
        setLoading(false);

        if (result.success) {
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } else {
            message.error(result.error || 'Đăng ký thất bại');
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
            <Card style={{ width: 500, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Title level={2} style={{ color: '#1890ff' }}>Đăng ký</Title>
                    <Typography.Text type="secondary">
                        Tạo tài khoản mới
                    </Typography.Text>
                </div>

                <Form
                    name="register"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="example@email.com" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="********" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="********" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Đăng ký
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Typography.Text>
                            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                        </Typography.Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
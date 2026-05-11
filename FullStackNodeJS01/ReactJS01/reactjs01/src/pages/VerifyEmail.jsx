import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Spin, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const VerifyEmail = () => {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token xác thực không hợp lệ!');
            setLoading(false);
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await api.get(`/api/verify-email?token=${token}`);
                if (response.data.EC === 0) {
                    setStatus('success');
                    setMessage('Xác thực email thành công! Bạn có thể đăng nhập ngay.');
                } else {
                    setStatus('error');
                    setMessage(response.data.EM || 'Xác thực email thất bại!');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.EM || 'Có lỗi xảy ra!');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [location]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 64px)'
            }}>
                <Spin size="large" tip="Đang xác thực email..." />
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
            <Card style={{ width: 500, textAlign: 'center', borderRadius: 10 }}>
                <Result
                    icon={status === 'success' ? 
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 64 }} /> :
                        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 64 }} />
                    }
                    title={status === 'success' ? 'Xác thực thành công!' : 'Xác thực thất bại!'}
                    subTitle={message}
                    extra={[
                        <Button type="primary" key="login" onClick={() => navigate('/login')}>
                            Đăng nhập ngay
                        </Button>,
                        <Button key="home" onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>
                    ]}
                />
            </Card>
        </div>
    );
};

export default VerifyEmail;
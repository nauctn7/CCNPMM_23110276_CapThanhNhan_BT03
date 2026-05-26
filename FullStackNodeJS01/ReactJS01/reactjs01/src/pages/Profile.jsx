import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Descriptions, Avatar, Tag, Button, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../components/context/AuthContext';

const { Title } = Typography;

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <div style={{ padding: '24px' }}>
            <Card style={{ borderRadius: 8, maxWidth: 800, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Avatar size={100} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
                    <Title level={3}>{user.name}</Title>
                    <Tag color="blue">{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</Tag>
                </div>

                <Descriptions bordered column={1} labelStyle={{ width: '30%' }}>
                    <Descriptions.Item label={
                        <Space><UserOutlined /> Họ và tên</Space>
                    }>
                        {user.name}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={
                        <Space><MailOutlined /> Email</Space>
                    }>
                        {user.email}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={
                        <Space><CalendarOutlined /> Ngày tham gia</Space>
                    }>
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </Descriptions.Item>
                </Descriptions>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                    <Button icon={<EditOutlined />} type="primary" onClick={() => navigate('/orders')}>
                        Theo dõi đơn hàng
                    </Button>
                    <Button onClick={() => navigate('/orders')}>
                        Xem lịch sử mua hàng
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Profile;
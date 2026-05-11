import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Avatar, Space, Tag, message } from 'antd';
import { UserOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../components/context/AuthContext';
import api from '../services/api';

const { Title, Paragraph } = Typography;

const Home = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/user');
            if (response.data.EC === 0) {
                setUsers(response.data.users);
            }
        } catch (error) {
            message.error('Không thể tải danh sách user');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Avatar',
            key: 'avatar',
            render: (_, record) => <Avatar icon={<UserOutlined />} />
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => <Space><MailOutlined /> {text}</Space>
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role === 'admin' ? 'Admin' : 'User'}
                </Tag>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Title level={3}>
                        Chào mừng, {user?.name}! 👋
                    </Title>
                    <Paragraph>
                        <ClockCircleOutlined /> Hôm nay là ngày {new Date().toLocaleDateString('vi-VN')}
                    </Paragraph>
                    <Paragraph>
                        Bạn đang đăng nhập với vai trò: <Tag color="blue">{user?.role}</Tag>
                    </Paragraph>
                </Space>
            </Card>

            <Card title="Danh sách người dùng" style={{ borderRadius: 8 }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
};

export default Home;
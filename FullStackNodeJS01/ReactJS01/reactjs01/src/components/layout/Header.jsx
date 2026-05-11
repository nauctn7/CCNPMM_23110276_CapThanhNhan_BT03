import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Trang chủ',
            onClick: () => navigate('/')
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => navigate('/profile')
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: logout,
            danger: true
        }
    ];

    return (
        <AntHeader style={{ 
            background: '#fff', 
            padding: '0 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1890ff', cursor: 'pointer' }} 
                    onClick={() => navigate('/')}>
                    FullStack App
                </h1>
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ marginLeft: 30, minWidth: 200, border: 'none' }}
                />
            </div>

            <div>
                {isAuthenticated ? (
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar icon={<UserOutlined />} />
                            <span>{user?.name || 'User'}</span>
                        </Space>
                    </Dropdown>
                ) : (
                    <Space>
                        <Button type="link" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </Button>
                        <Button type="primary" onClick={() => navigate('/register')}>
                            Đăng ký
                        </Button>
                    </Space>
                )}
            </div>
        </AntHeader>
    );
};

export default Header;
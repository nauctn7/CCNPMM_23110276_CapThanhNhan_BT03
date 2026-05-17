import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../context/AuthContext';

/** Chỉ cho khách: đã đăng nhập thì về trang chủ */
const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default GuestRoute;

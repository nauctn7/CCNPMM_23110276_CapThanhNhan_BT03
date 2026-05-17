import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PROTECTED_PATHS = ['/profile', '/orders'];

const PUBLIC_ONLY_WHEN_GUEST = PROTECTED_PATHS;

/**
 * Mỗi lần mở/tải lại app: guest chỉ xem SP.
 * Nếu đang ở trang cần đăng nhập mà chưa auth → về trang chủ.
 */
const AppBootstrap = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated && PUBLIC_ONLY_WHEN_GUEST.includes(location.pathname)) {
            navigate('/', { replace: true, state: { guestNotice: 'Vui lòng đăng nhập để sử dụng tính năng này.' } });
        }
    }, [isAuthenticated, loading, location.pathname, navigate]);

    return children;
};

export default AppBootstrap;

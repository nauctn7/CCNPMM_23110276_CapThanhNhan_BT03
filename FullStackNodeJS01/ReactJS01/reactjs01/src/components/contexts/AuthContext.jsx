import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/api/account');
            if (response.data.EC === 0) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Fetch user error:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/login', { email, password });
            if (response.data.EC === 0) {
                localStorage.setItem('token', response.data.token);
                setToken(response.data.token);
                setUser(response.data.user);
                return { success: true, data: response.data };
            }
            return { success: false, error: response.data.EM };
        } catch (error) {
            return { success: false, error: error.response?.data?.EM || 'Login failed' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/api/register', { name, email, password });
            if (response.data.EC === 0) {
                return { success: true, data: response.data };
            }
            return { success: false, error: response.data.EM };
        } catch (error) {
            return { success: false, error: error.response?.data?.EM || 'Register failed' };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await api.post('/api/forgot-password', { email });
            return response.data;
        } catch (error) {
            return { EC: 1, EM: error.response?.data?.EM || 'Gửi yêu cầu thất bại' };
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const response = await api.post('/api/verify-otp', { email, otp });
            return response.data;
        } catch (error) {
            return { EC: 1, EM: error.response?.data?.EM || 'Xác thực OTP thất bại' };
        }
    };

    const resetPassword = async (email, newPassword) => {
        try {
            const response = await api.post('/api/reset-password', { email, newPassword });
            return response.data;
        } catch (error) {
            return { EC: 1, EM: error.response?.data?.EM || 'Đặt lại mật khẩu thất bại' };
        }
    };

    const resendOTP = async (email) => {
        try {
            const response = await api.post('/api/resend-otp', { email });
            return response.data;
        } catch (error) {
            return { EC: 1, EM: error.response?.data?.EM || 'Gửi lại OTP thất bại' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        forgotPassword,
        verifyOTP,
        resetPassword,
        resendOTP,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
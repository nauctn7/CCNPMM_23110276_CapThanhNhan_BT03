import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { getToken, setToken, clearToken } from '../../utils/authStorage';

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
    const [token, setTokenState] = useState(getToken);

    const resetSession = useCallback(() => {
        clearToken();
        setTokenState(null);
        setUser(null);
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.get('/api/account');
            if (response.data.EC === 0) {
                setUser(response.data.user);
            } else {
                resetSession();
            }
        } catch {
            resetSession();
        } finally {
            setLoading(false);
        }
    }, [resetSession]);

    useEffect(() => {
        const stored = getToken();
        if (stored) {
            setTokenState(stored);
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/login', { email, password });
            if (response.data.EC === 0) {
                setToken(response.data.token);
                setTokenState(response.data.token);
                setUser(response.data.user);
                // Notify other parts of the app (e.g., Cart) that login completed
                try {
                    // dispatch asynchronously to avoid race where listeners
                    // (like CartProvider) haven't been attached yet
                    setTimeout(() => {
                        try {
                            window.dispatchEvent(new Event('app:login'));
                        } catch (e) {
                            // ignore in non-browser environments
                        }
                    }, 0);
                } catch (e) {
                    // ignore in non-browser environments
                }
                return { success: true, data: response.data };
            }
            return { success: false, error: response.data.EM };
        } catch (error) {
            return { success: false, error: error.response?.data?.EM || 'Đăng nhập thất bại' };
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
            return { success: false, error: error.response?.data?.EM || 'Đăng ký thất bại' };
        }
    };

    const logout = useCallback(() => {
        resetSession();
        try {
            window.dispatchEvent(new Event('app:logout'));
        } catch (e) {
            // ignore in non-browser environments
        }
    }, [resetSession]);

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

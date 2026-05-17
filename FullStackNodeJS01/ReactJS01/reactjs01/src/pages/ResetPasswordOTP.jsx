import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        if (!emailParam) {
            navigate('/forgot-password');
        } else {
            setEmail(emailParam);
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/api/reset-password', { email, newPassword });
            if (response.data.EC === 0) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data.EM);
            }
        } catch (error) {
            setError(error.response?.data?.EM || 'Đặt lại mật khẩu thất bại');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-500 mb-4">Đặt lại mật khẩu thành công!</h2>
                    <p className="text-gray-600">Đang chuyển hướng đến trang đăng nhập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-pink-500">Đặt lại mật khẩu</h2>
                    <p className="text-gray-500 mt-2">
                        Tạo mật khẩu mới cho tài khoản <strong>{email}</strong>
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Mật khẩu mới</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>
                
                <p className="text-center mt-6">
                    <Link to="/login" className="text-pink-500 hover:underline">
                        ← Quay lại đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
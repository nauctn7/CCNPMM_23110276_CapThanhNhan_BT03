import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/api/forgot-password', { email });
            if (response.data.EC === 0) {
                alert(response.data.otp
                    ? `OTP dev: ${response.data.otp}`
                    : 'Mã OTP đã được gửi đến email của bạn!');
                navigate(`/verify-reset-otp?email=${encodeURIComponent(email)}${response.data.otp ? `&otp=${encodeURIComponent(response.data.otp)}` : ''}`);
            } else {
                setError(response.data.EM);
            }
        } catch (error) {
            setError(error.response?.data?.EM || 'Gửi yêu cầu thất bại');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-pink-500">Quên mật khẩu?</h2>
                    <p className="text-gray-500 mt-2">Nhập email để nhận mã OTP</p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
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

export default ForgotPassword;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const VerifyResetOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        const otpParam = params.get('otp');
        if (!emailParam) {
            navigate('/forgot-password');
        } else {
            setEmail(emailParam);
            if (otpParam) {
                setOtp(otpParam);
            }
        }
    }, [location, navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Mã OTP phải có 6 chữ số');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/api/verify-reset-otp', { email, otp });
            if (response.data.EC === 0) {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                setError(response.data.EM);
            }
        } catch (error) {
            setError(error.response?.data?.EM || 'Xác thực OTP thất bại');
        }
        setLoading(false);
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;
        
        setLoading(true);
        try {
            const response = await api.post('/api/resend-reset-otp', { email });
            if (response.data.EC === 0) {
                setCountdown(60);
                alert('Mã OTP mới đã được gửi!');
            } else {
                alert(response.data.EM);
            }
        } catch (error) {
            alert(error.response?.data?.EM || 'Gửi lại OTP thất bại');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-pink-500">Xác thực OTP</h2>
                    <p className="text-gray-500 mt-2">
                        Nhập mã OTP đã được gửi đến <strong>{email}</strong>
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleVerify}>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Mã OTP (6 số)</label>
                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-2 text-center text-2xl tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="000000"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50 mb-3"
                    >
                        {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading || countdown > 0}
                        className="w-full border border-pink-500 text-pink-500 py-2 rounded-lg hover:bg-pink-50 transition disabled:opacity-50"
                    >
                        {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
                    </button>
                </form>
                
                <p className="text-center mt-6">
                    <Link to="/forgot-password" className="text-pink-500 hover:underline">
                        ← Quay lại
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyResetOTP;
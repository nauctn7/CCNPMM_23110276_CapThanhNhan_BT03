import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/api/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            
            if (response.data.EC === 0) {
                if (response.data.autoVerified) {
                    alert(response.data.EM || 'Đăng ký thành công!');
                    navigate('/login');
                } else {
                    alert(response.data.otp
                        ? `Đăng ký thành công! OTP dev: ${response.data.otp}`
                        : 'Đăng ký thành công! Mã OTP đã được gửi đến email của bạn.');
                    navigate(`/verify-registration-otp?email=${encodeURIComponent(formData.email)}${response.data.otp ? `&otp=${encodeURIComponent(response.data.otp)}` : ''}`);
                }
            } else {
                setError(response.data.EM);
            }
        } catch (error) {
            setError(error.response?.data?.EM || 'Đăng ký thất bại');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-pink-500">Đăng ký</h2>
                    <p className="text-gray-500 mt-2">Tạo tài khoản mới</p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Họ và tên</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>
                
                <p className="text-center mt-6 text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-pink-500 hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
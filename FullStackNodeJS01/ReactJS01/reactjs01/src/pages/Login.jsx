import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';
    const notice = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login(email, password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-pink-500">Đăng nhập</h2>
                    <p className="text-gray-500 mt-2">Chào mừng bạn trở lại!</p>
                </div>
                
                {notice && (
                    <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg mb-4 text-sm">
                        {notice}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    
                    <div className="text-right mb-4">
                        <Link to="/forgot-password" className="text-pink-500 hover:underline text-sm">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
                
                <p className="text-center mt-6 text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-pink-500 hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
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

    const inputClassName =
        'w-full px-4 py-3 border rounded-xl bg-white/95 text-gray-900 outline-none transition focus:ring-2 focus:border-[#b8874a]';

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
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden"
            style={{ background: 'radial-gradient(circle at top, rgba(184,135,74,0.18), transparent 35%), linear-gradient(180deg, #fffaf3 0%, #f6eadf 100%)' }}
        >
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(122,67,30,0.12), transparent 24%), radial-gradient(circle at 80% 0%, rgba(184,135,74,0.12), transparent 20%)' }} />
            <div className="relative max-w-5xl w-full overflow-hidden rounded-[2rem] border border-[#d8c6b1] bg-white/92 shadow-[0_24px_80px_rgba(45,34,28,0.18)] backdrop-blur-sm grid md:grid-cols-[1.05fr_0.95fr]">
                <div className="hidden md:flex flex-col justify-between p-10 text-white" style={{ background: 'linear-gradient(160deg, #7a431e 0%, #b8874a 55%, #d6b884 100%)' }}>
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-white/75 mb-6">Luxury Jewelry</p>
                        <h2 className="text-4xl font-bold leading-tight mb-4">Bước vào không gian mua sắm sang trọng</h2>
                        <p className="text-white/85 text-base max-w-md">
                            Đăng nhập để theo dõi đơn hàng, lưu sản phẩm yêu thích và nhận ưu đãi dành riêng cho thành viên.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm text-white/90">
                        <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                            Ưu đãi thành viên
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                            Giao diện tinh gọn
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                            Thanh toán nhanh
                        </div>
                    </div>
                </div>

                <div className="p-7 sm:p-8 md:p-10">
                    <div className="text-center mb-8">
                        <p className="inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em]" style={{ background: 'rgba(184,135,74,0.12)', color: '#7a431e' }}>
                            Chào mừng trở lại
                        </p>
                        <h2 className="mt-4 text-3xl font-bold" style={{ color: '#3b2a20' }}>Đăng nhập</h2>
                        <p className="mt-2" style={{ color: '#6b5546' }}>Truy cập tài khoản của bạn để tiếp tục mua sắm.</p>
                    </div>
                
                    {notice && (
                        <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{ background: 'rgba(184,135,74,0.10)', borderColor: 'rgba(184,135,74,0.30)', color: '#7a431e' }}>
                            {notice}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                            {error}
                        </div>
                    )}
                
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium" style={{ color: '#5c4636' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClassName}
                                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block mb-2 text-sm font-medium" style={{ color: '#5c4636' }}>Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClassName}
                                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                                required
                            />
                        </div>
                        
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: '#8b6b4a' }}>
                                Quên mật khẩu?
                            </Link>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>
                    
                    <p className="text-center mt-6 text-sm" style={{ color: '#6b5546' }}>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="font-semibold hover:underline" style={{ color: '#7a431e' }}>
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
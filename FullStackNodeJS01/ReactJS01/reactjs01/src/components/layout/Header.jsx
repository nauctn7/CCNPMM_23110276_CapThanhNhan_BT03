import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { redirectToLogin } from '../../utils/guestGuard';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleCartClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            redirectToLogin(navigate, '/cart', 'Vui lòng đăng nhập để xem giỏ hàng.');
        }
    };

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/', { replace: true });
    };

    const navLink =
        'text-stone-600 hover:text-amber-700 font-medium transition text-sm uppercase tracking-wide';

    return (
        <header className="sticky top-0 z-50 border-b" style={{ background: 'linear-gradient(180deg, rgba(18,10,7,0.6), rgba(18,10,7,0.35))', backdropFilter: 'blur(6px)', borderColor: 'rgba(60,40,30,0.12)' }}>
            <div className="text-center text-xs py-2 tracking-wide" style={{ background: 'rgba(26,12,7,0.6)', color: '#f1e6d8' }}>
                Miễn phí giao hàng đơn từ 2 triệu · Bảo hành chính hãng · Swarovski & Daniel Wellington
            </div>
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center gap-4">
                    <Link to="/" className="flex-shrink-0">
                        <span className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: '#f7efe6' }}>
                            LUXURY
                        </span>
                        <span className="text-xl md:text-2xl font-light ml-1" style={{ color: '#d6b884' }}>JEWELRY</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <Link to="/" className={navLink}>Trang chủ</Link>
                        <Link to="/products" className={navLink}>Sản phẩm</Link>
                        <Link to="/promotions" className={navLink}>Khuyến mãi</Link>
                    </nav>

                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-md items-center rounded-full px-4 py-2 border"
                        style={{ background: 'rgba(255,250,242,0.03)', borderColor: 'rgba(166,124,73,0.06)' }}
                    >
                        <input
                            type="text"
                            placeholder="Tìm nhẫn, dây chuyền, bông tai..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: '#efe3d2' }}
                        />
                        <button type="submit" className="font-medium text-sm" style={{ color: '#d6b884' }}>
                            Tìm
                        </button>
                    </form>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Link
                            to={isAuthenticated ? '/cart' : '/login'}
                            onClick={handleCartClick}
                            className="relative p-2 rounded-full transition"
                            title="Giỏ hàng"
                            style={{ color: '#efe3d2' }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {isAuthenticated && totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold" style={{ background: '#a67844', color: '#fff' }}>
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full transition text-sm font-medium"
                                    style={{ background: 'rgba(255,250,242,0.55)', color: '#1b0e07' }}
                                >
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: '#a67844', color: '#fff' }}>
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                    <span className="hidden sm:inline" style={{ color: '#1b0e07' }}>{user?.name?.split(' ')[0]}</span>
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 z-50" style={{ background: '#fffaf0', border: '1px solid rgba(166,124,73,0.12)' }}>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-3 text-sm hover:bg-amber-50 text-black"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Tài khoản
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link
                                                to="/admin/products"
                                                className="block px-4 py-3 text-sm hover:bg-amber-50 text-black"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Quản lý kho hàng
                                            </Link>
                                        )}
                                        <hr className="my-1 border-stone-100" />
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

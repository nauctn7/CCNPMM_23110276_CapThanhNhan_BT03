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
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
            <div className="bg-stone-900 text-stone-300 text-center text-xs py-2 tracking-wide">
                Miễn phí giao hàng đơn từ 2 triệu · Bảo hành chính hãng · Swarovski & Daniel Wellington
            </div>
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center gap-4">
                    <Link to="/" className="flex-shrink-0">
                        <span className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">
                            LUXURY
                        </span>
                        <span className="text-xl md:text-2xl font-light text-amber-600 ml-1">JEWELRY</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <Link to="/" className={navLink}>Trang chủ</Link>
                        <Link to="/products" className={navLink}>Sản phẩm</Link>
                        <Link to="/promotions" className={navLink}>Khuyến mãi</Link>
                    </nav>

                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-md items-center bg-stone-100 rounded-full px-4 py-2 border border-stone-200 focus-within:ring-2 focus-within:ring-amber-500/30"
                    >
                        <input
                            type="text"
                            placeholder="Tìm nhẫn, dây chuyền, bông tai..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm text-stone-700"
                        />
                        <button type="submit" className="text-amber-700 font-medium text-sm">
                            Tìm
                        </button>
                    </form>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Link
                            to={isAuthenticated ? '/cart' : '/login'}
                            onClick={handleCartClick}
                            className="relative p-2 rounded-full hover:bg-stone-100 transition text-stone-700"
                            title="Giỏ hàng"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {isAuthenticated && totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-stone-100 hover:bg-stone-200 transition text-sm font-medium text-stone-800"
                                >
                                    <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                    <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-100 py-1 z-50">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2.5 text-sm hover:bg-stone-50"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Tài khoản
                                        </Link>
                                        <hr className="my-1 border-stone-100" />
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
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

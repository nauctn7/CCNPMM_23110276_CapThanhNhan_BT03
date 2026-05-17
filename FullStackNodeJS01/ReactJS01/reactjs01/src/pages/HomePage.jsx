import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../components/context/AuthContext';
import HeroSection from '../components/home/HeroSection';
import CategoryProductsSection from '../components/home/CategoryProductsSection';
import ProductCard from '../components/products/ProductCard';

const SectionHeader = ({ title, icon, linkTo, linkText = 'Xem tất cả →' }) => (
    <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">{icon} {title}</h2>
        {linkTo && (
            <Link to={linkTo} className="text-amber-700 hover:underline font-medium">
                {linkText}
            </Link>
        )}
    </div>
);

const HomePage = () => {
    const [featured, setFeatured] = useState({ newProducts: [], hotProducts: [], saleProducts: [] });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await api.get('/api/products/featured');
                if (response.data.EC === 0) {
                    setFeatured({
                        newProducts: response.data.newProducts || [],
                        hotProducts: response.data.hotProducts || [],
                        saleProducts: response.data.saleProducts || [],
                    });
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" />
                <span className="ml-3 text-amber-700 text-lg">Đang tải sản phẩm...</span>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            {user && (
                <div className="bg-pink-500 text-white py-3 text-center">
                    <p>
                        Chào mừng <strong>{user.name}</strong> quay trở lại LUXURY JEWELRY!
                        Khám phá ưu đãi dành riêng cho thành viên.
                    </p>
                </div>
            )}

            <HeroSection />

            {featured.saleProducts.length > 0 && (
                <section className="bg-white py-12">
                    <div className="container-custom">
                        <SectionHeader title="Khuyến mãi đặc biệt" icon="🏷️" linkTo="/promotions" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featured.saleProducts.slice(0, 4).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {featured.newProducts.length > 0 && (
                <section className="container-custom py-12">
                    <SectionHeader title="Sản phẩm mới nhất" icon="✨" linkTo="/products?isNew=true" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featured.newProducts.slice(0, 4).map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            <section className="bg-gradient-to-r from-pink-400 to-pink-600 py-14 my-4">
                <div className="container-custom text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Siêu khuyến mãi — Giảm đến 30%</h2>
                    <p className="text-lg mb-2 text-pink-100">
                        Nhân dịp khai trương, tặng voucher 100.000đ cho đơn hàng đầu tiên
                    </p>
                    <p className="text-sm text-pink-200 mb-6">Áp dụng cho thành viên đã đăng nhập</p>
                    <Link to="/promotions" className="inline-block bg-white text-amber-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                        Xem tất cả khuyến mãi
                    </Link>
                </div>
            </section>

            {featured.hotProducts.length > 0 && (
                <section className="container-custom py-12">
                    <SectionHeader title="Bán chạy nhất" icon="🔥" linkTo="/products?isHot=true" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featured.hotProducts.slice(0, 4).map((product) => (
                            <ProductCard key={product._id} product={product} showSold />
                        ))}
                    </div>
                </section>
            )}

            <CategoryProductsSection />

            <section className="container-custom py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tìm món trang sức hoàn hảo cho bạn</h2>
                <p className="text-gray-500 mb-6 max-w-xl mx-auto">
                    Hàng trăm mẫu nhẫn, dây chuyền, bông tai cao cấp — lọc theo danh mục, giá, chất liệu
                </p>
                <Link to="/products" className="btn-primary">Khám phá ngay</Link>
            </section>
        </div>
    );
};

export default HomePage;


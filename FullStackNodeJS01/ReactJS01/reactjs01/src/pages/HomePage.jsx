import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../components/context/AuthContext';
import HeroSection from '../components/home/HeroSection';
import CategoryProductsSection from '../components/home/CategoryProductsSection';
import ProductCarousel from '../components/products/ProductCarousel';
import ProductCard from '../components/products/ProductCard';

const SectionHeader = ({
    title,
    icon,
    linkTo,
    linkText = 'Xem tất cả →',
    titleStyle = {},
    linkStyle = {},
}) => (
    <div className="flex justify-between items-center mb-6">
        <h2 className="section-title lux-heading" style={titleStyle}>{icon} {title}</h2>
        {linkTo && (
            <Link to={linkTo} className="hover:underline font-semibold" style={{ color: '#8b6b4a', ...linkStyle }}>
                {linkText}
            </Link>
        )}
    </div>
);

const HomePage = () => {
    const [featured, setFeatured] = useState({ newProducts: [], hotProducts: [], saleProducts: [] });
    const [topBestSellers, setTopBestSellers] = useState([]);
    const [topMostViewed, setTopMostViewed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topProductsLoading, setTopProductsLoading] = useState(true);
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

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const [bestSellersRes, mostViewedRes] = await Promise.all([
                    api.get('/api/products/top/bestsellers?limit=10'),
                    api.get('/api/products/top/mostviewed?limit=10')
                ]);
                
                if (bestSellersRes.data.EC === 0) {
                    setTopBestSellers(bestSellersRes.data.products || []);
                }
                if (mostViewedRes.data.EC === 0) {
                    setTopMostViewed(mostViewedRes.data.products || []);
                }
            } catch (error) {
                console.error('Error fetching top products:', error);
            } finally {
                setTopProductsLoading(false);
            }
        };
        fetchTopProducts();
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
        <div>
            {user && (
                <div style={{ background: 'linear-gradient(180deg,#fff6f8,#fff0f4)' }} className="py-4 text-center shadow-sm">
                    <p style={{ color: '#ff7fa1', fontWeight: 700, textShadow: '0 2px 0 #fff, 0 6px 12px rgba(0,0,0,0.08)', fontSize: 16 }}>
                        Chào mừng <strong style={{ display: 'inline-block', transform: 'translateZ(0)', textShadow: '0 3px 0 #fff, 0 8px 18px rgba(0,0,0,0.12)', color: '#ff8fb3' }}>{user.name}</strong> quay trở lại LUXURY JEWELRY! Khám phá ưu đãi dành riêng cho thành viên.
                    </p>
                </div>
            )}

            <HeroSection />

            {featured.saleProducts.length > 0 && (
                <section className="bg-white py-12">
                    <div className="container-custom">
                        <SectionHeader
                            title="Khuyến mãi đặc biệt"
                            icon="🏷️"
                            linkTo="/promotions"
                            titleStyle={{ color: '#7a431e' }}
                            linkStyle={{ color: '#7a431e' }}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featured.saleProducts.slice(0, 4).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Top Best Sellers Section */}
            <ProductCarousel
                products={topBestSellers}
                title="Sản phẩm bán chạy nhất"
                icon="🔥"
                loading={topProductsLoading}
                showSold={true}
            />

            {/* Top Most Viewed Section */}
            <ProductCarousel
                products={topMostViewed}
                title="Sản phẩm xem nhiều nhất"
                icon="👀"
                loading={topProductsLoading}
            />

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

            <section className="py-14 my-4">
                <div className="container-custom text-center" style={{ background: 'linear-gradient(180deg,#fffdf8 0%, #fbf6ef 100%)', borderRadius: '12px', padding: '36px', boxShadow: '0 12px 30px rgba(45,34,28,0.08)', border: '1px solid rgba(166,124,73,0.08)' }}>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3b2a20' }}>Siêu khuyến mãi — Giảm đến 30%</h2>
                    <p className="text-lg mb-2" style={{ color: '#6b5546' }}>
                        Nhân dịp khai trương, tặng voucher 100.000đ cho đơn hàng đầu tiên
                    </p>
                    <p className="text-sm mb-6" style={{ color: '#8b6b4a' }}>Áp dụng cho thành viên đã đăng nhập</p>
                    <Link to="/promotions" className="inline-block px-8 py-3 rounded-lg font-semibold lux-accent hover:opacity-95 transition shadow-lg">
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
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#f6eadf' }}>Tìm món trang sức hoàn hảo cho bạn</h2>
                <p className="mb-6 max-w-xl mx-auto" style={{ color: '#d8c9b1' }}>
                    Hàng trăm mẫu nhẫn, dây chuyền, bông tai cao cấp — lọc theo danh mục, giá, chất liệu
                </p>
                <Link to="/products" className="btn-primary">Khám phá ngay</Link>
            </section>
        </div>
    );
};

export default HomePage;


import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import ProductGallery from '../components/products/ProductGallery';
import { useAuth } from '../components/context/AuthContext';
import { useCart } from '../components/context/CartContext';
import { formatPrice, getCategoryLabel } from '../utils/constants';
import { redirectToLogin } from '../utils/guestGuard';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addedMsg, setAddedMsg] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setQty(1);
            try {
                const res = await api.get(`/api/products/${slug}`);
                if (res.data?.EC === 0 && res.data.product) {
                    setProduct(res.data.product);
                    setRelatedProducts(res.data.relatedProducts || []);
                } else {
                    setProduct(null);
                }
            } catch (err) {
                console.error(err);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const maxQty = product?.stock ?? 0;
    const outOfStock = maxQty <= 0;
    const lowStock = !outOfStock && maxQty <= 5;

    const decreaseQty = () => setQty((q) => Math.max(1, q - 1));
    const increaseQty = () => setQty((q) => Math.min(maxQty, q + 1));

    const requireLoginForPurchase = () => {
        redirectToLogin(
            navigate,
            `/product/${slug}`,
            'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng hoặc mua hàng.'
        );
    };

    const handleAddToCart = () => {
        if (outOfStock) return;
        if (!isAuthenticated) {
            requireLoginForPurchase();
            return;
        }
        const result = addToCart(product, qty);
        if (result?.needLogin) {
            requireLoginForPurchase();
            return;
        }
        if (result?.success) {
            setAddedMsg(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
            setTimeout(() => setAddedMsg(''), 3000);
        }
    };

    const handleBuyNow = () => {
        if (outOfStock) return;
        if (!isAuthenticated) {
            requireLoginForPurchase();
            return;
        }
        const result = addToCart(product, qty);
        if (result?.needLogin) {
            requireLoginForPurchase();
            return;
        }
        if (result?.success) {
            navigate('/cart');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-amber-600 border-t-transparent" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container-custom py-20 text-center">
                <p className="text-xl text-gray-600 mb-6">Không tìm thấy sản phẩm</p>
                <Link to="/products" className="btn-primary">Khám phá bộ sưu tập</Link>
            </div>
        );
    }

    const images = product.images?.length ? product.images : ['https://via.placeholder.com/600'];

    return (
        <div className="bg-stone-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container-custom py-4">
                    <nav className="text-sm text-gray-500 flex flex-wrap items-center gap-1">
                        <Link to="/" className="hover:text-amber-700 transition">Trang chủ</Link>
                        <span className="text-gray-300">/</span>
                        <Link to="/products" className="hover:text-amber-700 transition">Sản phẩm</Link>
                        <span className="text-gray-300">/</span>
                        <Link
                            to={`/products?category=${product.category}`}
                            className="hover:text-amber-700 text-amber-700 font-medium transition"
                        >
                            {getCategoryLabel(product.category)}
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-800 line-clamp-1">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container-custom py-8 lg:py-12">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Gallery */}
                        <div className="p-6 lg:p-8 bg-stone-50">
                            <ProductGallery images={images} productName={product.name} />
                        </div>

                        {/* Info */}
                        <div className="p-6 lg:p-10 flex flex-col">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Link
                                    to={`/products?category=${product.category}`}
                                    className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1.5 rounded-full font-semibold hover:bg-amber-100 transition"
                                >
                                    <span>📂</span>
                                    {getCategoryLabel(product.category)}
                                </Link>
                                {product.isNew && (
                                    <span className="bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">Mới</span>
                                )}
                                {product.isHot && (
                                    <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">Bán chạy</span>
                                )}
                                {product.discount > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[58px] h-7 px-3 rounded-full bg-red-500 text-white text-xs font-semibold leading-none">
                                        -{product.discount}%
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-3xl lg:text-4xl font-bold text-amber-700">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice > product.price && (
                                    <span className="text-lg text-gray-400 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex text-amber-500 text-lg">
                                    {'★'.repeat(Math.round(product.rating || 0))}
                                    <span className="text-gray-300">{'★'.repeat(5 - Math.round(product.rating || 0))}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {product.rating?.toFixed(1)} · {product.totalReviews || 0} đánh giá · {product.views || 0} lượt xem
                                </span>
                            </div>

                            <p className="text-gray-600 mb-6 leading-relaxed text-base">
                                {product.shortDescription || product.description}
                            </p>

                            {/* Specs */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {product.material && (
                                    <div className="bg-stone-50 rounded-xl p-3 border">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Chất liệu</p>
                                        <p className="font-semibold text-stone-800">{product.material}</p>
                                    </div>
                                )}
                                {product.gemstone && (
                                    <div className="bg-stone-50 rounded-xl p-3 border">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Đá quý</p>
                                        <p className="font-semibold text-stone-800">{product.gemstone}</p>
                                    </div>
                                )}
                                {product.weight && (
                                    <div className="bg-stone-50 rounded-xl p-3 border">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Trọng lượng</p>
                                        <p className="font-semibold text-stone-800">{product.weight}g</p>
                                    </div>
                                )}
                                <div className="bg-stone-50 rounded-xl p-3 border">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Danh mục</p>
                                    <p className="font-semibold text-amber-700">{getCategoryLabel(product.category)}</p>
                                </div>
                            </div>

                            {/* Stock & sold */}
                            <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-r from-stone-50 to-amber-50/50 border border-amber-100">
                                <div className="flex-1 min-w-[140px]">
                                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase">Tồn kho</p>
                                    {outOfStock ? (
                                        <p className="font-bold text-red-600 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                                            Hết hàng
                                        </p>
                                    ) : lowStock ? (
                                        <p className="font-bold text-orange-600 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
                                            Sắp hết — còn {product.stock}
                                        </p>
                                    ) : (
                                        <p className="font-bold text-emerald-700 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                                            Còn {product.stock} sản phẩm
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1 min-w-[140px] border-l border-amber-200 pl-4">
                                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase">Đã bán</p>
                                    <p className="font-bold text-stone-800 text-lg">{product.sold || 0}</p>
                                </div>
                            </div>

                            {outOfStock && (
                                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    Sản phẩm đã hết hàng. Xem các sản phẩm tương tự cùng danh mục bên dưới.
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-stone-700 mb-3">Số lượng</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={decreaseQty}
                                            disabled={qty <= 1 || outOfStock}
                                            aria-label="Giảm"
                                            className="w-12 h-12 text-xl font-bold text-black hover:bg-stone-100 disabled:opacity-40 transition"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={maxQty}
                                            value={qty}
                                            onChange={(e) => {
                                                const v = parseInt(e.target.value, 10) || 1;
                                                setQty(Math.max(1, Math.min(maxQty || 1, v)));
                                            }}
                                            disabled={outOfStock}
                                            className="w-14 text-center font-bold text-lg text-black border-x-2 border-stone-200 py-2 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={increaseQty}
                                            disabled={qty >= maxQty || outOfStock}
                                            aria-label="Tăng"
                                            className="w-12 h-12 text-xl font-bold text-black hover:bg-stone-100 disabled:opacity-40 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {!outOfStock && (
                                        <span className="text-sm text-gray-400">Tối đa {maxQty}</span>
                                    )}
                                </div>
                            </div>

                            {!isAuthenticated && !outOfStock && (
                                <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                    🔒 Đăng nhập để thêm vào giỏ hàng. Khách chỉ được xem sản phẩm.
                                </p>
                            )}

                            {addedMsg && (
                                <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
                                    ✓ {addedMsg}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={outOfStock}
                                    className="btn-primary flex-1 py-4 text-base text-black disabled:opacity-50"
                                >
                                    {outOfStock ? 'Hết hàng' : isAuthenticated ? 'Thêm vào giỏ hàng' : 'Đăng nhập để mua'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    disabled={outOfStock}
                                    className="flex-1 sm:flex-none py-4 px-6 rounded-xl font-semibold text-white transition disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #2f1a10, #120805)', boxShadow: '0 14px 30px rgba(18, 8, 5, 0.35)' }}
                                >
                                    Mua ngay
                                </button>
                            </div>

                            {/* Trust */}
                            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t text-center text-xs text-gray-500">
                                <div>
                                    <span className="text-lg block mb-1">🛡️</span>
                                    Bảo hành chính hãng
                                </div>
                                <div>
                                    <span className="text-lg block mb-1">🚚</span>
                                    Giao hàng toàn quốc
                                </div>
                                <div>
                                    <span className="text-lg block mb-1">💎</span>
                                    Chứng nhận đá quý
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="border-t px-6 lg:px-10 py-8 bg-white">
                        <h2 className="text-xl font-bold text-stone-900 mb-4">Mô tả chi tiết</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line max-w-4xl">
                            {product.description}
                        </p>
                    </div>
                </div>

                {/* Related */}
                {relatedProducts.length > 0 && (
                    <section className="mt-14">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="section-title text-black">Sản phẩm tương tự</h2>
                                <p className="text-stone-900 mt-2">
                                    Cùng danh mục{' '}
                                    <Link
                                        to={`/products?category=${product.category}`}
                                        className="text-stone-900 hover:underline font-semibold"
                                    >
                                        {getCategoryLabel(product.category)}
                                    </Link>
                                </p>
                            </div>
                            <Link
                                to={`/products?category=${product.category}`}
                                className="hidden sm:inline-flex items-center gap-1 text-stone-900 font-semibold hover:gap-2 transition-all"
                            >
                                Xem tất cả →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p._id} product={p} showCategory showSold />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;

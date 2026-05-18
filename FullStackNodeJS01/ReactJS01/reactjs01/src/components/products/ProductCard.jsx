import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getCategoryLabel } from '../../utils/constants';

const ProductCard = ({ product, showSold = false, showCategory = false }) => {
    const outOfStock = (product.stock ?? 0) <= 0;

    return (
        <div className="rounded-xl overflow-hidden transition-all duration-300 group lux-card">
            <Link to={`/product/${product.slug}`}>
                <div className="relative overflow-hidden h-64">
                    <img
                        src={product.images?.[0] || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.discount > 0 && (
                            <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: '#5a1f18', color: '#fff' }}>
                                -{product.discount}%
                            </span>
                        )}
                        {product.isNew && (
                            <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: '#235f42', color: '#fff' }}>
                                Mới
                            </span>
                        )}
                        {product.isHot && (
                            <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: '#b8732a', color: '#fff' }}>
                                Hot
                            </span>
                        )}
                    </div>
                    {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="px-3 py-1 rounded-lg font-bold text-sm" style={{ background: '#7a2b2b', color: '#fff' }}>
                                Hết hàng
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    {showCategory && (
                        <p className="text-xs font-medium mb-1 lux-muted">
                            {getCategoryLabel(product.category)}
                        </p>
                    )}
                    <h3 className="font-semibold hover:opacity-95 transition line-clamp-2 min-h-[2.5rem] lux-heading">
                        {product.name}
                    </h3>
                    <p className="text-sm mb-2 mt-1 lux-muted">
                        {product.material}
                        {showSold && product.sold > 0 && (
                            <span className="ml-2 text-xs" style={{ color: '#d6b884' }}>· Đã bán {product.sold}</span>
                        )}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm mb-2">
                        {'★'.repeat(Math.round(product.rating || 0))}
                        <span className="text-xs ml-1 lux-muted">({product.totalReviews || 0})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold lux-price">
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                            <span className="text-sm line-through lux-muted">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;

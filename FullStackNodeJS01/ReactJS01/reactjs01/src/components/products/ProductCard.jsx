import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getCategoryLabel } from '../../utils/constants';

const ProductCard = ({ product, showSold = false, showCategory = false }) => {
    const outOfStock = (product.stock ?? 0) <= 0;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <Link to={`/product/${product.slug}`}>
                <div className="relative overflow-hidden h-64">
                    <img
                        src={product.images?.[0] || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.discount > 0 && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                -{product.discount}%
                            </span>
                        )}
                        {product.isNew && (
                            <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                Mới
                            </span>
                        )}
                        {product.isHot && (
                            <span className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                Hot
                            </span>
                        )}
                    </div>
                    {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                Hết hàng
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    {showCategory && (
                        <p className="text-xs text-pink-500 font-medium mb-1">
                            {getCategoryLabel(product.category)}
                        </p>
                    )}
                    <h3 className="font-semibold text-gray-800 hover:text-pink-500 transition line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 mt-1">
                        {product.material}
                        {showSold && product.sold > 0 && (
                            <span className="ml-2 text-orange-500">· Đã bán {product.sold}</span>
                        )}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm mb-2">
                        {'★'.repeat(Math.round(product.rating || 0))}
                        <span className="text-gray-400 text-xs ml-1">({product.totalReviews || 0})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-pink-500">
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
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

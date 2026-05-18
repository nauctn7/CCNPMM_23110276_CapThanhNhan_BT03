import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../products/ProductCard';
import { CATEGORIES } from '../../utils/constants';

const CategoryProductsSection = () => {
    const [byCategory, setByCategory] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchByCategory = async () => {
            try {
                const results = await Promise.all(
                    CATEGORIES.map(async (cat) => {
                        const res = await api.get(
                            `/api/products?category=${encodeURIComponent(cat.value)}&limit=4&sort=newest`
                        );
                        return {
                            category: cat.value,
                            products: res.data.EC === 0 ? res.data.products || [] : [],
                        };
                    })
                );
                const map = {};
                results.forEach(({ category, products }) => {
                    if (products.length > 0) map[category] = products;
                });
                setByCategory(map);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchByCategory();
    }, []);

    if (loading) {
        return (
            <section className="container-custom py-12">
                <h2 className="section-title mb-6 lux-heading-dark">Sản phẩm theo danh mục</h2>
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent" />
                </div>
            </section>
        );
    }

    const categoriesWithProducts = CATEGORIES.filter((c) => byCategory[c.value]?.length > 0);

    if (categoriesWithProducts.length === 0) return null;

    return (
        <section className="bg-gray-50 py-12">
            <div className="container-custom">
                <h2 className="section-title mb-2 lux-heading-dark">Sản phẩm theo danh mục</h2>
                <p className="text-gray-500 mb-8">Khám phá bộ sưu tập trang sức được phân loại rõ ràng</p>

                {categoriesWithProducts.map((cat) => (
                    <div key={cat.value} className="mb-12 last:mb-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{cat.label}</h3>
                            <Link
                                to={`/products?category=${encodeURIComponent(cat.value)}`}
                                className="text-pink-500 hover:underline font-medium text-sm"
                            >
                                Xem tất cả →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {byCategory[cat.value].map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategoryProductsSection;

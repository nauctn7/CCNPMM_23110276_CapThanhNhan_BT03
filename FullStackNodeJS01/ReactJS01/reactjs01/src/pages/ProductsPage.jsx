import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import ProductFilter from '../components/products/ProductFilter';
import { CATEGORIES, getCategoryLabel, formatPrice } from '../utils/constants';

const DEFAULT_FILTERS = {
    search: '',
    category: '',
    material: '',
    gemstone: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    isNew: '',
    isHot: '',
    isSale: '',
    inStock: '',
    sort: 'newest',
};

const EMPTY_FILTERS = Object.freeze({});

const ProductsPage = ({ pageTitle = 'Sản phẩm', defaultFilters }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    const safeDefaultFilters = defaultFilters || EMPTY_FILTERS;
    const searchParamsKey = searchParams.toString();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

    const filters = useMemo(() => {
        const f = { ...DEFAULT_FILTERS, ...safeDefaultFilters };
        Object.keys(DEFAULT_FILTERS).forEach((key) => {
            const val = searchParams.get(key);
            if (val) f[key] = val;
        });
        return f;
    }, [searchParamsKey, safeDefaultFilters]);

    useEffect(() => {
        setSearchInput(searchParams.get('search') || '');
    }, [searchParamsKey]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, val]) => {
                    if (val) params.set(key, val);
                });
                params.set('page', page);
                params.set('limit', '12');

                const res = await api.get(`/api/products?${params.toString()}`);
                if (res.data.EC === 0) {
                    setProducts(res.data.products || []);
                    setTotal(res.data.total || 0);
                    setTotalPages(res.data.totalPages || 1);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters, page]);

    const applyFilters = (newFilters, newPage = 1) => {
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, val]) => {
            if (val) params.set(key, val);
        });
        if (newPage > 1) params.set('page', newPage);
        setSearchParams(params);
    };

    const handleFilterChange = (newFilters) => {
        applyFilters(newFilters, 1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ ...filters, search: searchInput.trim() }, 1);
    };

    const handleReset = () => {
        setSearchInput('');
        applyFilters({ ...DEFAULT_FILTERS, ...safeDefaultFilters }, 1);
    };

    const handleCategoryTab = (categoryValue) => {
        applyFilters({ ...filters, category: categoryValue }, 1);
    };

    const goToPage = (p) => {
        const params = new URLSearchParams(searchParams);
        if (p === 1) params.delete('page');
        else params.set('page', p);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const removeFilter = (key) => {
        applyFilters({ ...filters, [key]: safeDefaultFilters[key] || '' }, 1);
    };

    const activeChips = [
        filters.search && { key: 'search', label: `Từ khóa: "${filters.search}"` },
        filters.category && { key: 'category', label: `Danh mục: ${getCategoryLabel(filters.category)}` },
        filters.material && { key: 'material', label: `Chất liệu: ${filters.material}` },
        filters.gemstone && { key: 'gemstone', label: `Đá quý: ${filters.gemstone}` },
        filters.minPrice && { key: 'minPrice', label: `Giá từ: ${formatPrice(filters.minPrice)}` },
        filters.maxPrice && { key: 'maxPrice', label: `Giá đến: ${formatPrice(filters.maxPrice)}` },
        filters.minRating && { key: 'minRating', label: `${filters.minRating} sao trở lên` },
        filters.isSale === 'true' && { key: 'isSale', label: 'Đang giảm giá' },
        filters.isNew === 'true' && { key: 'isNew', label: 'Sản phẩm mới' },
        filters.isHot === 'true' && { key: 'isHot', label: 'Bán chạy' },
        filters.inStock === 'true' && { key: 'inStock', label: 'Còn hàng' },
    ].filter(Boolean);

    const activeFilterCount = activeChips.filter(
        (c) => !safeDefaultFilters[c.key]
    ).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white py-10">
                <div className="container-custom">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{pageTitle}</h1>
                    <p className="text-pink-100">
                        {total > 0 ? `Tìm thấy ${total} sản phẩm` : 'Khám phá bộ sưu tập trang sức cao cấp'}
                    </p>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    <button
                        type="button"
                        onClick={() => handleCategoryTab('')}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                            !filters.category
                                ? 'bg-pink-500 text-white shadow'
                                : 'bg-white text-gray-600 border hover:border-pink-300'
                        }`}
                    >
                        Tất cả
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleCategoryTab(cat.value)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                                filters.category === cat.value
                                    ? 'bg-pink-500 text-white shadow'
                                    : 'bg-white text-gray-600 border hover:border-pink-300'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm theo tên, mô tả, chất liệu, đá quý..."
                        className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none shadow-sm"
                    />
                    <button type="submit" className="btn-primary px-8">Tìm kiếm</button>
                    <button
                        type="button"
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="md:hidden btn-outline px-4"
                    >
                        Lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>
                </form>

                {/* Active filter chips */}
                {activeChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {activeChips.map((chip) => (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() => removeFilter(chip.key)}
                                className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-pink-200 transition"
                            >
                                {chip.label}
                                <span className="font-bold">×</span>
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-sm text-gray-500 hover:text-pink-500 underline"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`md:block ${showMobileFilter ? 'block' : 'hidden'}`}>
                        <ProductFilter
                            filters={filters}
                            onChange={handleFilterChange}
                            onReset={handleReset}
                        />
                    </div>

                    <div className="md:col-span-3">
                        {!loading && (
                            <p className="text-sm text-gray-500 mb-4">
                                Hiển thị {products.length} / {total} sản phẩm
                                {filters.sort && filters.sort !== 'newest' && (
                                    <span> · Sắp xếp theo bộ lọc</span>
                                )}
                            </p>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <p className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm phù hợp</p>
                                <button onClick={handleReset} className="btn-primary">Xóa bộ lọc</button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            showSold
                                            showCategory
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-8">
                                        <button
                                            onClick={() => goToPage(page - 1)}
                                            disabled={page <= 1}
                                            className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-pink-50"
                                        >
                                            ← Trước
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                            .map((p, idx, arr) => (
                                                <React.Fragment key={p}>
                                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                        <span className="px-2 text-gray-400">...</span>
                                                    )}
                                                    <button
                                                        onClick={() => goToPage(p)}
                                                        className={`w-10 h-10 rounded-lg font-medium ${
                                                            p === page
                                                                ? 'bg-pink-500 text-white'
                                                                : 'border hover:bg-pink-50'
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                        <button
                                            onClick={() => goToPage(page + 1)}
                                            disabled={page >= totalPages}
                                            className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-pink-50"
                                        >
                                            Sau →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;

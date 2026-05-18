import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [lazyLoadMode, setLazyLoadMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const loadingMoreRef = useRef(false);

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

    // Fetch products for pagination mode
    useEffect(() => {
        if (!lazyLoadMode) {
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
        }
    }, [filters, page, lazyLoadMode]);

    // Fetch products for lazy loading mode
    const fetchLazyLoadProducts = useCallback(async (pageNum = 1, append = false) => {
        if (pageNum > 1 && loadingMoreRef.current) {
            return;
        }

        try {
            if (pageNum > 1) {
                loadingMoreRef.current = true;
            }

            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, val]) => {
                if (val) params.set(key, val);
            });
            params.set('page', pageNum);
            params.set('limit', '12');

            if (pageNum > 1) setLoadingMore(true);
            else setLoading(true);

            const res = await api.get(`/api/products?${params.toString()}`);
            if (res.data.EC === 0) {
                if (append) {
                    setProducts((prev) => [...prev, ...(res.data.products || [])]);
                } else {
                    setProducts(res.data.products || []);
                }
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
                setCurrentPage(pageNum);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (pageNum > 1) {
                loadingMoreRef.current = false;
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    }, [filters]);

    // Initialize lazy loading mode
    useEffect(() => {
        if (lazyLoadMode) {
            setCurrentPage(1);
            fetchLazyLoadProducts(1, false);
        }
    }, [lazyLoadMode, filters, fetchLazyLoadProducts]);

    // Infinite scroll trigger using the window scroll position.
    useEffect(() => {
        if (!lazyLoadMode || loading || loadingMore || currentPage >= totalPages) {
            return undefined;
        }

        const triggerLoadMore = () => {
            const scrolledNearBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400;

            if (scrolledNearBottom && !loadingMoreRef.current) {
                fetchLazyLoadProducts(currentPage + 1, true);
            }
        };

        window.addEventListener('scroll', triggerLoadMore, { passive: true });
        window.addEventListener('resize', triggerLoadMore);
        triggerLoadMore();

        return () => {
            window.removeEventListener('scroll', triggerLoadMore);
            window.removeEventListener('resize', triggerLoadMore);
        };
    }, [lazyLoadMode, loading, loadingMore, currentPage, totalPages, fetchLazyLoadProducts]);

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
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#fffdf8 0%, #fbf6ef 100%)' }}>
            <div className="py-10">
                <div className="container-custom">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 lux-heading-dark">{pageTitle}</h1>
                    <p className="lux-subtitle-dark">
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
                                ? 'lux-accent'
                                : 'bg-white text-gray-700 border hover:border-amber-400'
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
                                    ? 'lux-accent'
                                    : 'bg-white text-gray-700 border hover:border-amber-400'
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
                        className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none shadow-sm bg-white text-gray-900"
                    />
                    <button type="submit" className="btn-primary px-8 lux-accent">Tìm kiếm</button>
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
                                className="px-3 py-1 rounded-full text-sm flex items-center gap-1 transition border shadow-sm"
                                style={{ background: 'rgba(184,135,74,0.10)', borderColor: 'rgba(184,135,74,0.25)', color: '#7a431e' }}
                            >
                                {chip.label}
                                <span className="font-bold">×</span>
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-sm font-medium underline"
                            style={{ color: '#8b6b4a' }}
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
                        {/* Display Mode Toggle */}
                        <div className="mb-4 flex gap-2 items-center">
                            <span className="text-sm text-gray-600">Chế độ hiển thị:</span>
                            <button
                                type="button"
                                onClick={() => setLazyLoadMode(false)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border shadow-sm ${
                                    !lazyLoadMode
                                        ? 'lux-accent border-transparent'
                                        : 'bg-white text-gray-700 border-[#d8c6b1] hover:border-[#b8874a] hover:bg-[#fffaf3]'
                                }`}
                            >
                                📄 Phân trang
                            </button>
                            <button
                                type="button"
                                onClick={() => setLazyLoadMode(true)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border shadow-sm ${
                                    lazyLoadMode
                                        ? 'lux-accent border-transparent'
                                        : 'bg-white text-gray-700 border-[#d8c6b1] hover:border-[#b8874a] hover:bg-[#fffaf3]'
                                }`}
                            >
                                ∞ Tải tiếp
                            </button>
                        </div>

                        {!loading && (
                            <p className="text-sm text-gray-500 mb-4">
                                Hiển thị {products.length} / {total} sản phẩm
                                {filters.sort && filters.sort !== 'newest' && (
                                    <span> · Sắp xếp theo bộ lọc</span>
                                )}
                            </p>
                        )}

                        {loading && (!lazyLoadMode || products.length === 0) ? (
                            <div className="flex justify-center items-center h-64 rounded-2xl border border-[#e5d7c7] bg-white/80 shadow-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#b8874a] border-t-transparent" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-[#e5d7c7]">
                                <p className="text-lg mb-4" style={{ color: '#6b5546' }}>Không tìm thấy sản phẩm phù hợp</p>
                                <button type="button" onClick={handleReset} className="btn-primary">Xóa bộ lọc</button>
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

                                {lazyLoadMode && currentPage < totalPages && (
                                    <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-[#e5d7c7] bg-white/70 p-5 text-center shadow-sm">
                                        <p className="text-sm" style={{ color: '#6b5546' }}>
                                            Cuộn xuống để tự tải tiếp hoặc nhấn nút bên dưới.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => fetchLazyLoadProducts(currentPage + 1, true)}
                                            disabled={loadingMore}
                                            className="btn-primary rounded-full px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {loadingMore ? 'Đang tải...' : 'Tải thêm sản phẩm'}
                                        </button>
                                    </div>
                                )}

                                {lazyLoadMode && currentPage >= totalPages && products.length > 0 && (
                                    <div className="py-8 text-center">
                                        <p className="text-gray-500">Đã tải hết tất cả sản phẩm</p>
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {!lazyLoadMode && totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => goToPage(page - 1)}
                                            disabled={page <= 1}
                                            className="px-4 py-2 border rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm bg-white hover:bg-[#fff7ed]"
                                            style={{ borderColor: 'rgba(184,135,74,0.30)', color: '#5c4636' }}
                                        >
                                            ← Trước
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                            .map((p, idx, arr) => (
                                                <React.Fragment key={p}>
                                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                        <span className="px-2" style={{ color: '#b09a87' }}>...</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => goToPage(p)}
                                                        className={`w-10 h-10 rounded-full font-semibold transition shadow-sm ${
                                                            p === page
                                                                ? 'lux-accent border-transparent'
                                                                : 'border bg-white hover:bg-[#fff7ed]'
                                                        }`}
                                                        style={p !== page ? { borderColor: 'rgba(184,135,74,0.30)', color: '#5c4636' } : undefined}
                                                    >
                                                        {p}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                        <button
                                            type="button"
                                            onClick={() => goToPage(page + 1)}
                                            disabled={page >= totalPages}
                                            className="px-4 py-2 border rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm bg-white hover:bg-[#fff7ed]"
                                            style={{ borderColor: 'rgba(184,135,74,0.30)', color: '#5c4636' }}
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

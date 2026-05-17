import React from 'react';
import {
    CATEGORIES,
    MATERIALS,
    SORT_OPTIONS,
    GEMSTONE_OPTIONS,
    RATING_OPTIONS,
} from '../../utils/constants';

const ProductFilter = ({ filters, onChange, onReset }) => {
    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    const toggleFlag = (key) => {
        onChange({ ...filters, [key]: filters[key] === 'true' ? '' : 'true' });
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-5 space-y-5 sticky top-24">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">Bộ lọc</h3>
                <button
                    type="button"
                    onClick={onReset}
                    className="text-sm text-pink-500 hover:underline"
                >
                    Xóa bộ lọc
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
                <select
                    value={filters.sort || 'newest'}
                    onChange={(e) => handleChange('sort', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select
                    value={filters.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                >
                    <option value="">Tất cả danh mục</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chất liệu</label>
                <select
                    value={filters.material || ''}
                    onChange={(e) => handleChange('material', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                >
                    <option value="">Tất cả chất liệu</option>
                    {MATERIALS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại đá quý</label>
                <select
                    value={filters.gemstone || ''}
                    onChange={(e) => handleChange('gemstone', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                >
                    {GEMSTONE_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá (VNĐ)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Từ"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleChange('minPrice', e.target.value)}
                        className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                        min="0"
                    />
                    <input
                        type="number"
                        placeholder="Đến"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleChange('maxPrice', e.target.value)}
                        className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                        min="0"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá tối thiểu</label>
                <select
                    value={filters.minRating || ''}
                    onChange={(e) => handleChange('minRating', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                >
                    {RATING_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại sản phẩm</label>
                <div className="space-y-2">
                    {[
                        { key: 'isNew', label: '✨ Sản phẩm mới' },
                        { key: 'isHot', label: '🔥 Bán chạy' },
                        { key: 'isSale', label: '🏷️ Đang giảm giá' },
                        { key: 'inStock', label: '📦 Còn hàng' },
                    ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters[key] === 'true'}
                                onChange={() => toggleFlag(key)}
                                className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductFilter;

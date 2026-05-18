import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { CATEGORIES, MATERIALS, formatPrice } from '../utils/constants';

const EMPTY_FORM = {
    name: '',
    category: CATEGORIES[0]?.value || 'Nhan',
    price: '',
    originalPrice: '',
    stock: '',
    sold: 0,
    material: MATERIALS[0]?.value || 'Vang 18K',
    weight: '',
    gemstone: '',
    shortDescription: '',
    description: '',
    imagesText: '',
    isNew: false,
    isHot: false,
    isSale: false,
};

const buildPayload = (form) => ({
    name: form.name,
    category: form.category,
    price: form.price,
    originalPrice: form.originalPrice,
    stock: form.stock,
    sold: form.sold,
    material: form.material,
    weight: form.weight,
    gemstone: form.gemstone,
    shortDescription: form.shortDescription,
    description: form.description,
    images: form.imagesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    isNew: form.isNew,
    isHot: form.isHot,
    isSale: form.isSale,
});

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);

    const modeTitle = useMemo(() => (editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'), [editingId]);

    const fetchProducts = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '10');
            if (query.trim()) params.set('search', query.trim());
            if (category) params.set('category', category);

            const res = await api.get(`/api/admin/products?${params.toString()}`);
            if (res.data?.EC === 0) {
                setProducts(res.data.products || []);
                setTotalPages(res.data.totalPages || 1);
            } else {
                setErrorMsg(res.data?.EM || 'Không thể tải danh sách sản phẩm');
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.EM || 'Lỗi tải dữ liệu quản trị');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, query, category]);

    const closeForm = () => {
        setShowForm(false);
        setEditingId('');
        setForm(EMPTY_FORM);
    };

    const openCreateForm = () => {
        setErrorMsg('');
        setSuccessMsg('');
        setEditingId('');
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEditForm = (product) => {
        setErrorMsg('');
        setSuccessMsg('');
        setEditingId(product._id);
        setForm({
            name: product.name || '',
            category: product.category || CATEGORIES[0]?.value || 'Nhan',
            price: product.price ?? '',
            originalPrice: product.originalPrice ?? '',
            stock: product.stock ?? '',
            sold: product.sold ?? 0,
            material: product.material || MATERIALS[0]?.value || 'Vang 18K',
            weight: product.weight ?? '',
            gemstone: product.gemstone || '',
            shortDescription: product.shortDescription || '',
            description: product.description || '',
            imagesText: (product.images || []).join('\n'),
            isNew: !!product.isNew,
            isHot: !!product.isHot,
            isSale: !!product.isSale,
        });
        setShowForm(true);
    };

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const payload = buildPayload(form);
            const res = editingId
                ? await api.put(`/api/admin/products/${editingId}`, payload)
                : await api.post('/api/admin/products', payload);

            if (res.data?.EC === 0) {
                setSuccessMsg(res.data.EM || 'Lưu sản phẩm thành công');
                closeForm();
                fetchProducts();
            } else {
                setErrorMsg(res.data?.EM || 'Không thể lưu sản phẩm');
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.EM || 'Lỗi lưu sản phẩm');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?');
        if (!ok) return;

        setDeletingId(id);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const res = await api.delete(`/api/admin/products/${id}`);
            if (res.data?.EC === 0) {
                setSuccessMsg('Xóa sản phẩm thành công');
                fetchProducts();
            } else {
                setErrorMsg(res.data?.EM || 'Không thể xóa sản phẩm');
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.EM || 'Lỗi xóa sản phẩm');
        } finally {
            setDeletingId('');
        }
    };

    const submitSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setQuery(search);
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#fdf8f1 0%, #f8eee2 100%)' }}>
            <div className="container-custom py-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-black">Quản trị sản phẩm</h1>
                        <p className="text-black mt-2">Thêm, chỉnh sửa, xóa sản phẩm và kiểm tra cập nhật ngoài trang chủ.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg text-base tracking-wide"
                        style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)', textShadow: '0 1px 1px rgba(0,0,0,0.25)' }}
                    >
                        + Thêm sản phẩm
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4 text-black">
                    <form onSubmit={submitSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            name="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, slug, danh mục..."
                            className="md:col-span-2 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-300 text-black placeholder:text-stone-400"
                        />
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(1);
                            }}
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-300 text-black"
                        >
                            <option value="">Tất cả danh mục</option>
                            {CATEGORIES.map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                        <button type="submit" className="rounded-xl px-4 py-3 font-semibold border border-amber-300 text-black bg-amber-50 hover:bg-amber-100">
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                {errorMsg && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">{errorMsg}</div>}
                {successMsg && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3">{successMsg}</div>}

                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden text-black">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-stone-50 text-black">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-black">Sản phẩm</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-black">Danh mục</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-black">Giá</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-black">Kho</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-black">Nhãn</th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-black">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td className="px-4 py-8 text-center text-stone-500" colSpan={6}>Đang tải dữ liệu...</td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-8 text-center text-stone-500" colSpan={6}>Không có sản phẩm.</td>
                                    </tr>
                                ) : (
                                    products.map((item) => (
                                        <tr key={item._id} className="border-t border-stone-100 hover:bg-stone-50/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.images?.[0] || 'https://via.placeholder.com/120'}
                                                        alt={item.name}
                                                        className="w-12 h-12 rounded-lg object-cover border"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                                                        <p className="text-xs text-stone-500 line-clamp-1">/{item.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-black">{item.category}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-black">{formatPrice(item.price || 0)}</td>
                                            <td className="px-4 py-3 text-sm text-black">{item.stock}</td>
                                            <td className="px-4 py-3 text-xs text-black">
                                                {item.isNew && <span className="mr-2 px-2 py-1 rounded bg-emerald-100 text-emerald-700">Mới</span>}
                                                {item.isHot && <span className="mr-2 px-2 py-1 rounded bg-orange-100 text-orange-700">Hot</span>}
                                                {item.isSale && <span className="px-2 py-1 rounded bg-rose-100 text-rose-700">Sale</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditForm(item)}
                                                    className="px-3 py-2 rounded-lg text-sm font-medium border border-stone-300 text-black hover:bg-stone-100 mr-2"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={deletingId === item._id}
                                                    className="px-3 py-2 rounded-lg text-sm font-medium border border-red-300 text-black hover:bg-red-50 disabled:opacity-60"
                                                >
                                                    {deletingId === item._id ? 'Đang xóa...' : 'Xóa'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 py-3 border-t border-stone-100 flex justify-between items-center">
                        <span className="text-sm text-black font-medium">Trang {page} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-1.5 rounded border text-black disabled:opacity-40"
                            >
                                Trước
                            </button>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="px-3 py-1.5 rounded border text-black disabled:opacity-40"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] bg-black/40 p-4 overflow-y-auto">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-200 text-black">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-stone-900">{modeTitle}</h2>
                            <button type="button" onClick={closeForm} className="text-black hover:text-stone-700 font-medium">Đóng</button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" value={form.name} onChange={handleInput} placeholder="Tên sản phẩm" className="border rounded-xl px-4 py-3 text-black placeholder:text-stone-400" required />
                            <select name="category" value={form.category} onChange={handleInput} className="border rounded-xl px-4 py-3 text-black" required>
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>

                            <input name="price" value={form.price} onChange={handleInput} placeholder="Giá" type="number" min="0" className="border rounded-xl px-4 py-3 text-black placeholder:text-stone-400" required />
                            <input name="originalPrice" value={form.originalPrice} onChange={handleInput} placeholder="Giá gốc" type="number" min="0" className="border rounded-xl px-4 py-3 text-black placeholder:text-stone-400" />

                            <input name="stock" value={form.stock} onChange={handleInput} placeholder="Tồn kho" type="number" min="0" className="border rounded-xl px-4 py-3 text-black placeholder:text-stone-400" required />
                            <input name="sold" value={form.sold} onChange={handleInput} placeholder="Đã bán" type="number" min="0" className="border rounded-xl px-4 py-3 text-black placeholder:text-stone-400" />

                            <select name="material" value={form.material} onChange={handleInput} className="border rounded-xl px-4 py-3 text-black">
                                {MATERIALS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <input name="weight" value={form.weight} onChange={handleInput} placeholder="Trọng lượng (gram)" type="number" min="0" step="0.1" className="border rounded-xl px-4 py-3 text-black placeholder:text-stone-400" />

                            <input name="gemstone" value={form.gemstone} onChange={handleInput} placeholder="Đá quý" className="border rounded-xl px-4 py-3 text-black placeholder:text-stone-400" />
                            <input name="shortDescription" value={form.shortDescription} onChange={handleInput} placeholder="Mô tả ngắn" className="border rounded-xl px-4 py-3 text-black placeholder:text-stone-400" />

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleInput}
                                placeholder="Mô tả chi tiết"
                                rows={4}
                                className="md:col-span-2 border rounded-xl px-4 py-3 text-black placeholder:text-stone-400"
                                required
                            />

                            <textarea
                                name="imagesText"
                                value={form.imagesText}
                                onChange={handleInput}
                                placeholder="Mỗi dòng là 1 URL ảnh"
                                rows={5}
                                className="md:col-span-2 border rounded-xl px-4 py-3 text-black placeholder:text-stone-400"
                                required
                            />

                            <label className="flex items-center gap-2 text-sm text-black"><input type="checkbox" name="isNew" checked={form.isNew} onChange={handleInput} /> Sản phẩm mới</label>
                            <label className="flex items-center gap-2 text-sm text-black"><input type="checkbox" name="isHot" checked={form.isHot} onChange={handleInput} /> Sản phẩm hot</label>
                            <label className="flex items-center gap-2 text-sm text-black"><input type="checkbox" name="isSale" checked={form.isSale} onChange={handleInput} /> Sản phẩm giảm giá</label>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg border border-stone-300 text-black">Hủy</button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-lg text-white font-semibold text-base disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)', textShadow: '0 1px 1px rgba(0,0,0,0.25)' }}
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;

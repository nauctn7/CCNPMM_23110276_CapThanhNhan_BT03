import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../components/context/AuthContext';
import { useCart } from '../components/context/CartContext';
import { formatPrice } from '../utils/constants';

const initialForm = {
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
};

const normalizePhoneNumber = (value) => String(value || '').replace(/\s|-/g, '').trim();

const isValidVietnamesePhoneNumber = (value) => {
    const digits = normalizePhoneNumber(value).replace(/\D/g, '');
    return (digits.length === 10 && digits.startsWith('0')) || (digits.length === 11 && digits.startsWith('84'));
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, totalPrice, refreshCart, loadingCart } = useCart();
    const location = useLocation();
    const selectedIdsFromNav = location.state?.selectedIds || null;

    // If selectedIds provided, filter items and compute totals accordingly
    const checkoutItems = selectedIdsFromNav && selectedIdsFromNav.length > 0 ? items.filter((i) => selectedIdsFromNav.includes(i._id)) : items;
    const checkoutTotalPrice = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const [form, setForm] = useState(() => ({
        ...initialForm,
        fullName: user?.name || '',
    }));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successOrder, setSuccessOrder] = useState(null);

    const shippingFee = useMemo(() => (checkoutTotalPrice >= 2000000 ? 0 : 30000), [checkoutTotalPrice]);
    const grandTotal = checkoutTotalPrice + shippingFee;

    if (loadingCart) {
        return (
            <div className="container-custom py-20 flex justify-center">
                <div className="rounded-full h-14 w-14 border-4 animate-spin" style={{ borderColor: '#b8874a', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!checkoutItems.length && !successOrder) {
        return (
            <div className="container-custom py-16 text-center">
                <h1 className="text-3xl font-bold mb-3" style={{ color: '#f7efe6' }}>Chưa có sản phẩm để thanh toán</h1>
                <p className="text-stone-300 mb-8">Hãy thêm sản phẩm vào giỏ hàng trước khi đặt hàng COD.</p>
                <Link to="/products" className="btn-primary">Quay lại mua sắm</Link>
            </div>
        );
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isValidVietnamesePhoneNumber(form.phone)) {
            setError('Số điện thoại không hợp lệ. Vui lòng nhập số Việt Nam hợp lệ, ví dụ 09xxxxxxxx hoặc +849xxxxxxxx.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await api.post('/api/orders/checkout', {
                ...form,
                paymentMethod: 'cod',
                selectedItemIds: checkoutItems.map((i) => i._id),
            });

            if (response.data.EC === 0) {
                // refresh cart from server to reflect removed purchased items
                await refreshCart();
                setSuccessOrder(response.data.order);
                return;
            }

            setError(response.data.EM || 'Không thể hoàn tất đơn hàng');
        } catch (checkoutError) {
            setError(checkoutError.response?.data?.EM || 'Không thể hoàn tất đơn hàng');
        } finally {
            setSubmitting(false);
        }
    };

    if (successOrder) {
        return (
            <div className="container-custom py-16">
                <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-amber-100 text-stone-900">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg,#8f5d2f,#d6a35d)', color: '#fff' }}>
                        ✓
                    </div>
                    <p className="text-sm uppercase tracking-[0.25em] text-amber-700 font-semibold mb-2">Đặt hàng thành công</p>
                    <h1 className="text-3xl font-bold mb-4">Đơn hàng COD của bạn đã được ghi nhận</h1>
                    <p className="text-gray-600 mb-6">
                        Mã đơn hàng: <span className="font-semibold text-stone-900">{successOrder._id}</span>
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="rounded-2xl bg-stone-50 p-4">
                            <p className="text-sm text-gray-500 mb-1">Người nhận</p>
                            <p className="font-semibold">{successOrder.shippingAddress?.fullName}</p>
                            <p className="text-sm text-gray-600">{successOrder.shippingAddress?.phone}</p>
                        </div>
                        <div className="rounded-2xl bg-stone-50 p-4">
                            <p className="text-sm text-gray-500 mb-1">Thanh toán</p>
                            <p className="font-semibold">COD - Thanh toán khi nhận hàng</p>
                            <p className="text-sm text-gray-600">Tổng tiền: {formatPrice(successOrder.totalAmount || grandTotal)}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to="/products" className="btn-primary text-center">Tiếp tục mua sắm</Link>
                        <Link to="/profile" className="btn-outline text-center">Xem tài khoản</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-10">
            <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-8 items-start">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-amber-100 text-stone-900">
                    <p className="text-sm uppercase tracking-[0.25em] text-amber-700 font-semibold mb-2">Thanh toán</p>
                    <h1 className="text-3xl font-bold mb-2">Xác nhận đơn hàng COD</h1>
                    <p className="text-gray-600 mb-6">
                        COD là phương thức bắt buộc của hệ thống hiện tại. Ví điện tử như MoMo, VNPay có thể bổ sung ở giai đoạn tiếp theo.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-stone-700">Họ và tên</span>
                            <input name="fullName" value={form.fullName} onChange={handleChange} required className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-stone-700">Số điện thoại</span>
                            <input name="phone" value={form.phone} onChange={handleChange} required className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
                        </label>
                        <label className="block md:col-span-2">
                            <span className="text-sm font-medium text-stone-700">Địa chỉ</span>
                            <input name="address" value={form.address} onChange={handleChange} required className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="Số nhà, đường, phường/xã" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-stone-700">Tỉnh/Thành phố</span>
                            <input name="city" value={form.city} onChange={handleChange} required className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-stone-700">Quận/Huyện</span>
                            <input name="district" value={form.district} onChange={handleChange} required className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
                        </label>
                        <label className="block md:col-span-2">
                            <span className="text-sm font-medium text-stone-700">Phường/Xã</span>
                            <input name="ward" value={form.ward} onChange={handleChange} required className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
                        </label>
                        <label className="block md:col-span-2">
                            <span className="text-sm font-medium text-stone-700">Ghi chú</span>
                            <textarea name="note" value={form.note} onChange={handleChange} rows={4} className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="Ví dụ: gọi trước khi giao hàng" />
                        </label>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-3 h-3 rounded-full bg-amber-600" />
                            <div>
                                <p className="font-semibold text-stone-800">Phương thức thanh toán</p>
                                <p className="text-sm text-stone-600">Chỉ hỗ trợ COD ở phiên bản này để đảm bảo quy trình đặt hàng rõ ràng và ổn định.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-6 w-full rounded-2xl px-5 py-4 font-semibold text-white disabled:opacity-70"
                        style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)' }}
                    >
                        {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng COD'}
                    </button>
                </form>

                <aside className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-amber-100 text-stone-900 sticky top-24">
                    <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
                    <div className="space-y-4 max-h-[420px] overflow-auto pr-1">
                        {checkoutItems.map((item) => (
                            <div key={item._id} className="flex gap-3">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border" />
                                <div className="flex-1">
                                    <p className="font-medium line-clamp-2">{item.name}</p>
                                    <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-amber-700 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-stone-200 mt-6 pt-4 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tạm tính</span>
                            <span>{formatPrice(checkoutTotalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Phí giao hàng</span>
                            <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2">
                            <span>Tổng cộng</span>
                            <span className="text-amber-700">{formatPrice(grandTotal)}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;
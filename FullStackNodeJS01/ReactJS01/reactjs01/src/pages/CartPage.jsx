import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/context/CartContext';
import { formatPrice } from '../utils/constants';

const CartPage = () => {
    const navigate = useNavigate();
    const { items, updateQuantity, removeFromCart, totalPrice, clearCart, totalItems, loadingCart } = useCart();
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        // default select all items when items change
        setSelectedIds(items.map((i) => i._id));
    }, [items]);

    const selectedItems = items.filter((i) => selectedIds.includes(i._id));
    const selectedTotalPrice = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const selectedTotalQty = selectedItems.reduce((sum, i) => sum + i.quantity, 0);

    if (loadingCart) {
        return (
            <div className="container-custom py-20 flex justify-center">
                <div className="rounded-full h-14 w-14 border-4 animate-spin" style={{ borderColor: '#b8874a', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container-custom py-16 text-center" style={{ background: 'linear-gradient(180deg,#fffdf8 0%, #fbf6ef 100%)', borderRadius: 8 }}>
                <p className="text-6xl mb-4">🛒</p>
                <h1 className="text-2xl font-bold text-black mb-2">Giỏ hàng trống</h1>
                <p className="text-black mb-6">Hãy thêm sản phẩm yêu thích vào giỏ hàng</p>
                <Link to="/products" className="inline-block px-6 py-3 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)', color: '#fff' }}>Mua sắm ngay</Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-8" style={{ background: 'linear-gradient(180deg,#fffdf8 0%, #fbf6ef 100%)', borderRadius: 8 }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-amber-700 font-semibold mb-2">Giỏ hàng của bạn</p>
                    <h1 className="section-title" style={{ color: '#1b0e07' }}>
                        Giỏ hàng ({totalItems} sản phẩm)
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/checkout', { state: { selectedIds } })}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)' }}
                >
                    Thanh toán COD
                </button>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3 p-2">
                        <input
                            type="checkbox"
                            checked={selectedIds.length === items.length && items.length > 0}
                            onChange={(e) => {
                                if (e.target.checked) setSelectedIds(items.map((i) => i._id));
                                else setSelectedIds([]);
                            }}
                        />
                        <span className="text-sm" style={{ color: '#000' }}>Chọn tất cả</span>
                    </div>
                    {items.map((item) => (
                        <div key={item._id} className="bg-white rounded-xl shadow-md p-4 flex gap-4 items-center">
                            <input
                                type="checkbox"
                                className="mr-3"
                                checked={selectedIds.includes(item._id)}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedIds((s) => [...s, item._id]);
                                    else setSelectedIds((s) => s.filter((id) => id !== item._id));
                                }}
                            />
                            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                            <div className="flex-1">
                                <Link to={`/product/${item.slug}`} className="font-semibold text-black hover:text-stone-700">
                                    {item.name}
                                </Link>
                                <p className="text-pink-500 font-bold mt-1">{formatPrice(item.price)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        className="w-8 h-8 rounded font-bold text-white transition"
                                        style={{ background: 'linear-gradient(135deg, #4a2c17, #1f120a)' }}
                                    >−</button>
                                    <span className="w-8 text-center text-black">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        className="w-8 h-8 rounded font-bold text-white transition"
                                        style={{ background: 'linear-gradient(135deg, #4a2c17, #1f120a)' }}
                                    >+</button>
                                    <button
                                        type="button"
                                        onClick={() => removeFromCart(item._id)}
                                        className="ml-auto text-red-500 text-sm hover:underline"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                            <p className="font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                    ))}
                </div>
                    <div className="bg-white rounded-xl shadow-md p-6 h-fit border border-amber-100">
                    <h2 className="font-bold text-lg mb-4 text-black">Tóm tắt đơn hàng</h2>
                    <div className="flex justify-between mb-2">
                        <span className="text-black">Tạm tính</span>
                        <span className="font-semibold">{formatPrice(selectedTotalPrice)}</span>
                    </div>
                        <div className="flex justify-between mb-2 text-sm text-gray-500">
                            <span>Thanh toán</span>
                            <span>COD</span>
                        </div>
                    <hr className="my-4" />
                    <div className="flex justify-between mb-6">
                        <span className="font-bold text-black">Tổng cộng</span>
                        <span className="text-xl font-bold text-amber-700">{formatPrice(selectedTotalPrice)}</span>
                    </div>
                        <button
                            type="button"
                            onClick={() => navigate('/checkout', { state: { selectedIds } })}
                            className="w-full mb-3"
                            style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)', color: '#fff', padding: '10px 12px', borderRadius: 8 }}
                            disabled={selectedItems.length === 0}
                        >
                            {selectedItems.length === 0 ? 'Chọn sản phẩm để thanh toán' : 'Tiếp tục thanh toán COD'}
                        </button>
                    <button type="button" onClick={clearCart} className="w-full text-red-500 text-sm hover:underline">
                        Xóa giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;

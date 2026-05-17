import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../components/context/CartContext';
import { formatPrice } from '../utils/constants';

const CartPage = () => {
    const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="container-custom py-16 text-center">
                <p className="text-6xl mb-4">🛒</p>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h1>
                <p className="text-gray-500 mb-6">Hãy thêm sản phẩm yêu thích vào giỏ hàng</p>
                <Link to="/products" className="btn-primary">Mua sắm ngay</Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <h1 className="section-title mb-6">Giỏ hàng ({items.length} sản phẩm)</h1>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item._id} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
                            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                            <div className="flex-1">
                                <Link to={`/product/${item.slug}`} className="font-semibold hover:text-pink-500">
                                    {item.name}
                                </Link>
                                <p className="text-pink-500 font-bold mt-1">{formatPrice(item.price)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        className="w-8 h-8 border rounded"
                                    >−</button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        className="w-8 h-8 border rounded"
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
                <div className="bg-white rounded-xl shadow-md p-6 h-fit">
                    <h2 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Tạm tính</span>
                        <span className="font-semibold">{formatPrice(totalPrice)}</span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between mb-6">
                        <span className="font-bold">Tổng cộng</span>
                        <span className="text-xl font-bold text-pink-500">{formatPrice(totalPrice)}</span>
                    </div>
                    <button type="button" className="btn-primary w-full mb-3">Thanh toán</button>
                    <button type="button" onClick={clearCart} className="w-full text-red-500 text-sm hover:underline">
                        Xóa giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;

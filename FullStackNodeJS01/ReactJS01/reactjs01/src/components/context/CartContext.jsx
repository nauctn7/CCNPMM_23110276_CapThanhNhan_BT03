import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

const cartStorageKey = (userId) => `cart_${userId || 'guest'}`;

export const CartProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (isAuthenticated && user?._id) {
            try {
                const saved = localStorage.getItem(cartStorageKey(user._id));
                setItems(saved ? JSON.parse(saved) : []);
            } catch {
                setItems([]);
            }
        } else {
            setItems([]);
            localStorage.removeItem('cart');
        }
    }, [isAuthenticated, user?._id]);

    useEffect(() => {
        if (isAuthenticated && user?._id) {
            localStorage.setItem(cartStorageKey(user._id), JSON.stringify(items));
        }
    }, [items, isAuthenticated, user?._id]);

    const addToCart = useCallback(
        (product, quantity = 1) => {
            if (!isAuthenticated) {
                return { success: false, needLogin: true };
            }
            if ((product.stock ?? 0) <= 0) {
                return { success: false, needLogin: false };
            }

            setItems((prev) => {
                const existing = prev.find((i) => i._id === product._id);
                if (existing) {
                    const newQty = Math.min(existing.quantity + quantity, product.stock);
                    return prev.map((i) =>
                        i._id === product._id ? { ...i, quantity: newQty } : i
                    );
                }
                return [
                    ...prev,
                    {
                        _id: product._id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: product.images?.[0],
                        stock: product.stock,
                        quantity: Math.min(quantity, product.stock),
                    },
                ];
            });
            return { success: true, needLogin: false };
        },
        [isAuthenticated]
    );

    const removeFromCart = (productId) => {
        setItems((prev) => prev.filter((i) => i._id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        setItems((prev) =>
            prev.map((i) => {
                if (i._id !== productId) return i;
                const qty = Math.max(1, Math.min(quantity, i.stock));
                return { ...i, quantity: qty };
            })
        );
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                canUseCart: isAuthenticated,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

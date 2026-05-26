import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const userId = user?.id || user?._id;
    const [items, setItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(false);

    const refreshCart = useCallback(async () => {
        // Don't attempt to refresh while auth is still initializing
        if (authLoading) return;

        if (!isAuthenticated || !userId) {
            setItems([]);
            setLoadingCart(false);
            return;
        }

        setLoadingCart(true);
        try {
            const response = await api.get('/api/cart');
            if (response.data.EC === 0) {
                setItems(response.data.cart?.items || []);
            } else {
                setItems([]);
            }
        } catch {
            setItems([]);
        } finally {
            setLoadingCart(false);
        }
    }, [authLoading, isAuthenticated, userId]);

    useEffect(() => {
        // Ensure cart is refreshed whenever auth state changes (login/logout)
        // Wait until auth initialization completes before attempting refresh
        if (authLoading) return;

        if (isAuthenticated && userId) {
            refreshCart();
        } else {
            // Clear cart for unauthenticated users
            setItems([]);
            setLoadingCart(false);
        }
    }, [authLoading, isAuthenticated, userId, refreshCart]);

    useEffect(() => {
        const onLogin = () => {
            void refreshCart();
        };
        const onLogout = () => {
            setItems([]);
        };
        try {
            window.addEventListener('app:login', onLogin);
            window.addEventListener('app:logout', onLogout);
        } catch (e) {
            // ignore in non-browser environments
        }
        return () => {
            try {
                window.removeEventListener('app:login', onLogin);
                window.removeEventListener('app:logout', onLogout);
            } catch (e) {}
        };
    }, [refreshCart]);

    const updateCartOnServer = useCallback(async (method, url, data) => {
        try {
            const response = await api[method](url, data);
            if (response.data?.EC === 0 && response.data?.cart) {
                setItems(response.data.cart.items || []);
            }
        } catch {
            refreshCart();
        }
    }, [refreshCart]);

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
            void updateCartOnServer('post', '/api/cart/items', { productId: product._id, quantity });
            return { success: true, needLogin: false };
        },
        [isAuthenticated, updateCartOnServer]
    );

    const removeFromCart = (productId) => {
        setItems((prev) => prev.filter((i) => i._id !== productId));
        void updateCartOnServer('delete', `/api/cart/items/${productId}`);
    };

    const updateQuantity = (productId, quantity) => {
        setItems((prev) =>
            prev.map((i) => {
                if (i._id !== productId) return i;
                const qty = Math.max(1, Math.min(quantity, i.stock));
                return { ...i, quantity: qty };
            })
        );
        void updateCartOnServer('patch', `/api/cart/items/${productId}`, { quantity });
    };

    const clearCart = () => {
        setItems([]);
        void updateCartOnServer('delete', '/api/cart');
    };

    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                refreshCart,
                loadingCart,
                totalItems,
                totalQuantity,
                totalPrice,
                canUseCart: isAuthenticated,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

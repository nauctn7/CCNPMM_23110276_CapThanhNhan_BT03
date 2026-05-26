const {
    getCartService,
    upsertCartItem,
    updateCartItemService,
    removeCartItemService,
    clearCartService,
    checkoutCodService,
} = require('../services/cartService');

const getCart = async (req, res) => {
    try {
        const result = await getCartService(req.user.userId);
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const addCartItem = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        if (!productId) {
            return res.status(400).json({ EC: 1, EM: 'Thiếu productId' });
        }

        const result = await upsertCartItem(req.user.userId, productId, quantity);
        return res.status(result.EC === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const result = await updateCartItemService(req.user.userId, productId, quantity);
        return res.status(result.EC === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await removeCartItemService(req.user.userId, productId);
        return res.status(result.EC === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const clearCart = async (req, res) => {
    try {
        const result = await clearCartService(req.user.userId);
        return res.status(result.EC === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const checkoutCod = async (req, res) => {
    try {
        const result = await checkoutCodService(req.user.userId, req.body, req.user.email);
        return res.status(result.EC === 0 ? 201 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

module.exports = {
    getCart,
    addCartItem,
    updateCartItem,
    deleteCartItem,
    clearCart,
    checkoutCod,
};
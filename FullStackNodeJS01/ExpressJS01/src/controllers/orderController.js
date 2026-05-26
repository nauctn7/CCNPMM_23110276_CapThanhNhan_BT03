const {
    getAdminOrdersService,
    getUserOrdersService,
    getOrderByIdService,
    requestCancelOrderService,
    reviewCancelRequestService,
    updateOrderStatusService,
} = require('../services/orderService');

const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '', search = '' } = req.query;
        const result = await getAdminOrdersService({ page, limit, status, search });
        return res.status(result.EC === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const result = await getUserOrdersService(req.user.userId);
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const getMyOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getOrderByIdService(req.user.userId, id);
        return res.status(result.EC === 0 ? 200 : 404).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const cancelMyOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const result = await requestCancelOrderService(req.user.userId, id, reason);
        return res.status(result.EC === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await updateOrderStatusService(id, status);
        return res.status(result.EC === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const reviewCancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, note } = req.body;
        const result = await reviewCancelRequestService(id, action, note);
        return res.status(result.EC === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

module.exports = {
    getAllOrders,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    reviewCancelRequest,
    updateOrderStatus,
};
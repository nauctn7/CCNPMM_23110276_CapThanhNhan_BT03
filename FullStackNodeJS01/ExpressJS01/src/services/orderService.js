const Order = require('../models/order');

const THIRTY_MINUTES = 30 * 60 * 1000;

const ORDER_STATUS_CONFIG = {
    new: { label: 'Đơn hàng mới', step: 1, color: 'blue' },
    confirmed: { label: 'Đã xác nhận đơn hàng', step: 2, color: 'gold' },
    preparing: { label: 'Shop đang chuẩn bị hàng', step: 3, color: 'orange' },
    shipping: { label: 'Đang giao hàng', step: 4, color: 'cyan' },
    delivered: { label: 'Đã giao thành công', step: 5, color: 'green' },
    cancelled: { label: 'Đã hủy đơn hàng', step: 6, color: 'red' },
};

const orderSteps = [
    { key: 'new', label: 'Đơn mới' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'preparing', label: 'Đang chuẩn bị' },
    { key: 'shipping', label: 'Đang giao hàng' },
    { key: 'delivered', label: 'Đã giao' },
];

const isOlderThanThirtyMinutes = (createdAt) => {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() >= THIRTY_MINUTES;
};

const getAutoConfirmTime = (createdAt) => new Date(new Date(createdAt).getTime() + THIRTY_MINUTES);

const mapOrder = (order) => {
    const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.new;
    const activeStepIndex = order.status === 'cancelled'
        ? orderSteps.length
        : Math.max(0, orderSteps.findIndex((step) => step.key === order.status));

    return {
        ...order,
        statusLabel: statusConfig.label,
        statusStep: statusConfig.step,
        statusColor: statusConfig.color,
        activeStepIndex,
        canCancelDirect: ['new', 'confirmed'].includes(order.status) && !isOlderThanThirtyMinutes(order.createdAt),
        canRequestCancel: order.status === 'preparing',
        autoConfirmAt: order.status === 'new' ? getAutoConfirmTime(order.createdAt) : null,
        steps: orderSteps,
    };
};

const syncAutoConfirmOrders = async () => {
    const now = new Date();
    const confirmThreshold = new Date(now.getTime() - THIRTY_MINUTES);

    await Order.updateMany(
        { status: 'new', createdAt: { $lte: confirmThreshold } },
        {
            $set: {
                status: 'confirmed',
                statusUpdatedAt: now,
                confirmedAt: now,
            },
        }
    );
};

const getUserOrdersService = async (userId) => {
    try {
        await syncAutoConfirmOrders();

        const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
        return {
            EC: 0,
            EM: 'Lấy lịch sử đơn hàng thành công',
            orders: orders.map(mapOrder),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể tải lịch sử đơn hàng' };
    }
};

const getOrderByIdService = async (userId, orderId) => {
    try {
        await syncAutoConfirmOrders();

        const order = await Order.findOne({ _id: orderId, userId }).lean();
        if (!order) {
            return { EC: 1, EM: 'Không tìm thấy đơn hàng' };
        }

        return {
            EC: 0,
            EM: 'Lấy chi tiết đơn hàng thành công',
            order: mapOrder(order),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể tải chi tiết đơn hàng' };
    }
};

const getAdminOrdersService = async ({ page = 1, limit = 10, status = '', search = '' } = {}) => {
    try {
        await syncAutoConfirmOrders();

        const currentPage = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
        const query = {};

        if (status && ORDER_STATUS_CONFIG[status]) {
            query.status = status;
        }

        if (search?.trim()) {
            const keyword = search.trim();
            query.$or = [
                { userName: { $regex: keyword, $options: 'i' } },
                { userEmail: { $regex: keyword, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: keyword, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: keyword, $options: 'i' } },
            ];
        }

        const [orders, totalOrders] = await Promise.all([
            Order.find(query).sort({ createdAt: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize).lean(),
            Order.countDocuments(query),
        ]);

        return {
            EC: 0,
            EM: 'Lấy danh sách đơn hàng thành công',
            orders: orders.map(mapOrder),
            totalOrders,
            totalPages: Math.max(1, Math.ceil(totalOrders / pageSize)),
            currentPage,
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể tải danh sách đơn hàng' };
    }
};

const requestCancelOrderService = async (userId, orderId, reason = '') => {
    try {
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return { EC: 1, EM: 'Không tìm thấy đơn hàng' };
        }

        if (order.status === 'cancelled' || order.status === 'delivered') {
            return { EC: 1, EM: 'Đơn hàng đã hoàn tất, không thể hủy' };
        }

        if (order.status === 'preparing') {
            order.cancelRequestStatus = 'requested';
            order.cancelRequestNote = reason?.trim() || 'Khách hàng yêu cầu hủy đơn';
            order.cancelRequestedAt = new Date();
            order.statusUpdatedAt = new Date();
            await order.save();

            return {
                EC: 0,
                EM: 'Đã gửi yêu cầu hủy đơn cho shop',
                order: mapOrder(order.toObject()),
            };
        }

        if (!['new', 'confirmed'].includes(order.status)) {
            return { EC: 1, EM: 'Đơn hàng đang ở trạng thái vận chuyển, không thể hủy trực tiếp' };
        }

        if (isOlderThanThirtyMinutes(order.createdAt)) {
            return { EC: 1, EM: 'Đơn hàng đã quá 30 phút, không thể hủy trực tiếp' };
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.statusUpdatedAt = new Date();
        order.cancelRequestStatus = 'none';
        order.cancelRequestNote = reason?.trim() || '';
        await order.save();

        return {
            EC: 0,
            EM: 'Đã hủy đơn hàng thành công',
            order: mapOrder(order.toObject()),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể hủy đơn hàng' };
    }
};

const reviewCancelRequestService = async (orderId, action, note = '') => {
    try {
        if (!['approved', 'rejected'].includes(action)) {
            return { EC: 1, EM: 'Hành động duyệt hủy không hợp lệ' };
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return { EC: 1, EM: 'Không tìm thấy đơn hàng' };
        }

        if (order.cancelRequestStatus !== 'requested') {
            return { EC: 1, EM: 'Đơn hàng này không có yêu cầu hủy đang chờ xử lý' };
        }

        const adminNote = note?.trim() || '';

        order.cancelReviewedAt = new Date();
        order.cancelReviewedNote = adminNote;
        order.cancelRequestStatus = action;

        if (action === 'approved') {
            order.status = 'cancelled';
            order.cancelledAt = new Date();
            order.statusUpdatedAt = new Date();
            if (!order.cancelRequestNote) {
                order.cancelRequestNote = 'Khách hàng yêu cầu hủy đơn';
            }
            if (!order.cancelReviewedNote) {
                order.cancelReviewedNote = 'Shop đã xác nhận hủy đơn';
            }
        } else {
            order.statusUpdatedAt = new Date();
            if (!order.cancelReviewedNote) {
                order.cancelReviewedNote = 'Shop từ chối yêu cầu hủy đơn';
            }
        }

        await order.save();

        return {
            EC: 0,
            EM: action === 'approved' ? 'Đã xác nhận hủy đơn' : 'Đã từ chối yêu cầu hủy đơn',
            order: mapOrder(order.toObject()),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể xử lý yêu cầu hủy đơn' };
    }
};

const updateOrderStatusService = async (orderId, status) => {
    try {
        if (!ORDER_STATUS_CONFIG[status]) {
            return { EC: 1, EM: 'Trạng thái đơn hàng không hợp lệ' };
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return { EC: 1, EM: 'Không tìm thấy đơn hàng' };
        }

        order.status = status;
        order.statusUpdatedAt = new Date();

        if (status === 'confirmed') order.confirmedAt = order.confirmedAt || new Date();
        if (status === 'preparing') order.preparingAt = new Date();
        if (status === 'shipping') order.shippingAt = new Date();
        if (status === 'delivered') order.deliveredAt = new Date();
        if (status === 'cancelled') order.cancelledAt = new Date();

        await order.save();

        return {
            EC: 0,
            EM: 'Cập nhật trạng thái thành công',
            order: mapOrder(order.toObject()),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể cập nhật trạng thái đơn hàng' };
    }
};

module.exports = {
    ORDER_STATUS_CONFIG,
    orderSteps,
    mapOrder,
    syncAutoConfirmOrders,
    getUserOrdersService,
    getOrderByIdService,
    getAdminOrdersService,
    requestCancelOrderService,
    reviewCancelRequestService,
    updateOrderStatusService,
};
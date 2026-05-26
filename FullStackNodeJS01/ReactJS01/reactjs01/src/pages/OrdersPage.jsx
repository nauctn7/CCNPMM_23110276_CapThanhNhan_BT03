import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input, Modal, Tag, Timeline, Typography } from 'antd';
import api from '../services/api';
import { formatPrice } from '../utils/constants';

const { Title, Text } = Typography;

const STATUS_LABELS = {
    new: 'Đơn hàng mới',
    confirmed: 'Đã xác nhận đơn hàng',
    preparing: 'Shop đang chuẩn bị hàng',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao thành công',
    cancelled: 'Đã hủy đơn hàng',
};

const STATUS_COLORS = {
    new: 'blue',
    confirmed: 'gold',
    preparing: 'orange',
    shipping: 'cyan',
    delivered: 'green',
    cancelled: 'red',
};

const STATUS_STEPS = [
    { key: 'new', title: 'Đơn mới' },
    { key: 'confirmed', title: 'Đã xác nhận' },
    { key: 'preparing', title: 'Chuẩn bị hàng' },
    { key: 'shipping', title: 'Đang giao hàng' },
    { key: 'delivered', title: 'Đã giao' },
];

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState(null);
    const [cancelingOrderId, setCancelingOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [message, setMessage] = useState('');

    const activeOrder = useMemo(
        () => orders.find((order) => order._id === activeOrderId) || orders[0] || null,
        [activeOrderId, orders]
    );

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/orders');
            if (response.data.EC === 0) {
                setOrders(response.data.orders || []);
                setActiveOrderId((currentId) => {
                    if (currentId && response.data.orders?.some((order) => order._id === currentId)) {
                        return currentId;
                    }
                    return response.data.orders?.[0]?._id || null;
                });
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error(error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const openCancelDialog = (order) => {
        setCancelingOrderId(order._id);
        setCancelReason('');
        setMessage('');
    };

    const handleCancelOrder = async () => {
        if (!cancelingOrderId) return;

        try {
            const response = await api.patch(`/api/orders/${cancelingOrderId}/cancel`, {
                reason: cancelReason,
            });

            if (response.data.EC === 0) {
                setMessage(response.data.EM || 'Đã cập nhật đơn hàng');
                setCancelingOrderId(null);
                await fetchOrders();
                return;
            }

            setMessage(response.data.EM || 'Không thể hủy đơn hàng');
        } catch (error) {
            setMessage(error.response?.data?.EM || 'Không thể hủy đơn hàng');
        }
    };

    const renderTimeline = (order) => {
        const currentStatus = order.status;
        const isCancelled = currentStatus === 'cancelled';
        const stepIndex = STATUS_STEPS.findIndex((step) => step.key === currentStatus);

        return (
            <Timeline
                mode="left"
                items={STATUS_STEPS.map((step, index) => ({
                    color: isCancelled && index > stepIndex ? 'gray' : index <= stepIndex ? 'green' : 'gray',
                    children: (
                        <div>
                            <p className="font-semibold text-stone-900">{step.title}</p>
                            {index === 0 && <Text type="secondary">Đơn vừa được ghi nhận</Text>}
                            {step.key === 'confirmed' && order.confirmedAt && (
                                <Text type="secondary">{new Date(order.confirmedAt).toLocaleString('vi-VN')}</Text>
                            )}
                            {step.key === 'preparing' && order.preparingAt && (
                                <Text type="secondary">{new Date(order.preparingAt).toLocaleString('vi-VN')}</Text>
                            )}
                            {step.key === 'shipping' && order.shippingAt && (
                                <Text type="secondary">{new Date(order.shippingAt).toLocaleString('vi-VN')}</Text>
                            )}
                            {step.key === 'delivered' && order.deliveredAt && (
                                <Text type="secondary">{new Date(order.deliveredAt).toLocaleString('vi-VN')}</Text>
                            )}
                        </div>
                    ),
                }))}
            />
        );
    };

    if (loading) {
        return (
            <div className="container-custom py-20 text-center">
                <div className="inline-block rounded-full h-14 w-14 border-4 animate-spin" style={{ borderColor: '#b8874a', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="container-custom py-16 text-center">
                <Title level={2} style={{ color: '#1b0e07' }}>Chưa có đơn hàng nào</Title>
                <Text type="secondary">Hãy mua sắm để bắt đầu theo dõi lịch sử đơn hàng của bạn.</Text>
                <div className="mt-6">
                    <Link to="/products" className="btn-primary">Đi mua sắm</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.2em] text-amber-700 font-semibold mb-2">Đơn hàng của tôi</p>
                <Title level={2} style={{ color: '#f7efe6', marginTop: 0 }}>Theo dõi lịch sử mua hàng</Title>
            </div>

            {message && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                    {message}
                </div>
            )}

            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
                <div className="space-y-4 max-h-[78vh] overflow-auto pr-1">
                    {orders.map((order) => (
                        <Card
                            key={order._id}
                            hoverable
                            onClick={() => setActiveOrderId(order._id)}
                            className={activeOrder?._id === order._id ? 'border-amber-500' : ''}
                            style={{ borderRadius: 20 }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-stone-900">Mã đơn: {order._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <Tag color={STATUS_COLORS[order.status] || 'default'}>{STATUS_LABELS[order.status] || order.status}</Tag>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Tổng tiền</p>
                                    <p className="text-lg font-bold text-amber-700">{formatPrice(order.totalAmount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Sản phẩm</p>
                                    <p className="font-semibold text-stone-900">{order.items?.length || 0} loại</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {activeOrder && (
                    <Card style={{ borderRadius: 24 }}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                            <div>
                                <Title level={3} style={{ marginTop: 0, color: '#1b0e07' }}>Chi tiết đơn hàng</Title>
                                <p className="text-gray-500">Mã đơn: {activeOrder._id}</p>
                            </div>
                            <Tag color={STATUS_COLORS[activeOrder.status] || 'default'} className="px-3 py-1 text-sm">
                                {activeOrder.statusLabel || STATUS_LABELS[activeOrder.status] || activeOrder.status}
                            </Tag>
                        </div>

                        <div className="mb-8 rounded-2xl bg-stone-50 p-4">
                            <p className="font-semibold text-stone-900 mb-3">Tiến trình đơn hàng</p>
                            {renderTimeline(activeOrder)}
                            {activeOrder.autoConfirmAt && (
                                <p className="mt-3 text-sm text-gray-500">
                                    Hệ thống sẽ tự động xác nhận sau: {new Date(activeOrder.autoConfirmAt).toLocaleString('vi-VN')}
                                </p>
                            )}
                            {activeOrder.cancelRequestStatus === 'requested' && (
                                <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                    Bạn đã gửi yêu cầu hủy đơn. Shop sẽ xem xét và phản hồi sớm.
                                </p>
                            )}
                            {activeOrder.cancelRequestStatus === 'rejected' && (
                                <p className="mt-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                    Yêu cầu hủy đã bị từ chối. Lý do từ shop: {activeOrder.cancelReviewedNote || 'Không có ghi chú'}
                                </p>
                            )}
                            {activeOrder.cancelRequestStatus === 'approved' && (
                                <p className="mt-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                    Đơn hàng đã được hủy. Ghi chú từ shop: {activeOrder.cancelReviewedNote || 'Đã xác nhận hủy đơn'}
                                </p>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="rounded-2xl border border-stone-200 p-4">
                                <p className="text-sm text-gray-500 mb-1">Người nhận</p>
                                <p className="font-semibold text-stone-900">{activeOrder.shippingAddress?.fullName}</p>
                                <p className="text-sm text-gray-600">{activeOrder.shippingAddress?.phone}</p>
                                <p className="text-sm text-gray-600 mt-2">{activeOrder.shippingAddress?.address}, {activeOrder.shippingAddress?.ward}, {activeOrder.shippingAddress?.district}, {activeOrder.shippingAddress?.city}</p>
                            </div>
                            <div className="rounded-2xl border border-stone-200 p-4">
                                <p className="text-sm text-gray-500 mb-1">Thanh toán</p>
                                <p className="font-semibold text-stone-900">COD</p>
                                <p className="text-sm text-gray-600">Tổng tiền: {formatPrice(activeOrder.totalAmount)}</p>
                                <p className="text-sm text-gray-600 mt-2">Ghi chú: {activeOrder.note || 'Không có'}</p>
                                {activeOrder.cancelRequestNote && (
                                    <p className="text-sm text-gray-600 mt-2">Lý do hủy: {activeOrder.cancelRequestNote}</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="font-semibold text-stone-900 mb-3">Sản phẩm trong đơn</p>
                            <div className="space-y-3">
                                {activeOrder.items?.map((item) => (
                                    <div key={item.productId || item.productName} className="flex items-center gap-4 rounded-2xl border border-stone-100 p-3">
                                        <img src={item.productImage || 'https://via.placeholder.com/80'} alt={item.productName} className="w-16 h-16 rounded-xl object-cover" />
                                        <div className="flex-1">
                                            <p className="font-medium text-stone-900">{item.productName}</p>
                                            <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-amber-700">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {(activeOrder.canCancelDirect || activeOrder.canRequestCancel) && activeOrder.status !== 'cancelled' && activeOrder.status !== 'delivered' && (
                                <Button danger size="large" onClick={() => openCancelDialog(activeOrder)}>
                                    {activeOrder.canRequestCancel ? 'Gửi yêu cầu hủy đơn' : 'Hủy đơn hàng'}
                                </Button>
                            )}
                            <Link
                                to="/products"
                                className="text-center inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-lg transition hover:brightness-110"
                                style={{ background: 'linear-gradient(135deg,#5a3418,#8f5d2f)' }}
                            >
                                Mua tiếp
                            </Link>
                        </div>
                    </Card>
                )}
            </div>

            <Modal
                open={!!cancelingOrderId}
                onCancel={() => setCancelingOrderId(null)}
                onOk={handleCancelOrder}
                okText="Xác nhận"
                cancelText="Đóng"
                title="Hủy / gửi yêu cầu hủy đơn"
            >
                <p className="mb-3 text-gray-600">
                    Nếu đơn đang ở bước chuẩn bị hàng, hệ thống sẽ chuyển thành yêu cầu hủy cho shop.
                </p>
                <Input.TextArea
                    rows={4}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy đơn (không bắt buộc)"
                />
            </Modal>
        </div>
    );
};

export default OrdersPage;
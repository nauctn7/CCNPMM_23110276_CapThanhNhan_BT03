import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Select, Spin, Tag, Timeline, Typography, message } from 'antd';
import api from '../services/api';
import { formatPrice } from '../utils/constants';

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'new', label: 'Đơn hàng mới' },
    { value: 'confirmed', label: 'Đã xác nhận đơn hàng' },
    { value: 'preparing', label: 'Shop đang chuẩn bị hàng' },
    { value: 'shipping', label: 'Đang giao hàng' },
    { value: 'delivered', label: 'Đã giao thành công' },
    { value: 'cancelled', label: 'Đã hủy đơn hàng' },
];

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

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeOrderId, setActiveOrderId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [cancelReviewNote, setCancelReviewNote] = useState('');
    const [reviewingCancel, setReviewingCancel] = useState(false);
    const [notice, setNotice] = useState('');

    const activeOrder = useMemo(
        () => orders.find((order) => order._id === activeOrderId) || orders[0] || null,
        [activeOrderId, orders]
    );

    const fetchOrders = async () => {
        setLoading(true);
        setNotice('');
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '10');
            if (statusFilter) params.set('status', statusFilter);
            if (searchQuery.trim()) params.set('search', searchQuery.trim());

            const response = await api.get(`/api/admin/orders?${params.toString()}`);
            if (response.data.EC === 0) {
                const nextOrders = response.data.orders || [];
                setOrders(nextOrders);
                setTotalPages(response.data.totalPages || 1);
                setActiveOrderId((currentId) => {
                    if (currentId && nextOrders.some((order) => order._id === currentId)) {
                        return currentId;
                    }
                    return nextOrders[0]?._id || null;
                });
                setSelectedStatus((currentStatus) => currentStatus || nextOrders[0]?.status || '');
            } else {
                setOrders([]);
                setTotalPages(1);
                setNotice(response.data.EM || 'Không thể tải danh sách đơn hàng');
            }
        } catch (error) {
            setOrders([]);
            setTotalPages(1);
            setNotice(error.response?.data?.EM || 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, searchQuery, statusFilter]);

    useEffect(() => {
        if (activeOrder) {
            setSelectedStatus(activeOrder.status);
            setCancelReviewNote(activeOrder.cancelReviewedNote || '');
        }
    }, [activeOrder]);

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setSearchQuery(searchInput);
    };

    const handleStatusUpdate = async () => {
        if (!activeOrder || !selectedStatus || selectedStatus === activeOrder.status) {
            return;
        }

        setUpdating(true);
        setNotice('');
        try {
            const response = await api.patch(`/api/admin/orders/${activeOrder._id}/status`, {
                status: selectedStatus,
            });

            if (response.data.EC === 0) {
                message.success(response.data.EM || 'Cập nhật trạng thái thành công');
                await fetchOrders();
                return;
            }

            setNotice(response.data.EM || 'Không thể cập nhật trạng thái đơn hàng');
        } catch (error) {
            setNotice(error.response?.data?.EM || 'Không thể cập nhật trạng thái đơn hàng');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelReview = async (action) => {
        if (!activeOrder || activeOrder.cancelRequestStatus !== 'requested') {
            return;
        }

        setReviewingCancel(true);
        setNotice('');
        try {
            const response = await api.patch(`/api/admin/orders/${activeOrder._id}/cancel-review`, {
                action,
                note: cancelReviewNote,
            });

            if (response.data.EC === 0) {
                message.success(response.data.EM || 'Đã xử lý yêu cầu hủy đơn');
                await fetchOrders();
                return;
            }

            setNotice(response.data.EM || 'Không thể xử lý yêu cầu hủy đơn');
        } catch (error) {
            setNotice(error.response?.data?.EM || 'Không thể xử lý yêu cầu hủy đơn');
        } finally {
            setReviewingCancel(false);
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
                            {step.key === 'new' && order.createdAt && (
                                <Text type="secondary">{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
                            )}
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

    const quickStatusChoices = STATUS_OPTIONS.filter((option) => option.value && option.value !== activeOrder?.status);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#fdf8f1 0%, #f8eee2 100%)' }}>
            <div className="container-custom py-10">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-amber-700 font-semibold mb-2">Quản trị đơn hàng</p>
                        <Title level={2} style={{ color: '#1b0e07', marginTop: 0, marginBottom: 0 }}>Quản lý đơn hàng</Title>
                        <p className="text-stone-600 mt-2">Theo dõi trạng thái, kiểm tra thông tin giao hàng và cập nhật tiến trình xử lý.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4 text-black">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr_auto] gap-3">
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm theo tên khách, email, số điện thoại..."
                            className="py-2.5"
                        />
                        <Select
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setPage(1);
                            }}
                            options={STATUS_OPTIONS}
                        />
                        <Button htmlType="submit" type="primary" style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)' }}>
                            Tìm kiếm
                        </Button>
                    </form>
                </div>

                {notice && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">{notice}</div>}

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Spin size="large" />
                    </div>
                ) : !orders.length ? (
                    <Empty
                        description="Không có đơn hàng nào phù hợp"
                        className="bg-white rounded-2xl border border-stone-200 py-16"
                    />
                ) : (
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
                                        <div className="flex flex-col items-end gap-2">
                                            <Tag color={STATUS_COLORS[order.status] || 'default'}>{STATUS_LABELS[order.status] || order.status}</Tag>
                                            {order.cancelRequestStatus === 'requested' && (
                                                <Tag color="orange">Chờ duyệt hủy</Tag>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Khách hàng</p>
                                            <p className="font-semibold text-stone-900">{order.shippingAddress?.fullName || order.userName || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Tổng tiền</p>
                                            <p className="text-lg font-bold text-amber-700">{formatPrice(order.totalAmount)}</p>
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
                                        {STATUS_LABELS[activeOrder.status] || activeOrder.status}
                                    </Tag>
                                </div>

                                <div className="mb-8 rounded-2xl bg-stone-50 p-4">
                                    <p className="font-semibold text-stone-900 mb-3">Tiến trình đơn hàng</p>
                                    {renderTimeline(activeOrder)}
                                </div>

                                {activeOrder.cancelRequestStatus === 'requested' && (
                                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 mb-6">
                                        <p className="font-semibold text-stone-900 mb-2">Yêu cầu hủy từ khách hàng</p>
                                        <p className="text-sm text-stone-700 mb-3">
                                            Lý do khách hàng: {activeOrder.cancelRequestNote || 'Không có lý do cụ thể'}
                                        </p>
                                        <Input.TextArea
                                            rows={3}
                                            value={cancelReviewNote}
                                            onChange={(e) => setCancelReviewNote(e.target.value)}
                                            placeholder="Nhập lý do phản hồi cho khách hàng khi từ chối, hoặc ghi chú khi duyệt"
                                        />
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button danger onClick={() => handleCancelReview('rejected')} loading={reviewingCancel}>
                                                Từ chối hủy
                                            </Button>
                                            <Button type="primary" onClick={() => handleCancelReview('approved')} loading={reviewingCancel} style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)' }}>
                                                Xác nhận hủy
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeOrder.cancelRequestStatus !== 'none' && activeOrder.cancelReviewedAt && (
                                    <div className="rounded-2xl border border-stone-200 bg-white p-4 mb-6">
                                        <p className="font-semibold text-stone-900 mb-1">Phản hồi của shop</p>
                                        <p className="text-sm text-stone-700">
                                            {activeOrder.cancelRequestStatus === 'approved'
                                                ? 'Yêu cầu hủy đã được chấp nhận.'
                                                : 'Yêu cầu hủy đã bị từ chối.'}
                                        </p>
                                        <p className="text-sm text-stone-600 mt-2">
                                            Lý do: {activeOrder.cancelReviewedNote || 'Không có ghi chú'}
                                        </p>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="rounded-2xl border border-stone-200 p-4">
                                        <p className="text-sm text-gray-500 mb-1">Người nhận</p>
                                        <p className="font-semibold text-stone-900">{activeOrder.shippingAddress?.fullName}</p>
                                        <p className="text-sm text-gray-600">{activeOrder.shippingAddress?.phone}</p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {activeOrder.shippingAddress?.address}, {activeOrder.shippingAddress?.ward}, {activeOrder.shippingAddress?.district}, {activeOrder.shippingAddress?.city}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-stone-200 p-4">
                                        <p className="text-sm text-gray-500 mb-1">Thanh toán</p>
                                        <p className="font-semibold text-stone-900">COD</p>
                                        <p className="text-sm text-gray-600">Tổng tiền: {formatPrice(activeOrder.totalAmount)}</p>
                                        <p className="text-sm text-gray-600 mt-2">Ghi chú: {activeOrder.note || 'Không có'}</p>
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

                                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 mb-6">
                                    <p className="font-semibold text-stone-900 mb-3">Cập nhật trạng thái</p>
                                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                                        <Select
                                            value={selectedStatus || activeOrder.status}
                                            onChange={setSelectedStatus}
                                            options={STATUS_OPTIONS.filter((option) => option.value)}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={handleStatusUpdate}
                                            loading={updating}
                                            disabled={!selectedStatus || selectedStatus === activeOrder.status}
                                            style={{ background: 'linear-gradient(135deg,#8f5d2f,#b8874a)' }}
                                        >
                                            Lưu trạng thái
                                        </Button>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {quickStatusChoices.map((item) => (
                                            <Button key={item.value} size="small" onClick={() => setSelectedStatus(item.value)}>
                                                Chọn {item.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                <div className="px-1 mt-6 flex items-center justify-between">
                    <span className="text-sm text-black font-medium">Trang {page} / {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 rounded border text-black disabled:opacity-40 bg-white"
                        >
                            Trước
                        </button>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 rounded border text-black disabled:opacity-40 bg-white"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;

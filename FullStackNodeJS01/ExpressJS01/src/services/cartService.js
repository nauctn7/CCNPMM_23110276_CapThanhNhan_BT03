const Cart = require('../models/cart');
const Order = require('../models/order');
const Product = require('../models/product');

const normalizeCartItem = (item) => ({
    _id: item.productId?._id || item.productId,
    slug: item.productSlug || item.productId?.slug,
    name: item.productName || item.productId?.name,
    image: item.productImage || item.productId?.images?.[0] || '',
    price: item.price ?? item.productId?.price ?? 0,
    stock: item.stock ?? item.productId?.stock ?? 0,
    quantity: item.quantity,
});

const summarizeCart = (items = []) => {
    const normalizedItems = items.map(normalizeCartItem);
    const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { items: normalizedItems, totalItems, totalPrice };
};

const buildCartResponse = (cart) => {
    if (!cart) {
        return { items: [], totalItems: 0, totalPrice: 0 };
    }

    return summarizeCart(cart.items || []);
};

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }
    return cart;
};

const getCartService = async (userId) => {
    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId', 'name slug price stock images');
        return {
            EC: 0,
            EM: 'Lấy giỏ hàng thành công',
            cart: buildCartResponse(cart),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể tải giỏ hàng' };
    }
};

const upsertCartItem = async (userId, productId, quantity) => {
    try {
        const cart = await getOrCreateCart(userId);
        const product = await Product.findById(productId);

        if (!product) {
            return { EC: 1, EM: 'Không tìm thấy sản phẩm' };
        }

        if ((product.stock ?? 0) <= 0) {
            return { EC: 1, EM: 'Sản phẩm hiện đã hết hàng' };
        }

        const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
        const existingIndex = cart.items.findIndex((item) => item.productId.toString() === productId.toString());

        const snapshotItem = {
            productId: product._id,
            productName: product.name,
            productSlug: product.slug,
            productImage: product.images?.[0] || '',
            price: product.price,
            stock: product.stock,
            quantity: safeQuantity,
        };

        if (existingIndex >= 0) {
            const currentItem = cart.items[existingIndex].toObject ? cart.items[existingIndex].toObject() : cart.items[existingIndex];
            cart.items[existingIndex] = {
                ...currentItem,
                ...snapshotItem,
                quantity: Math.min(currentItem.quantity + safeQuantity, product.stock),
            };
        } else {
            cart.items.push(snapshotItem);
        }

        await cart.save();
        const populatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name slug price stock images');

        return {
            EC: 0,
            EM: 'Cập nhật giỏ hàng thành công',
            cart: buildCartResponse(populatedCart),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể cập nhật giỏ hàng' };
    }
};

const updateCartItemService = async (userId, productId, quantity) => {
    try {
        const cart = await getOrCreateCart(userId);
        const product = await Product.findById(productId);

        if (!product) {
            return { EC: 1, EM: 'Không tìm thấy sản phẩm' };
        }

        const index = cart.items.findIndex((item) => item.productId.toString() === productId.toString());
        if (index < 0) {
            return { EC: 1, EM: 'Sản phẩm không có trong giỏ hàng' };
        }

        const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
        const currentItem = cart.items[index].toObject ? cart.items[index].toObject() : cart.items[index];

        cart.items[index] = {
            ...currentItem,
            productId: product._id,
            productName: product.name,
            productSlug: product.slug,
            productImage: product.images?.[0] || '',
            price: product.price,
            stock: product.stock,
            quantity: safeQuantity,
        };

        await cart.save();
        const populatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name slug price stock images');

        return {
            EC: 0,
            EM: 'Cập nhật số lượng thành công',
            cart: buildCartResponse(populatedCart),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể cập nhật số lượng giỏ hàng' };
    }
};

const removeCartItemService = async (userId, productId) => {
    try {
        const cart = await getOrCreateCart(userId);
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId.toString());
        await cart.save();

        const populatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name slug price stock images');
        return {
            EC: 0,
            EM: 'Đã xóa sản phẩm khỏi giỏ hàng',
            cart: buildCartResponse(populatedCart),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể xóa sản phẩm khỏi giỏ hàng' };
    }
};

const clearCartService = async (userId) => {
    try {
        const cart = await getOrCreateCart(userId);
        cart.items = [];
        await cart.save();

        return {
            EC: 0,
            EM: 'Đã xóa giỏ hàng',
            cart: { items: [], totalItems: 0, totalPrice: 0 },
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể xóa giỏ hàng' };
    }
};

const normalizePhoneNumber = (value) => String(value || '').replace(/\s|-/g, '').trim();

const isValidVietnamesePhoneNumber = (value) => {
    const digits = normalizePhoneNumber(value).replace(/\D/g, '');
    return (digits.length === 10 && digits.startsWith('0')) || (digits.length === 11 && digits.startsWith('84'));
};

const checkoutCodService = async (userId, payload = {}, userEmail = '') => {
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'district', 'ward'];
    const missingField = requiredFields.find((field) => !String(payload[field] || '').trim());
    if (missingField) {
        return { EC: 1, EM: 'Vui lòng điền đầy đủ thông tin giao hàng' };
    }

    if (!isValidVietnamesePhoneNumber(payload.phone)) {
        return { EC: 1, EM: 'Số điện thoại không hợp lệ. Vui lòng nhập số Việt Nam hợp lệ, ví dụ 09xxxxxxxx hoặc +849xxxxxxxx.' };
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name slug price stock images');
    if (!cart || !cart.items.length) {
        return { EC: 1, EM: 'Giỏ hàng trống, không thể thanh toán' };
    }

    // Support checking out only a subset of cart items (selectedItemIds)
    const selectedItemIds = Array.isArray(payload.selectedItemIds) ? payload.selectedItemIds.map(String) : null;
    const itemsToProcess = selectedItemIds
        ? cart.items.filter((item) => selectedItemIds.includes((item.productId?._id || item.productId).toString()))
        : cart.items;

    if (!itemsToProcess.length) {
        return { EC: 1, EM: 'Không có sản phẩm hợp lệ để thanh toán' };
    }

    const productIds = itemsToProcess.map((item) => item.productId?._id || item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    for (const item of itemsToProcess) {
        const productId = (item.productId?._id || item.productId).toString();
        const product = productMap.get(productId);
        if (!product) {
            return { EC: 1, EM: `Sản phẩm ${item.productName} không còn tồn tại` };
        }
        if (product.stock < item.quantity) {
            return { EC: 1, EM: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm trong kho` };
        }
    }

    try {
        let createdOrder = null;

        const orderItems = itemsToProcess.map((item) => {
            const product = productMap.get((item.productId?._id || item.productId).toString());
            return {
                productId: product._id,
                productName: product.name,
                productImage: product.images?.[0] || '',
                price: product.price,
                quantity: item.quantity,
            };
        });

        const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Update stock first; the pre-check above already guards against insufficient inventory.
        await Product.bulkWrite(
            itemsToProcess.map((item) => {
                const product = productMap.get((item.productId?._id || item.productId).toString());
                return {
                    updateOne: {
                        filter: { _id: product._id, stock: { $gte: item.quantity } },
                        update: {
                            $inc: { stock: -item.quantity, sold: item.quantity },
                            $set: { updatedAt: new Date() },
                        },
                    },
                };
            })
        );

        createdOrder = await Order.create({
            userId,
            userEmail: userEmail || payload.email?.trim() || '',
            userName: payload.fullName.trim(),
            items: orderItems,
            totalAmount,
            shippingAddress: {
                fullName: payload.fullName.trim(),
                phone: payload.phone.trim(),
                address: payload.address.trim(),
                city: payload.city.trim(),
                district: payload.district.trim(),
                ward: payload.ward.trim(),
            },
            paymentMethod: 'cod',
            status: 'new',
            statusUpdatedAt: new Date(),
            note: payload.note?.trim() || '',
        });

        // Remove purchased items from cart after the order is created successfully.
        const remainingItems = cart.items.filter(
            (item) => !itemsToProcess.some((it) => (it.productId?._id || it.productId).toString() === (item.productId?._id || item.productId).toString())
        );
        await Cart.updateOne({ userId }, { $set: { items: remainingItems } });

        return {
            EC: 0,
            EM: 'Đặt hàng thành công bằng COD',
            order: createdOrder || null,
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể hoàn tất thanh toán COD' };
    }
};

module.exports = {
    getCartService,
    upsertCartItem,
    updateCartItemService,
    removeCartItemService,
    clearCartService,
    checkoutCodService,
};
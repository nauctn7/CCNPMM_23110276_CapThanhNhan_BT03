const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: String,
    productImage: String,
    price: Number,
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: String,
    userName: String,
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        district: String,
        ward: String
    },
    paymentMethod: {
        type: String,
        enum: ['cod'],
        default: 'cod'
    },
    status: {
        type: String,
        enum: ['new', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'],
        default: 'new'
    },
    cancelRequestStatus: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected'],
        default: 'none'
    },
    cancelRequestNote: String,
    cancelRequestedAt: {
        type: Date,
        default: null
    },
    cancelReviewedAt: {
        type: Date,
        default: null
    },
    cancelReviewedNote: String,
    statusUpdatedAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: {
        type: Date,
        default: null
    },
    preparingAt: {
        type: Date,
        default: null
    },
    shippingAt: {
        type: Date,
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    note: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
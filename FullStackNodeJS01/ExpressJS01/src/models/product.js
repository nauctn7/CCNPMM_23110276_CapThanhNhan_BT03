const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Nhan', 'Vong tay', 'Day chuyen', 'Bong tai', 'Mat day', 'Trang suc cuoi']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        maxLength: 200
    },
    images: [{
        type: String,
        required: true
    }],
    material: {
        type: String,
        enum: ['Vang 18K', 'Vang 14K', 'Vang 10K', 'Bac', 'Platinum', 'Kim cuong', 'Da quy'],
        default: 'Vang 18K'
    },
    weight: {
        type: Number,
        min: 0
    },
    gemstone: {
        type: String,
        default: null
    },
    isNew: {
        type: Boolean,
        default: false
    },
    isHot: {
        type: Boolean,
        default: false
    },
    isSale: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Tạo slug từ name
productSchema.pre('save', function() {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Product', productSchema);
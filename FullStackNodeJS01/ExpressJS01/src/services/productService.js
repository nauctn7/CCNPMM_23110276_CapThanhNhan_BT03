const Product = require('../models/product');

const slugify = (value = '') =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// Lấy tất cả sản phẩm với phân trang và lọc
const getProductsService = async (filters = {}, page = 1, limit = 12) => {
    try {
        const query = {};
        
        // Lọc theo danh mục
        if (filters.category && filters.category !== 'all') {
            query.category = filters.category;
        }
        
        // Lọc theo giá
        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) query.price.$gte = parseInt(filters.minPrice);
            if (filters.maxPrice) query.price.$lte = parseInt(filters.maxPrice);
        }
        
        // Lọc theo chất liệu
        if (filters.material && filters.material !== 'all') {
            query.material = filters.material;
        }
        
        // Lọc sản phẩm mới
        if (filters.isNew === 'true') {
            query.isNew = true;
        }
        
        // Lọc sản phẩm bán chạy
        if (filters.isHot === 'true') {
            query.isHot = true;
        }
        
        // Lọc sản phẩm giảm giá
        if (filters.isSale === 'true') {
            query.isSale = true;
        }

        // Chỉ sản phẩm còn hàng
        if (filters.inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        // Lọc theo đá quý
        if (filters.gemstone && filters.gemstone !== 'all') {
            query.gemstone = { $regex: filters.gemstone, $options: 'i' };
        }

        // Lọc theo đánh giá tối thiểu
        if (filters.minRating) {
            query.rating = { $gte: parseFloat(filters.minRating) };
        }
        
        // Tìm kiếm theo tên, mô tả, đá quý
        if (filters.search) {
            const regex = { $regex: filters.search, $options: 'i' };
            query.$or = [
                { name: regex },
                { shortDescription: regex },
                { description: regex },
                { gemstone: regex },
                { material: regex },
            ];
        }
        
        // Sắp xếp
        let sort = {};
        switch (filters.sort) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'bestseller':
                sort = { sold: -1 };
                break;
            case 'rating':
                sort = { rating: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }
        
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            Product.find(query).sort(sort).skip(skip).limit(limit),
            Product.countDocuments(query)
        ]);
        
        return {
            EC: 0,
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: "Lỗi lấy sản phẩm" };
    }
};

// Lấy sản phẩm theo slug (chi tiết)
const getProductBySlugService = async (slug) => {
    try {
        const normalizedSlug = slugify(slug);
        let product = await Product.findOne({ slug: normalizedSlug });

        if (!product) {
            const products = await Product.find().select('_id name slug');
            const matchedProduct = products.find((item) => slugify(item.slug || item.name) === normalizedSlug) || null;

            if (matchedProduct) {
                product = await Product.findById(matchedProduct._id);
            }
        }

        if (!product) {
            return { EC: 1, EM: "Không tìm thấy sản phẩm" };
        }
        
        // Tăng lượt xem
        product.views += 1;
        await product.save();
        
        // Lấy sản phẩm tương tự (cùng danh mục)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(6);
        
        return {
            EC: 0,
            product,
            relatedProducts
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: "Lỗi lấy chi tiết sản phẩm" };
    }
};

// Lấy sản phẩm nổi bật (trang chủ)
const getFeaturedProductsService = async () => {
    try {
        const [newProducts, hotProducts, saleProducts] = await Promise.all([
            Product.find({ isNew: true }).limit(8),
            Product.find({ isHot: true }).limit(8),
            Product.find({ isSale: true, discount: { $gt: 0 } }).limit(8)
        ]);
        
        return {
            EC: 0,
            newProducts,
            hotProducts,
            saleProducts
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: "Lỗi lấy sản phẩm nổi bật" };
    }
};

// Lấy danh sách danh mục
const getCategoriesService = async () => {
    try {
        const categories = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);
        
        return { EC: 0, categories };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: "Lỗi lấy danh mục" };
    }
};

module.exports = {
    getProductsService,
    getProductBySlugService,
    getFeaturedProductsService,
    getCategoriesService
};
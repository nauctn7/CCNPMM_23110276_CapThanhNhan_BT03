const Product = require('../models/product');

const slugify = (value = '') =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const normalizeImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images
        .map((url) => (typeof url === 'string' ? url.trim() : ''))
        .filter(Boolean);
};

const normalizeProductPayload = (payload = {}) => {
    const data = {};

    const stringFields = ['name', 'category', 'description', 'shortDescription', 'material', 'gemstone'];
    stringFields.forEach((field) => {
        if (payload[field] !== undefined) {
            data[field] = payload[field] === null ? null : String(payload[field]).trim();
        }
    });

    const numberFields = ['price', 'originalPrice', 'discount', 'stock', 'sold', 'weight', 'rating', 'totalReviews'];
    numberFields.forEach((field) => {
        if (payload[field] !== undefined && payload[field] !== '') {
            const parsed = Number(payload[field]);
            if (!Number.isNaN(parsed)) {
                data[field] = parsed;
            }
        }
    });

    const booleanFields = ['isNew', 'isHot', 'isSale'];
    booleanFields.forEach((field) => {
        if (payload[field] !== undefined) {
            data[field] = payload[field] === true || payload[field] === 'true';
        }
    });

    if (payload.images !== undefined) {
        data.images = normalizeImages(payload.images);
    }

    return data;
};

// Lấy tất cả sản phẩm với phân trang và lọc
const getProductsService = async (filters = {}, page = 1, limit = 12) => {
    try {
        const query = {};

        if (filters.category && filters.category !== 'all') {
            query.category = filters.category;
        }

        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) query.price.$gte = parseInt(filters.minPrice, 10);
            if (filters.maxPrice) query.price.$lte = parseInt(filters.maxPrice, 10);
        }

        if (filters.material && filters.material !== 'all') {
            query.material = filters.material;
        }

        if (filters.isNew === 'true') {
            query.isNew = true;
        }

        if (filters.isHot === 'true') {
            query.isHot = true;
        }

        if (filters.isSale === 'true') {
            query.isSale = true;
        }

        if (filters.inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        if (filters.gemstone && filters.gemstone !== 'all') {
            query.gemstone = { $regex: filters.gemstone, $options: 'i' };
        }

        if (filters.minRating) {
            query.rating = { $gte: parseFloat(filters.minRating) };
        }

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
            Product.countDocuments(query),
        ]);

        return {
            EC: 0,
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi lấy sản phẩm' };
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
            return { EC: 1, EM: 'Không tìm thấy sản phẩm' };
        }

        product.views += 1;
        await product.save();

        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
        }).limit(6);

        return {
            EC: 0,
            product,
            relatedProducts,
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi lấy chi tiết sản phẩm' };
    }
};

// Lấy sản phẩm nổi bật (trang chủ)
const getFeaturedProductsService = async () => {
    try {
        const [newProducts, hotProducts, saleProducts] = await Promise.all([
            Product.find({ isNew: true }).limit(8),
            Product.find({ isHot: true }).limit(8),
            Product.find({ isSale: true, discount: { $gt: 0 } }).limit(8),
        ]);

        return {
            EC: 0,
            newProducts,
            hotProducts,
            saleProducts,
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi lấy sản phẩm nổi bật' };
    }
};

// Lấy danh sách danh mục
const getCategoriesService = async () => {
    try {
        const categories = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    name: '$_id',
                    count: 1,
                    _id: 0,
                },
            },
        ]);

        return { EC: 0, categories };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi lấy danh mục' };
    }
};

// Lấy top 10 sản phẩm bán chạy nhất
const getTopBestSellerProductsService = async (limit = 10) => {
    try {
        const products = await Product.find().sort({ sold: -1 }).limit(limit).lean();

        return {
            EC: 0,
            products,
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi lấy sản phẩm bán chạy nhất' };
    }
};

// Lấy top 10 sản phẩm xem nhiều nhất
const getTopMostViewedProductsService = async (limit = 10) => {
    try {
        const products = await Product.find().sort({ views: -1 }).limit(limit).lean();

        return {
            EC: 0,
            products,
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi lấy sản phẩm xem nhiều nhất' };
    }
};

// Lấy sản phẩm theo danh mục với lazy loading (phân trang)
const getProductsByCategoryService = async (category, page = 1, limit = 12) => {
    try {
        if (!category) {
            return { EC: 1, EM: 'Danh mục không hợp lệ' };
        }

        const query = { category };
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        return {
            EC: 0,
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi lấy sản phẩm theo danh mục' };
    }
};

const getAdminProductsService = async (query = {}, page = 1, limit = 10) => {
    try {
        const mongoQuery = {};

        if (query.search) {
            const regex = { $regex: query.search, $options: 'i' };
            mongoQuery.$or = [{ name: regex }, { slug: regex }, { category: regex }];
        }

        if (query.category) {
            mongoQuery.category = query.category;
        }

        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find(mongoQuery).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
            Product.countDocuments(mongoQuery),
        ]);

        return {
            EC: 0,
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi lấy danh sách sản phẩm admin' };
    }
};

const createProductService = async (payload = {}) => {
    try {
        const data = normalizeProductPayload(payload);

        if (!data.name || !data.category || data.price === undefined || data.stock === undefined || !data.description) {
            return { EC: 1, EM: 'Thiếu thông tin bắt buộc (name, category, price, stock, description)' };
        }

        if (!data.images || data.images.length === 0) {
            return { EC: 1, EM: 'Vui lòng cung cấp ít nhất 1 ảnh sản phẩm' };
        }

        const baseSlug = slugify(data.name);
        let slug = baseSlug;
        let counter = 1;
        while (await Product.exists({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter += 1;
        }

        const product = new Product({ ...data, slug });
        await product.save();

        return { EC: 0, EM: 'Tạo sản phẩm thành công', product };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi tạo sản phẩm' };
    }
};

const updateProductService = async (id, payload = {}) => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            return { EC: 1, EM: 'Không tìm thấy sản phẩm' };
        }

        const data = normalizeProductPayload(payload);
        Object.entries(data).forEach(([key, value]) => {
            product[key] = value;
        });

        if (!product.images || product.images.length === 0) {
            return { EC: 1, EM: 'Sản phẩm phải có ít nhất 1 ảnh' };
        }

        if (!product.name || !product.category || product.price === undefined || product.stock === undefined || !product.description) {
            return { EC: 1, EM: 'Thiếu thông tin bắt buộc của sản phẩm' };
        }

        await product.save();
        return { EC: 0, EM: 'Cập nhật sản phẩm thành công', product };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi cập nhật sản phẩm' };
    }
};

const deleteProductService = async (id) => {
    try {
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            return { EC: 1, EM: 'Không tìm thấy sản phẩm để xóa' };
        }

        return { EC: 0, EM: 'Xóa sản phẩm thành công' };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Lỗi xóa sản phẩm' };
    }
};

module.exports = {
    getProductsService,
    getProductBySlugService,
    getFeaturedProductsService,
    getCategoriesService,
    getTopBestSellerProductsService,
    getTopMostViewedProductsService,
    getProductsByCategoryService,
    getAdminProductsService,
    createProductService,
    updateProductService,
    deleteProductService,
};

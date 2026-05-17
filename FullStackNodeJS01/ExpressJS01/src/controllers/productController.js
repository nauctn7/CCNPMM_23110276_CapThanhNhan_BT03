const {
    getProductsService,
    getProductBySlugService,
    getFeaturedProductsService,
    getCategoriesService
} = require('../services/productService');

// Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            material,
            gemstone,
            minRating,
            isNew,
            isHot,
            isSale,
            inStock,
            search,
            sort,
            page = 1,
            limit = 12
        } = req.query;
        
        const filters = {
            category,
            minPrice,
            maxPrice,
            material,
            gemstone,
            minRating,
            isNew,
            isHot,
            isSale,
            inStock,
            search,
            sort
        };
        
        const result = await getProductsService(filters, parseInt(page), parseInt(limit));
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ EC: 1, EM: "Lỗi server" });
    }
};

// Lấy chi tiết sản phẩm
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await getProductBySlugService(slug);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ EC: 1, EM: "Lỗi server" });
    }
};

// Lấy sản phẩm nổi bật
const getFeaturedProducts = async (req, res) => {
    try {
        const result = await getFeaturedProductsService();
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ EC: 1, EM: "Lỗi server" });
    }
};

// Lấy danh sách danh mục
const getCategories = async (req, res) => {
    try {
        const result = await getCategoriesService();
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ EC: 1, EM: "Lỗi server" });
    }
};

module.exports = {
    getProducts,
    getProductBySlug,
    getFeaturedProducts,
    getCategories
};
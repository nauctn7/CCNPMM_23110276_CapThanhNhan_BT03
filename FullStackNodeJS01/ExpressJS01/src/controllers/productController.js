const {
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
    deleteProductService
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

// Lấy top 10 sản phẩm bán chạy nhất
const getTopBestSellerProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const result = await getTopBestSellerProductsService(parseInt(limit));
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ EC: 1, EM: "Lỗi server" });
    }
};

// Lấy top 10 sản phẩm xem nhiều nhất
const getTopMostViewedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const result = await getTopMostViewedProductsService(parseInt(limit));
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ EC: 1, EM: "Lỗi server" });
    }
};

// Lấy sản phẩm theo danh mục với lazy loading
const getProductsByCategory = async (req, res) => {
    try {
        const { category, page = 1, limit = 12 } = req.query;
        const result = await getProductsByCategoryService(category, parseInt(page), parseInt(limit));
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ EC: 1, EM: "Lỗi server" });
    }
};

const getAdminProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', category = '' } = req.query;
        const result = await getAdminProductsService(
            { search, category },
            parseInt(page, 10),
            parseInt(limit, 10)
        );
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const createProduct = async (req, res) => {
    try {
        const result = await createProductService(req.body);
        if (result.EC !== 0) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await updateProductService(id, req.body);
        if (result.EC !== 0) {
            return res.status(400).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteProductService(id);
        if (result.EC !== 0) {
            return res.status(404).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server' });
    }
};

module.exports = {
    getProducts,
    getProductBySlug,
    getFeaturedProducts,
    getCategories,
    getTopBestSellerProducts,
    getTopMostViewedProducts,
    getProductsByCategory,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
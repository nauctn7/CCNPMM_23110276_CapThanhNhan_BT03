const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            EC: 1,
            EM: 'Bạn không có quyền truy cập chức năng quản trị'
        });
    }

    return next();
};

module.exports = adminOnly;

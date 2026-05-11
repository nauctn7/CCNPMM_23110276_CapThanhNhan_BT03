const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Log để debug
    console.log('Path:', req.path);
    console.log('Original URL:', req.originalUrl);
    console.log('Method:', req.method);
    
    // Danh sách các route công khai (không cần token)
    const publicRoutes = ['/register', '/login'];
    
    // Kiểm tra nếu là route công khai
    let isPublicRoute = false;
    for (const route of publicRoutes) {
        if (req.path === route || req.originalUrl === `/api${route}`) {
            isPublicRoute = true;
            break;
        }
    }
    
    if (isPublicRoute) {
        console.log('Public route, skipping auth');
        return next();
    }
    
    // Lấy token từ header
    const token = req.header('x-auth-token') || req.header('Authorization');
    
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({
            EC: 1,
            EM: "Không có token, truy cập bị từ chối"
        });
    }

    try {
        // Xóa 'Bearer ' nếu có
        const cleanToken = token.replace('Bearer ', '');
        
        // Verify token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        req.user = decoded;
        
        console.log('Auth successful for user:', decoded.email);
        next();
    } catch (error) {
        console.log('Auth error:', error.message);
        return res.status(403).json({
            EC: 1,
            EM: "Token không hợp lệ hoặc đã hết hạn"
        });
    }
};

module.exports = auth;
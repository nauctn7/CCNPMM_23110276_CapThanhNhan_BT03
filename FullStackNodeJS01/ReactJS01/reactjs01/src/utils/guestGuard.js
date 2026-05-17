/** Chuyển guest tới trang đăng nhập, lưu trang quay lại sau khi đăng nhập */
export const redirectToLogin = (navigate, fromPath, message) => {
    navigate('/login', {
        state: {
            from: fromPath,
            message: message || 'Vui lòng đăng nhập để tiếp tục mua sắm.',
        },
    });
};

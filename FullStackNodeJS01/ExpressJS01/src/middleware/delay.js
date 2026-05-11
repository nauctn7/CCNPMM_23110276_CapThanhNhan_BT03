// Middleware tạo độ trễ (giả lập network delay)
const delay = (req, res, next) => {
    const delayTime = 1000; // 1 giây
    setTimeout(() => {
        next();
    }, delayTime);
};

module.exports = delay;
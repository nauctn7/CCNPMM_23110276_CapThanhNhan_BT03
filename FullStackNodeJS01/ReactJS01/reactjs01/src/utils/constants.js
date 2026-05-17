export const CATEGORIES = [
    { value: 'Nhan', label: 'Nhẫn' },
    { value: 'Vong tay', label: 'Vòng tay' },
    { value: 'Day chuyen', label: 'Dây chuyền' },
    { value: 'Bong tai', label: 'Bông tai' },
    { value: 'Mat day', label: 'Mặt dây' },
    { value: 'Trang suc cuoi', label: 'Trang sức cưới' },
];

export const MATERIALS = [
    { value: 'Vang 18K', label: 'Vàng 18K' },
    { value: 'Vang 14K', label: 'Vàng 14K' },
    { value: 'Vang 10K', label: 'Vàng 10K' },
    { value: 'Bac', label: 'Bạc' },
    { value: 'Platinum', label: 'Platinum' },
    { value: 'Kim cuong', label: 'Kim cương' },
    { value: 'Da quy', label: 'Đá quý' },
];

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'bestseller', label: 'Bán chạy nhất' },
    { value: 'price_asc', label: 'Giá thấp → cao' },
    { value: 'price_desc', label: 'Giá cao → thấp' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
];

export const GEMSTONE_OPTIONS = [
    { value: '', label: 'Tất cả đá quý' },
    { value: 'Kim cương', label: 'Kim cương' },
    { value: 'Ngọc trai', label: 'Ngọc trai' },
    { value: 'Ruby', label: 'Ruby' },
    { value: 'Sapphire', label: 'Sapphire' },
    { value: 'Ngọc bích', label: 'Ngọc bích' },
    { value: 'Emerald', label: 'Emerald' },
    { value: 'Topaz', label: 'Topaz' },
];

export const RATING_OPTIONS = [
    { value: '', label: 'Tất cả đánh giá' },
    { value: '4', label: '4 sao trở lên' },
    { value: '4.5', label: '4.5 sao trở lên' },
    { value: '5', label: '5 sao' },
];

export const getCategoryLabel = (value) =>
    CATEGORIES.find((c) => c.value === value)?.label || value;

export const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

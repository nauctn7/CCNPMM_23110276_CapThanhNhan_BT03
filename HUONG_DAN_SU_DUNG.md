# 📚 Hướng Dẫn Sử Dụng Các Tính Năng Mới

## 🎯 Tính Năng 1: Hiển Thị Sản Phẩm Theo Danh Mục Với Lazy Loading

### 📋 Mô Tả
Người dùng có thể xem tất cả sản phẩm theo danh mục với hai chế độ hiển thị:
- **Phân trang (Pagination)**: Hiển thị 12 sản phẩm trên một trang, có nút điều hướng trang
- **Tải tiếp (Lazy Loading)**: Hiển thị sản phẩm liên tục, tự động tải thêm khi kéo xuống cuối trang

### 🚀 Cách Sử Dụng

1. **Truy cập trang sản phẩm**
   - Nhấn vào "Sản phẩm" trong menu chính hoặc link "Khám phá ngay"
   - URL: `/products`

2. **Chọn danh mục**
   - Nhấn vào các nút danh mục ngang trên đầu trang:
     - Tất cả
     - Nhẫn
     - Vòng tay
     - Dây chuyền
     - Bông tai
     - Mặt dây
     - Trang sức cưới

3. **Chọn chế độ hiển thị**
   - **📄 Phân trang**: Hiển thị mặc định, dùng nút "Trước" "Sau" để chuyển trang
   - **∞ Tải tiếp**: Nhấn nút "∞ Tải tiếp" để chuyển sang chế độ vô hạn scroll

4. **Sử dụng Lazy Loading**
   - Kéo xuống cuối trang để tự động tải 12 sản phẩm tiếp theo
   - Khi hết sản phẩm sẽ hiển thị "Đã tải hết tất cả sản phẩm"
   - Các bộ lọc và tìm kiếm vẫn hoạt động bình thường

### 🔧 Thay Đổi Backend

**File: `src/services/productService.js`**
- Thêm hàm `getProductsByCategoryService()`: Lấy sản phẩm theo danh mục với phân trang

**File: `src/controllers/productController.js`**
- Thêm controller `getProductsByCategory()`: Xử lý API request

**File: `src/routes/api.js`**
- Thêm route: `GET /api/products/category?category=<name>&page=<num>&limit=12`

### 🎨 Thay Đổi Frontend

**File: `src/pages/ProductsPage.jsx`**
- Thêm state: `lazyLoadMode`, `currentPage`, `loadingMore`
- Thêm hook: `useRef` cho IntersectionObserver
- Thêm nút toggle: "📄 Phân trang" | "∞ Tải tiếp"
- Triển khai Intersection Observer API để detect khi kéo xuống cuối trang
- Tự động load 12 sản phẩm tiếp theo khi đạt đến observer target

---

## 🎁 Tính Năng 2: Top 10 Sản Phẩm Bán Chạy & Xem Nhiều Nhất

### 📋 Mô Tả
Hiển thị top 10 sản phẩm bán chạy nhất và sản phẩm xem nhiều nhất trên trang chủ với:
- Giao diện carousel ngang có nút cuộn trái/phải
- Hiển thị 4 sản phẩm tùy theo kích thước màn hình
- Tự động check xem có thể cuộn hay không

### 🚀 Cách Sử Dụng

1. **Xem Top Sản Phẩm Trên Trang Chủ**
   - Truy cập trang chủ (Home)
   - Cuộn xuống để xem các phần:
     - 🔥 **Sản phẩm bán chạy nhất**: Top 10 sản phẩm có số lượng bán cao nhất
     - 👀 **Sản phẩm xem nhiều nhất**: Top 10 sản phẩm có lượt xem cao nhất

2. **Sử Dụng Carousel**
   - Nhấn ◀ (Cuộn trái) để xem sản phẩm trước đó
   - Nhấn ▶ (Cuộn phải) để xem sản phẩm tiếp theo
   - Nút tự động vô hiệu hóa khi không thể cuộn thêm
   - Trên mobile: Có thể swipe để cuộn (phụ thuộc browser)

3. **Xem Chi Tiết Sản Phẩm**
   - Nhấn vào bất kỳ sản phẩm nào để xem chi tiết
   - Xem các sản phẩm tương tự cùng danh mục

### 🔧 Thay Đổi Backend

**File: `src/services/productService.js`**
- Thêm hàm `getTopBestSellerProductsService(limit = 10)`: 
  - Lấy top 10 sản phẩm theo trường `sold` (giảm dần)
  - Sắp xếp: `{ sold: -1 }`

- Thêm hàm `getTopMostViewedProductsService(limit = 10)`:
  - Lấy top 10 sản phẩm theo trường `views` (giảm dần)
  - Sắp xếp: `{ views: -1 }`

**File: `src/controllers/productController.js`**
- Thêm controller `getTopBestSellerProducts()`: Xử lý API request
- Thêm controller `getTopMostViewedProducts()`: Xử lý API request

**File: `src/routes/api.js`**
- Thêm route: `GET /api/products/top/bestsellers?limit=10`
- Thêm route: `GET /api/products/top/mostviewed?limit=10`

### 🎨 Thay Đổi Frontend

**File: `src/components/products/ProductCarousel.jsx` (New)**
- Component carousel với chức năng:
  - Cuộn ngang với animation smooth
  - Nút cuộn trái/phải được bật/tắt tùy theo vị trí scroll
  - Hiển thị số sản phẩm hiện tại
  - Loading state
  - Responsive: 4 cột trên desktop, 2 cột tablet, 1 cột mobile

- Props:
  ```javascript
  {
    products: [],          // Array sản phẩm
    title: 'Sản phẩm',    // Tiêu đề section
    icon: '📦',           // Icon emoji
    loading: false,       // State đang tải
    itemsPerPage: 4,      // Số item hiển thị (info only)
    showSold: false       // Hiển thị số lượng bán (cho ProductCard)
  }
  ```

**File: `src/pages/HomePage.jsx`**
- Import `ProductCarousel` component
- Thêm state: `topBestSellers`, `topMostViewed`, `topProductsLoading`
- Thêm useEffect để fetch top products từ API:
  ```javascript
  GET /api/products/top/bestsellers?limit=10
  GET /api/products/top/mostviewed?limit=10
  ```
- Render hai section carousel:
  - Section 1: 🔥 Sản phẩm bán chạy nhất (showSold={true})
  - Section 2: 👀 Sản phẩm xem nhiều nhất (showSold={false})
- Các section được hiển thị ở vị trí chiến lược:
  - Top Bestsellers: Sau section khuyến mãi
  - Top Most Viewed: Sau section top bestsellers
  - Trước section sản phẩm mới nhất

---

## 📊 API Endpoints

### Endpoint 1: Lấy Top Bán Chạy
```
GET /api/products/top/bestsellers?limit=10
```
**Response:**
```json
{
  "EC": 0,
  "products": [
    {
      "_id": "...",
      "name": "Nhẫn Vàng 18K",
      "sold": 125,
      "views": 450,
      ...
    }
  ]
}
```

### Endpoint 2: Lấy Top Xem Nhiều
```
GET /api/products/top/mostviewed?limit=10
```
**Response:**
```json
{
  "EC": 0,
  "products": [
    {
      "_id": "...",
      "name": "Dây Chuyền Bạc",
      "views": 580,
      "sold": 45,
      ...
    }
  ]
}
```

### Endpoint 3: Lấy Sản Phẩm Theo Danh Mục
```
GET /api/products/category?category=Nhan&page=1&limit=12
```
**Response:**
```json
{
  "EC": 0,
  "products": [...],
  "total": 45,
  "page": 1,
  "totalPages": 4,
  "hasNextPage": true
}
```

---

## 🎨 UI/UX Features

### 1. Display Mode Toggle
- Nút toggle cho phép người dùng chuyển giữa hai chế độ
- Nút được highlight khi active
- Position: Trên cùng phần sản phẩm, dưới thanh lọc

### 2. Lazy Load Indicator
- Loading spinner hiện khi đang tải thêm sản phẩm
- Thông báo "Đã tải hết tất cả sản phẩm" khi không còn page nào
- Observer target giúp trigger load tự động

### 3. Carousel Navigation
- Nút ◀ ▶ được disabled khi không thể scroll thêm
- Smooth scroll animation
- Nút có hover effect

---

## 🔍 Dữ Liệu Model

### Product Schema (Updated)
```javascript
{
  name: String,
  slug: String,
  category: String,
  price: Number,
  originalPrice: Number,
  discount: Number (0-100),
  stock: Number,
  sold: Number,          // ← Dùng để sắp xếp bestseller
  views: Number,         // ← Dùng để sắp xếp most viewed
  description: String,
  shortDescription: String,
  images: [String],
  material: String,
  weight: Number,
  gemstone: String,
  isNew: Boolean,
  isHot: Boolean,
  isSale: Boolean,
  rating: Number,
  totalReviews: Number,
  createdAt: Date
}
```

---

## 💡 Tips & Best Practices

### 1. Performance
- Lazy loading giúp giảm tải lúc khởi tạo trang
- API sử dụng `.lean()` để trả về plain objects (nhanh hơn)
- Intersection Observer tránh được việc scroll event listener quá nhiều

### 2. User Experience
- Cung cấp toggle giữa hai chế độ để người dùng chọn theo sở thích
- Carousel responsive trên tất cả devices
- Loading states rõ ràng, không confusing

### 3. SEO & Analytics
- Mỗi lần scroll load, tăng số lượng sản phẩm hiển thị (good for engagement)
- Top products sections giúp highlight best sellers (conversion boost)

---

## 🐛 Troubleshooting

### Lazy Loading Không Hoạt Động
- ✅ Kiểm tra xem có sản phẩm nào không? (total > 0)
- ✅ Kiểm tra browser có support Intersection Observer không?
- ✅ Kiểm tra console có error không?

### Carousel Không Scroll
- ✅ Kiểm tra xem có đủ sản phẩm để scroll không (tối thiểu 5 item)
- ✅ Kiểm tra width container có đủ lớn không
- ✅ Kiểm tra overflow-x: auto CSS

### Top Products Không Hiển Thị
- ✅ Kiểm tra database có sản phẩm nào có `sold > 0` hoặc `views > 0` không?
- ✅ Kiểm tra API endpoint `GET /api/products/top/bestsellers` trả về dữ liệu không?
- ✅ Kiểm tra HomePage fetch data không (Network tab)?

---

## 📱 Responsive Design

### Desktop (1024px+)
- Carousel hiển thị 4 sản phẩm
- Nút cuộn bên phải tiêu đề
- Full featured UI

### Tablet (768px - 1023px)
- Carousel hiển thị 2 sản phẩm
- Nút cuộn bên phải
- Simplified UI

### Mobile (< 768px)
- Carousel hiển thị 1 sản phẩm
- Nút cuộn bên phải
- Touch-friendly scroll

---

## 📦 Tóm Tắt Thay Đổi

| Phần | File | Thay Đổi |
|------|------|----------|
| Backend | productService.js | +3 hàm |
| Backend | productController.js | +3 controller |
| Backend | api.js | +3 route |
| Frontend | ProductsPage.jsx | Thêm lazy loading |
| Frontend | ProductCarousel.jsx | File mới |
| Frontend | HomePage.jsx | Thêm 2 section |

Total: **6 files changed/created**

---

## 🎓 Học Hỏi Thêm

### Technologies Used
- **Backend**: Express.js, MongoDB, Mongoose
- **Frontend**: React 19, React Router v7, Tailwind CSS
- **API Pattern**: REST
- **Lazy Loading**: Intersection Observer API
- **State Management**: React Hooks (useState, useEffect, useCallback, useRef)

### Concepts Implemented
1. Infinite Scroll (Lazy Loading)
2. REST API Pagination
3. React Hooks Advanced Patterns
4. Intersection Observer API
5. Responsive Design
6. Component Composition


# 🔧 Tài Liệu Kỹ Thuật - Chi Tiết Triển Khai

## 📑 Nội Dung
1. [Cấu Trúc Code](#cấu-trúc-code)
2. [Chi Tiết Backend](#chi-tiết-backend)
3. [Chi Tiết Frontend](#chi-tiết-frontend)
4. [Flow & Data](#flow--data)
5. [Performance Optimization](#performance-optimization)

---

## 🏗️ Cấu Trúc Code

### Backend Structure
```
ExpressJS01/
├── src/
│   ├── services/
│   │   └── productService.js          [+3 functions]
│   ├── controllers/
│   │   └── productController.js       [+3 exports]
│   ├── routes/
│   │   └── api.js                     [+3 routes]
│   └── models/
│       └── product.js                 [unchanged]
```

### Frontend Structure
```
ReactJS01/
├── src/
│   ├── pages/
│   │   ├── ProductsPage.jsx           [Enhanced]
│   │   └── HomePage.jsx               [Enhanced]
│   └── components/
│       └── products/
│           ├── ProductCard.jsx        [unchanged]
│           ├── ProductFilter.jsx      [unchanged]
│           └── ProductCarousel.jsx    [NEW]
```

---

## 🔙 Chi Tiết Backend

### 1. Service Layer - productService.js

#### Function: `getTopBestSellerProductsService(limit = 10)`
```javascript
const getTopBestSellerProductsService = async (limit = 10) => {
    try {
        const products = await Product.find()
            .sort({ sold: -1 })          // Sort by sold count (descending)
            .limit(limit)
            .lean();                       // Returns plain objects
        
        return {
            EC: 0,
            products
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: "Lỗi lấy sản phẩm bán chạy nhất" };
    }
};
```

**Key Points:**
- `.lean()`: Trả về plain JS objects thay vì Mongoose documents
- `.sort({ sold: -1 })`: Sắp xếp giảm dần theo trường sold
- `limit(limit)`: Giới hạn số lượng kết quả

#### Function: `getTopMostViewedProductsService(limit = 10)`
```javascript
const getTopMostViewedProductsService = async (limit = 10) => {
    try {
        const products = await Product.find()
            .sort({ views: -1 })         // Sort by views (descending)
            .limit(limit)
            .lean();
        
        return {
            EC: 0,
            products
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: "Lỗi lấy sản phẩm xem nhiều nhất" };
    }
};
```

**Key Points:**
- Tương tự như bestseller, nhưng sort theo `views`
- Performance: O(n*log(n)) với MongoDB index

#### Function: `getProductsByCategoryService(category, page = 1, limit = 12)`
```javascript
const getProductsByCategoryService = async (category, page = 1, limit = 12) => {
    try {
        if (!category) {
            return { EC: 1, EM: "Danh mục không hợp lệ" };
        }

        const query = { category };
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query)
        ]);

        return {
            EC: 0,
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit)
        };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: "Lỗi lấy sản phẩm theo danh mục" };
    }
};
```

**Key Points:**
- `skip = (page - 1) * limit`: Tính offset cho pagination
- `Promise.all()`: Parallel query execution (more efficient)
- Return `hasNextPage`: Frontend dùng để detect end of list

### 2. Controller Layer - productController.js

#### Function: `getTopBestSellerProducts(req, res)`
```javascript
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
```

**Request/Response:**
```
GET /api/products/top/bestsellers?limit=10

200 OK:
{
  "EC": 0,
  "products": [
    { _id, name, price, sold, views, ... }
  ]
}

500 Error:
{
  "EC": 1,
  "EM": "Lỗi server"
}
```

#### Function: `getTopMostViewedProducts(req, res)`
```javascript
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
```

#### Function: `getProductsByCategory(req, res)`
```javascript
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
```

### 3. Routes - api.js

```javascript
// Top Products Routes
routerAPI.get("/products/top/bestsellers", getTopBestSellerProducts);
routerAPI.get("/products/top/mostviewed", getTopMostViewedProducts);
routerAPI.get("/products/category", getProductsByCategory);
```

**Important:** Route order matters in Express!
- Specific routes TRƯỚC general routes
- `/products/top/bestsellers` TRƯỚC `/products/:slug`
- Otherwise `:slug` sẽ catch "top"

---

## 🎨 Chi Tiết Frontend

### 1. ProductCarousel Component

#### Props Interface
```javascript
interface ProductCarouselProps {
  products: Product[];        // Array sản phẩm
  title?: string;             // Tiêu đề section
  icon?: string;              // Icon emoji
  loading?: boolean;          // Loading state
  itemsPerPage?: number;      // Info only
  showSold?: boolean;         // Pass to ProductCard
}
```

#### State Management
```javascript
const [scrollPosition, setScrollPosition] = useState(0);    // Current scroll left
const [canScrollLeft, setCanScrollLeft] = useState(false);  // Can scroll left?
const [canScrollRight, setCanScrollRight] = useState(true); // Can scroll right?
const scrollContainerRef = useRef(null);                    // DOM ref
```

#### Key Functions

**`checkScroll()`** - Update scroll state
```javascript
const checkScroll = () => {
    if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setScrollPosition(scrollLeft);
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
};
```

**`scroll(direction)`** - Smooth scroll
```javascript
const scroll = (direction) => {
    if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.clientWidth;
        const newPosition = scrollPosition + (direction === 'left' ? -scrollAmount : scrollAmount);
        
        scrollContainerRef.current.scrollTo({
            left: newPosition,
            behavior: 'smooth'
        });
    }
};
```

#### Responsive Grid
```jsx
<div key={product._id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4">
  <ProductCard product={product} showSold={showSold} />
</div>
```

Tailwind classes:
- `w-full`: Mobile (100%)
- `sm:w-1/2`: Tablet (50%)
- `lg:w-1/4`: Desktop (25%)

### 2. Enhanced ProductsPage Component

#### New State & Refs
```javascript
const [lazyLoadMode, setLazyLoadMode] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [loadingMore, setLoadingMore] = useState(false);
const observerTarget = useRef(null);
```

#### Display Mode Toggle
```jsx
<div className="mb-4 flex gap-2 items-center">
  <span className="text-sm text-gray-600">Chế độ hiển thị:</span>
  <button
    onClick={() => setLazyLoadMode(false)}
    className={!lazyLoadMode ? 'bg-pink-500 text-white' : '...'}
  >
    📄 Phân trang
  </button>
  <button
    onClick={() => setLazyLoadMode(true)}
    className={lazyLoadMode ? 'bg-pink-500 text-white' : '...'}
  >
    ∞ Tải tiếp
  </button>
</div>
```

#### Lazy Load Logic with useCallback
```javascript
const fetchLazyLoadProducts = useCallback(async (pageNum = 1, append = false) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params.set(key, val);
        });
        params.set('page', pageNum);
        params.set('limit', '12');

        if (pageNum > 1) setLoadingMore(true);
        else setLoading(true);

        const res = await api.get(`/api/products?${params.toString()}`);
        if (res.data.EC === 0) {
            if (append) {
                // Append để infinite scroll
                setProducts((prev) => [...prev, ...(res.data.products || [])]);
            } else {
                // Replace để reset
                setProducts(res.data.products || []);
            }
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
            setCurrentPage(pageNum);
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (pageNum > 1) setLoadingMore(false);
        else setLoading(false);
    }
}, [filters]);
```

**Key Points:**
- `useCallback`: Memoized function để avoid re-creation
- `append` parameter: Append vs replace products
- Separate loading states for initial load vs loading more

#### Intersection Observer Setup
```javascript
useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            if (
                entries[0].isIntersecting &&        // Element visible
                lazyLoadMode &&                      // In lazy mode
                !loadingMore &&                      // Not already loading
                currentPage < totalPages             // More pages available
            ) {
                fetchLazyLoadProducts(currentPage + 1, true);  // Load next page
            }
        },
        { threshold: 0.1 }  // 10% visible triggers
    );

    if (observerTarget.current) {
        observer.observe(observerTarget.current);
    }

    return () => {
        if (observerTarget.current) {
            observer.unobserve(observerTarget.current);
        }
    };
}, [lazyLoadMode, currentPage, totalPages, loadingMore, fetchLazyLoadProducts]);
```

**Intersection Observer Trigger Conditions:**
1. `entries[0].isIntersecting`: Element in viewport
2. `lazyLoadMode`: User in lazy load mode
3. `!loadingMore`: Not already fetching
4. `currentPage < totalPages`: More pages to load

### 3. Enhanced HomePage

#### New State
```javascript
const [topBestSellers, setTopBestSellers] = useState([]);
const [topMostViewed, setTopMostViewed] = useState([]);
const [topProductsLoading, setTopProductsLoading] = useState(true);
```

#### Fetch Top Products
```javascript
useEffect(() => {
    const fetchTopProducts = async () => {
        try {
            const [bestSellersRes, mostViewedRes] = await Promise.all([
                api.get('/api/products/top/bestsellers?limit=10'),
                api.get('/api/products/top/mostviewed?limit=10')
            ]);
            
            if (bestSellersRes.data.EC === 0) {
                setTopBestSellers(bestSellersRes.data.products || []);
            }
            if (mostViewedRes.data.EC === 0) {
                setTopMostViewed(mostViewedRes.data.products || []);
            }
        } catch (error) {
            console.error('Error fetching top products:', error);
        } finally {
            setTopProductsLoading(false);
        }
    };
    fetchTopProducts();
}, []);
```

**Performance:** Parallel requests with `Promise.all()`

#### Render Carousels
```jsx
{/* Top Best Sellers Section */}
<ProductCarousel
    products={topBestSellers}
    title="Sản phẩm bán chạy nhất"
    icon="🔥"
    loading={topProductsLoading}
    showSold={true}
/>

{/* Top Most Viewed Section */}
<ProductCarousel
    products={topMostViewed}
    title="Sản phẩm xem nhiều nhất"
    icon="👀"
    loading={topProductsLoading}
/>
```

---

## 📊 Flow & Data

### User Flow: Lazy Loading

```
ProductsPage (lazyLoadMode=false)
    ↓
    Render display mode toggle (📄 Phân trang | ∞ Tải tiếp)
    ↓
User clicks "∞ Tải tiếp"
    ↓
setLazyLoadMode(true)
    ↓
useEffect triggers → fetchLazyLoadProducts(1, false)
    ↓
API: GET /api/products?...&page=1&limit=12
    ↓
Backend: getProductsService() returns page 1
    ↓
Frontend: setProducts(data) + setCurrentPage(1)
    ↓
Render 12 products + observer target
    ↓
User scrolls down
    ↓
IntersectionObserver detects observer target
    ↓
Trigger: fetchLazyLoadProducts(2, true) [append mode]
    ↓
API: GET /api/products?...&page=2&limit=12
    ↓
Frontend: setProducts(prev => [...prev, ...new products])
    ↓
Now showing 24 products
    ↓
Repeat until currentPage >= totalPages
    ↓
Show "Đã tải hết tất cả sản phẩm"
```

### User Flow: Top Products

```
HomePage loads
    ↓
useEffect triggers fetchTopProducts()
    ↓
Parallel API calls:
  - GET /api/products/top/bestsellers?limit=10
  - GET /api/products/top/mostviewed?limit=10
    ↓
Backend:
  - getTopBestSellerProductsService(): sort by sold DESC
  - getTopMostViewedProductsService(): sort by views DESC
    ↓
Frontend receives top 10 for each
    ↓
Render ProductCarousel for bestsellers
Render ProductCarousel for most viewed
    ↓
User sees carousel with scroll buttons
    ↓
Click "▶" button
    ↓
scroll("right") triggered
    ↓
scrollContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
    ↓
Smooth scroll animation (browser handles)
    ↓
After scroll, checkScroll() updates button states
```

---

## ⚡ Performance Optimization

### 1. Database Level
```javascript
// Use lean() for read-only queries
.lean()  // No Mongoose document overhead

// Use index on frequently sorted fields
// Run in MongoDB:
// db.products.createIndex({ sold: -1 })
// db.products.createIndex({ views: -1 })
// db.products.createIndex({ category: 1 })

// Parallel queries with Promise.all()
await Promise.all([
    Product.find(...),
    Product.countDocuments(...)
])
```

### 2. API Level
```javascript
// Limit default results
limit: 10  // For top products (small set)
limit: 12  // For pagination (standard)

// Return only needed fields (optional optimization)
.select('_id name price images category sold views')

// Pagination reduces payload size
page=1&limit=12 // ~100KB vs all products ~10MB
```

### 3. Frontend Level
```javascript
// 1. Use useCallback to prevent unnecessary re-renders
const fetchLazyLoadProducts = useCallback(async (...) => {...}, [filters])

// 2. Use useRef for DOM access (no re-render)
const scrollContainerRef = useRef(null)

// 3. Lazy load: Load on demand vs load all at once
// Infinite scroll: Only 12 items in DOM at a time initially
// vs pagination: Only current page 12 items in DOM

// 4. Intersection Observer: More efficient than scroll event listener
// Fires only when element enters/exits viewport
// Much less frequent than scroll event (fires on every pixel)

// 5. CSS Optimization
overflow-x: auto;  // Browser-optimized scrolling
scroll-behavior: smooth;  // GPU-accelerated
```

### Benchmark Estimates:
- **Lazy Loading**: Reduce initial page load by 80%
- **Intersection Observer**: 90% fewer listener calls vs scroll
- **Promise.all()**: 50% faster compared to sequential queries
- **Total FCP (First Contentful Paint)**: ~1.5s → ~0.8s

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] GET /api/products/top/bestsellers returns top 10 by sold
- [ ] GET /api/products/top/mostviewed returns top 10 by views
- [ ] GET /api/products/category?category=Nhan returns paginated results
- [ ] Pagination works: page=1,2,3...
- [ ] Limit parameter works
- [ ] Empty category returns error
- [ ] Verify query speed < 100ms

### Frontend Testing
- [ ] ProductCarousel loads and displays
- [ ] Scroll buttons enable/disable correctly
- [ ] Smooth scroll works
- [ ] Lazy loading mode toggle works
- [ ] IntersectionObserver triggers load
- [ ] Products append correctly (not replace)
- [ ] "Tải hết" message shows at end
- [ ] Pagination mode still works
- [ ] Responsive on mobile/tablet/desktop
- [ ] Filter persistence with lazy load
- [ ] Mobile smooth scroll works

---

## 🔗 Dependencies

**Backend:** (no new dependencies)
- mongoose: Already installed
- express: Already installed

**Frontend:** (no new dependencies)
- react: Already installed
- @heroicons/react: Already installed (used for scroll buttons)

---

## 📝 Code Quality

### Naming Conventions
- Service: `<action><resource>Service` (e.g., `getTopBestSellerProductsService`)
- Controller: `<action><resource>` (e.g., `getTopBestSellerProducts`)
- Component: PascalCase (e.g., `ProductCarousel`)
- Variable: camelCase (e.g., `currentPage`, `loadingMore`)

### Error Handling
```javascript
// Consistent error response
{
  EC: 1,  // Error Code (0=success, 1=error)
  EM: "Lỗi lấy sản phẩm bán chạy nhất"  // Error Message
}

// Try-catch in async functions
try {
    // main logic
} catch (error) {
    console.log(error);
    return { EC: 1, EM: "Error message" };
}
```

---

## 🚀 Deployment Checklist

- [ ] Test all endpoints
- [ ] Verify MongoDB indexes created
- [ ] Test pagination limits
- [ ] Test lazy loading with large datasets
- [ ] Test carousel on mobile devices
- [ ] Clear browser cache before testing
- [ ] Check network tab for unnecessary requests
- [ ] Monitor server logs for errors
- [ ] Set appropriate timeout limits
- [ ] Rate limiting for heavy queries (if needed)


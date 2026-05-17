import ProductsPage from './ProductsPage';

const PROMO_DEFAULT_FILTERS = { isSale: 'true', sort: 'price_asc' };

const PromotionsPage = () => (
    <ProductsPage
        pageTitle="Khuyến mãi đặc biệt"
        defaultFilters={PROMO_DEFAULT_FILTERS}
    />
);

export default PromotionsPage;

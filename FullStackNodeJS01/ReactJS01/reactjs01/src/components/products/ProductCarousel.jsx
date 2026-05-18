import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import ProductCard from './ProductCard';

const ProductCarousel = ({ 
    products = [], 
    title = 'Sản phẩm', 
    icon = '📦',
    loading = false,
    itemsPerPage = 4,
    showSold = false
}) => {
    const scrollContainerRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setScrollPosition(scrollLeft);
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    useEffect(() => {
        checkScroll();
    }, [products]);

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

    if (loading) {
        return (
            <section className="py-12" style={{ background: 'transparent' }}>
                <div className="container-custom">
                    <h2 className="section-title mb-6">{icon} {title}</h2>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: '#c97b3a', borderTopColor: 'transparent' }} />
                    </div>
                </div>
            </section>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="py-12" style={{ background: 'transparent' }}>
            <div className="container-custom">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="section-title">{icon} {title}</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                            style={{ background: 'rgba(255,250,242,0.03)', color: '#f2d9b0' }}
                            aria-label="Cuộn trái"
                        >
                            <ChevronLeftIcon size={20} className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                            style={{ background: 'rgba(255,250,242,0.03)', color: '#f2d9b0' }}
                            aria-label="Cuộn phải"
                        >
                            <ChevronRightIcon size={20} className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {products.map((product) => (
                            <div key={product._id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4">
                                <ProductCard product={product} showSold={showSold} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm" style={{ color: '#d8c9b1' }}>
                        Hiển thị {Math.min(itemsPerPage, products.length)} / {products.length} sản phẩm
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ProductCarousel;

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

const ProductGallery = ({ images, productName }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const hasMultiple = images.length > 1;

    return (
        <div className="product-gallery">
            <div className="relative rounded-2xl overflow-hidden bg-stone-100">
                <Swiper
                    modules={[Navigation, Pagination, Thumbs]}
                    navigation={hasMultiple}
                    pagination={hasMultiple ? { clickable: true } : false}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                    className="product-main-swiper"
                >
                    {images.map((src, idx) => (
                        <SwiperSlide key={idx}>
                            <img
                                src={src}
                                alt={`${productName} - ${idx + 1}`}
                                className="w-full h-[320px] sm:h-[400px] lg:h-[520px] object-cover"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
                {hasMultiple && (
                    <span className="absolute bottom-4 right-4 z-10 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                        {activeIndex + 1} / {images.length}
                    </span>
                )}
            </div>

            {hasMultiple && (
                <Swiper
                    onSwiper={setThumbsSwiper}
                    modules={[FreeMode, Thumbs]}
                    freeMode
                    watchSlidesProgress
                    slidesPerView="auto"
                    spaceBetween={10}
                    className="thumbs-swiper mt-3"
                >
                    {images.map((src, idx) => (
                        <SwiperSlide key={idx} className="!w-[72px] cursor-pointer">
                            <img
                                src={src}
                                alt=""
                                className={`w-[72px] h-[72px] object-cover rounded-lg border-2 transition-all ${
                                    activeIndex === idx
                                        ? 'border-amber-600 opacity-100'
                                        : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
};

export default ProductGallery;

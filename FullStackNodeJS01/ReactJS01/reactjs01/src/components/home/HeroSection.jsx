import React from 'react';
import { Link } from 'react-router-dom';

const HERO_IMG =
    'https://res.cloudinary.com/derte9ykz/image/upload/v1778989485/nhan-dinh-hon-r268-white-gold-gallery-01-1.jpg';

const HeroSection = () => {
    return (
        <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,_#d97706_0%,_transparent_50%)]" />
            <div className="container-custom py-16 md:py-24 relative z-10">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div className="text-center md:text-left">
                        <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4 font-medium">
                            Luxury Jewelry Collection
                        </p>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white leading-tight">
                            Trang Sức
                            <span className="block text-amber-400">Cao Cấp</span>
                        </h1>
                        <p className="text-stone-300 text-lg mb-8 max-w-lg">
                            Swarovski · Daniel Wellington · Vàng 18K. Khám phá bộ sưu tập tinh tế,
                            sang trọng dành riêng cho bạn.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <Link to="/products" className="btn-primary">
                                Khám phá bộ sưu tập
                            </Link>
                            <Link
                                to="/promotions"
                                className="inline-flex items-center px-6 py-3 rounded-xl border-2 border-amber-400 text-amber-400 font-semibold hover:bg-amber-400/10 transition"
                            >
                                Khuyến mãi
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src={HERO_IMG}
                            alt="Trang sức cao cấp"
                            className="rounded-2xl shadow-2xl ring-2 ring-amber-500/30 w-full object-cover aspect-square"
                        />
                        <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur rounded-xl shadow-xl p-4 border border-amber-100">
                            <p className="text-amber-700 font-bold text-lg">Giảm đến 30%</p>
                            <p className="text-stone-500 text-sm">Bộ sưu tập mới 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;

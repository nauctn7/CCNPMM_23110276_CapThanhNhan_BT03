import React from 'react';
import { Link } from 'react-router-dom';

const HERO_IMG =
    'https://res.cloudinary.com/derte9ykz/image/upload/v1778989485/nhan-dinh-hon-r268-white-gold-gallery-01-1.jpg';

const HeroSection = () => {
    return (
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(120deg,#fffdf8 0%, #f7efe6 60%)' }}>
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,_rgba(166,124,73,0.06)_0%,_transparent_35%)]" />
            <div className="container-custom py-16 md:py-24 relative z-10">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div className="text-center md:text-center md:mx-auto">
                        <p className="uppercase tracking-[0.3em] text-sm mb-4 font-medium" style={{ color: '#8b6b4a' }}>
                            Luxury Jewelry Collection
                        </p>
                        <h1 className="mx-auto max-w-[12ch] text-4xl md:text-6xl font-bold mb-5 leading-[1.05] tracking-tight" style={{ color: '#3b2a20' }}>
                            <span className="block">Trang Sức</span>
                            <span className="block" style={{ color: '#a17751' }}>Cao Cấp</span>
                        </h1>
                        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#6b5546', lineHeight: 1.7 }}>
                            Swarovski · Daniel Wellington · Vàng 18K. Khám phá bộ sưu tập tinh tế,
                            sang trọng dành riêng cho bạn.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center items-center">
                            <Link to="/products" className="btn-primary">
                                Khám phá bộ sưu tập
                            </Link>
                            <Link
                                to="/promotions"
                                className="inline-flex items-center px-6 py-3 rounded-xl border-2 lux-accent"
                                style={{ borderColor: 'rgba(166,124,73,0.9)', color: '#fff' }}
                            >
                                Khuyến mãi
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src={HERO_IMG}
                            alt="Trang sức cao cấp"
                            className="rounded-2xl shadow-2xl w-full object-cover aspect-square"
                            style={{ boxShadow: '0 18px 40px rgba(45,34,28,0.18)', border: '1px solid rgba(166,124,73,0.08)' }}
                        />
                        <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur rounded-xl shadow-xl p-4 border" style={{ borderColor: 'rgba(166,124,73,0.08)', color: '#3b2a20' }}>
                            <p className="font-bold text-lg" style={{ color: '#a5723e' }}>Giảm đến 30%</p>
                            <p className="text-sm" style={{ color: '#6b5546' }}>Bộ sưu tập mới 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;

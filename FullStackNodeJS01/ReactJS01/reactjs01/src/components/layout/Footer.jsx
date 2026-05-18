import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ background: 'linear-gradient(180deg,#1a0e08 0%, #120a06 100%)' }} className="mt-16 pt-12 pb-8">
            <div className="container-custom grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h4 style={{ color: '#f7efe6' }} className="text-lg font-bold mb-3">LUXURY JEWELRY</h4>
                    <p style={{ color: '#d8c9b1' }} className="text-sm">Trang sức cao cấp — Thiết kế tinh tế, chế tác tỉ mỉ.</p>
                </div>

                <div>
                    <h5 style={{ color: '#f7efe6' }} className="font-semibold mb-2">Hỗ trợ</h5>
                    <ul>
                        <li><Link to="/promotions" style={{ color: '#d8c9b1' }} className="text-sm hover:underline">Khuyến mãi</Link></li>
                        <li><Link to="/products" style={{ color: '#d8c9b1' }} className="text-sm hover:underline">Sản phẩm</Link></li>
                        <li><a href="#" style={{ color: '#d8c9b1' }} className="text-sm hover:underline">Chính sách đổi trả</a></li>
                    </ul>
                </div>

                <div>
                    <h5 style={{ color: '#f7efe6' }} className="font-semibold mb-2">Liên hệ</h5>
                    <p style={{ color: '#d8c9b1' }} className="text-sm">Email: 23110276@student.hcmute.edu.vn</p>
                    <p style={{ color: '#d8c9b1' }} className="text-sm">Hotline: 1900 0000</p>
                </div>
            </div>

            <div className="container-custom mt-8 border-t pt-6" style={{ borderColor: 'rgba(166,124,73,0.06)' }}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p style={{ color: '#bfae98' }} className="text-sm">© {new Date().getFullYear()} LUXURY JEWELRY. All rights reserved.</p>
                    <div className="flex items-center gap-3">
                        <a href="#" style={{ color: '#d8c9b1' }} className="text-sm hover:underline">Facebook</a>
                        <a href="#" style={{ color: '#d8c9b1' }} className="text-sm hover:underline">Instagram</a>
                        <a href="#" style={{ color: '#d8c9b1' }} className="text-sm hover:underline">Pinterest</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

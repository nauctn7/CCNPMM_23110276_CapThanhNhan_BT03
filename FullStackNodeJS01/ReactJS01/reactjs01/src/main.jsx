import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import App from './App';
import { AuthProvider } from './components/context/AuthContext';
import { CartProvider } from './components/context/CartContext';
import './styles/global.css';
import './index.css';
import { clearToken } from './utils/authStorage';

// Mỗi lần tải lại/chạy lại app → trạng thái guest (token không giữ qua F5)
clearToken();
localStorage.removeItem('cart');

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConfigProvider locale={viVN}>
            <BrowserRouter>
                <AuthProvider>
                    <CartProvider>
                        <App />
                    </CartProvider>
                </AuthProvider>
            </BrowserRouter>
        </ConfigProvider>
    </React.StrictMode>
);
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import AppBootstrap from './components/layout/AppBootstrap';
import PrivateRoute from './components/layout/PrivateRoute';
import AdminRoute from './components/layout/AdminRoute';
import GuestRoute from './components/layout/GuestRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyRegistrationOTP from './pages/VerifyRegistrationOTP';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOTP from './pages/VerifyResetOTP';
import ResetPassword from './pages/ResetPasswordOTP';
import ProductDetail from './pages/ProductDetail';
import ProductsPage from './pages/ProductsPage';
import PromotionsPage from './pages/PromotionsPage';
import CartPage from './pages/CartPage';
import Profile from './pages/Profile';
import AdminProductsPage from './pages/AdminProductsPage';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
    return (
        <>
            <Header />
            <AppBootstrap>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/promotions" element={<PromotionsPage />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />

                    <Route
                        path="/cart"
                        element={
                            <PrivateRoute>
                                <CartPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/products"
                        element={
                            <AdminRoute>
                                <AdminProductsPage />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        }
                    />
                    <Route path="/verify-registration-otp" element={<VerifyRegistrationOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </AppBootstrap>
            <Footer />
        </>
    );
}

export default App;

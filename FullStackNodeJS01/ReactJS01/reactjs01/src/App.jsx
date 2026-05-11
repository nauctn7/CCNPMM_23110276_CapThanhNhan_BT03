import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { useAuth } from './components/context/AuthContext';
import Header from './components/layout/Header';
import PrivateRoute from './components/layout/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';

const { Content } = Layout;

function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" tip="Đang tải ứng dụng..." />
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header />
            <Content>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />
                </Routes>
            </Content>
        </Layout>
    );
}

export default App;
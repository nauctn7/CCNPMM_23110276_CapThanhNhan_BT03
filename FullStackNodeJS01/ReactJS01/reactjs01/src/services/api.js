import axios from 'axios';
import { getToken, clearToken } from '../utils/authStorage';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const PUBLIC_PATHS = ['/', '/products', '/promotions', '/cart', '/login', '/register'];

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            clearToken();
            const path = window.location.pathname;
            const isPublic = PUBLIC_PATHS.some(
                (p) => path === p || path.startsWith('/product/')
            );
            if (!isPublic) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

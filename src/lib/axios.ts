import axios from 'axios';

// Must mirror basePath in next.config.ts — window.location.pathname includes
// it, so strip it before the startsWith checks below and prefix it on the
// logout redirect (the hotel app owns the bare /logout on weareanli.com).
const BASE_PATH = '/superadmin';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3001',
    withCredentials: true,
    timeout: 60000,
});
let redirectLock = false;

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('customerToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const status = error?.response?.status;

        if (typeof window !== 'undefined') {
            const rawPath = window.location.pathname;
            const path =
                rawPath === BASE_PATH
                    ? '/'
                    : rawPath.startsWith(`${BASE_PATH}/`)
                      ? rawPath.slice(BASE_PATH.length)
                      : rawPath;
            const isAuthPage =
                path.startsWith('/signin') ||
                path.startsWith('/login') ||
                path.startsWith('/signup') ||
                path.startsWith('/verify-email') ||
                path.startsWith('/logout') ||
                path.startsWith('/staff-login');

            const isPublicPage =
                path.startsWith('/custom-menu') ||
                path.startsWith('/menu') ||
                path.startsWith('/scan') ||
                path.startsWith('/feedback') ||
                path.startsWith('/booking') ||
                path.startsWith('/reservation') ||
                path.startsWith('/payment');

            if (status === 401 && !isAuthPage && !isPublicPage && !redirectLock) {
                redirectLock = true;
                window.location.href = `${BASE_PATH}/logout`;
                setTimeout(() => {
                    redirectLock = false;
                }, 1500);
            }
        }

        return Promise.reject(error);
    },
);
export default api;

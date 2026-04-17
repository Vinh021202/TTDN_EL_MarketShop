import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from './apiBaseUrl';

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

apiClient.interceptors.request.use(
    (config) => {
        const { token, checkAuth } = useAuthStore.getState();

        if (token) {
            const isValid = checkAuth();
            if (!isValid) {
                return Promise.reject(new axios.Cancel('Token expired'));
            }

            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isRedirecting = false;

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isRedirecting) {
            isRedirecting = true;
            useAuthStore.getState().logout();

            setTimeout(() => {
                window.location.href = '/login';
                isRedirecting = false;
            }, 100);
        }

        return Promise.reject(error);
    }
);

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 60000*10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const requestUrl = error.config?.url || '';
        const isLoginAttempt = requestUrl.includes('/auth/login');
        const hasToken = Boolean(localStorage.getItem('access_token'));
        const pathname = window.location.pathname || '';
        const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].some((p) => pathname.startsWith(p));

        // Never redirect for login attempts; let UI show inline error
        if (isLoginAttempt) {
          return Promise.reject(error);
        }

        // If already on an auth page, clear tokens silently and don't reload
        if (isAuthPage) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          return Promise.reject(error);
        }

        // For expired sessions elsewhere, clear and redirect to login
        if (hasToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
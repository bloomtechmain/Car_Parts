import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // A wrong password on the login/register forms is a normal 401 — don't bounce the page
    const isAuthCall = String(error.config?.url || '').includes('/api/auth/');
    if (error.response?.status === 401 && !isAuthCall) {
      useAuthStore.getState().logout();
      window.location.href = '/dashboard/login';
    }
    return Promise.reject(error);
  }
);

export default api;

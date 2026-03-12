import axios from 'axios';
import { getItem, removeItem } from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 and auto-retry on network errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;

    // Auto-retry once on network error (Railway cold start)
    if (!error.response && !config._retried) {
      config._retried = true;
      await new Promise((r) => setTimeout(r, 2000));
      return api(config);
    }

    if (error.response && error.response.status === 401) {
      removeItem('token');
      removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Wake up backend on app load (Railway free tier sleeps after inactivity)
const HEALTH_URL = BASE_URL.replace(/\/api\/v1$/, '/health');
fetch(HEALTH_URL, { method: 'GET', mode: 'cors' }).catch(() => {});

export default api;

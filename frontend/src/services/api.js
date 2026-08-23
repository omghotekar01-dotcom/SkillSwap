import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  config.headers = config.headers || {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    return Promise.reject(err);
  }
);

export default api;
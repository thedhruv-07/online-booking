import axios from 'axios';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.response?.data?.message || error.response?.data?.error || 'Something went wrong';

    if (!error.response && error.request) {
      message = 'Backend server is unreachable. Please ensure the backend is running on port 3001.';
      console.error('Network Error:', error);
    }

    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.config?.showToast !== false) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

api.uploadFile = (url, formData, config = {}) => {
  const { onUploadProgress, ...restConfig } = config;
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
    ...restConfig,
  });
};

export { api };
export default api;

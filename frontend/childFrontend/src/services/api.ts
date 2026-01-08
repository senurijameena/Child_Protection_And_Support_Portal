
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && token.trim() !== '') {

    const cleanToken = token.trim();
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      console.warn('401 Unauthorized - clearing auth data');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('badgeNumber');
      localStorage.removeItem('licenseNumber');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {

      console.warn('403 Forbidden - insufficient permissions');
    }
    return Promise.reject(error);
  }
);

export default api;


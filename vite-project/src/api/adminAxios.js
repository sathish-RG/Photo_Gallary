// src/api/adminAxios.js
import axios from 'axios';

const adminApi = axios.create({
  baseURL: 'http://localhost:5000/api/admin', // base for admin routes
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminApi;

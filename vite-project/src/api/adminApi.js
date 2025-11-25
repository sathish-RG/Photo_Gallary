// src/api/adminApi.js
import adminApi from './adminAxios'; // use admin axios instance

export const getAllUsers = async () => {
  return adminApi.get('/users');
};

export const updateUserStatus = async (userId, isActive) => {
  return adminApi.put(`/users/${userId}/status`, { isActive });
};

export const getUserContent = async (userId) => {
  return adminApi.get(`/users/${userId}/content`);
};

export const getReportedContent = async () => {
  return adminApi.get('/reported');
};

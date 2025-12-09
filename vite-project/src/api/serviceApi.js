import axios from 'axios';

const API_URL = 'http://localhost:5000/api/services';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Get all services for logged-in photographer
 */
export const getServices = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

/**
 * Get public services for a photographer
 */
export const getPublicServices = async (photographerId) => {
  const response = await axios.get(`${API_URL}/public/${photographerId}`);
  return response.data;
};

/**
 * Create new service
 */
export const createService = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeader());
  return response.data;
};

/**
 * Update service
 */
export const updateService = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

/**
 * Delete service
 */
export const deleteService = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

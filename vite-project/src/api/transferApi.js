import axios from 'axios';

const API_URL = 'http://localhost:5000/api/transfers';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Create new transfer with files
 * @param {FormData} formData - Form data with files and metadata
 */
export const createTransfer = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Create transfer from existing media/photos
 * @param {Object} data - Transfer data with mediaIds array
 */
export const createTransferFromMedia = async (data) => {
  const response = await axios.post(`${API_URL}/from-media`, data, getAuthHeader());
  return response.data;
};

/**
 * Get all transfers for logged-in user
 */
export const getUserTransfers = async () => {
  const response = await axios.get(`${API_URL}/user`, getAuthHeader());
  return response.data;
};

/**
 * Get transfer details by slug (public)
 * @param {string} slug - Transfer slug
 */
export const getTransferBySlug = async (slug) => {
  const response = await axios.get(`${API_URL}/${slug}`);
  return response.data;
};

/**
 * Download transfer as zip (public)
 * @param {string} slug - Transfer slug
 */
export const downloadTransferZip = (slug) => {
  // Create download link
  const downloadUrl = `${API_URL}/${slug}/download`;
  window.open(downloadUrl, '_blank');
};

/**
 * Delete transfer
 * @param {string} id - Transfer ID
 */
export const deleteTransfer = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

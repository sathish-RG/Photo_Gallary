import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create a new gift card
 * @param {Object} data - Gift card data (title, message, themeColor, mediaContent, albumId)
 * @returns {Promise} API response with gift card data and public URL
 */
export const createGiftCard = async (data) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/gift-cards`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Get gift card by slug (public - no auth required)
 * @param {string} slug - Unique gift card slug
 * @returns {Promise} API response with gift card data
 */
export const getGiftCardBySlug = async (slug) => {
  return axios.get(`${API_URL}/gift-cards/view/${slug}`);
};

/**
 * Get all gift cards for a specific album
 * @param {string} albumId - Album/Folder ID
 * @returns {Promise} API response with array of gift cards
 */
export const getAlbumGiftCards = async (albumId) => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/gift-cards/album/${albumId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Update an existing gift card
 * @param {string} id - Gift card ID
 * @param {Object} data - Updated gift card data
 * @returns {Promise} API response with updated gift card
 */
export const updateGiftCard = async (id, data) => {
  const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/gift-cards/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Delete a gift card
 * @param {string} id - Gift card ID
 * @returns {Promise} API response
 */
export const deleteGiftCard = async (id) => {
  const token = localStorage.getItem('token');
  return axios.delete(`${API_URL}/gift-cards/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Unlock a protected gift card
 * @param {string} slug - Gift card slug
 * @param {string} password - Password to unlock
 * @returns {Promise} API response with full gift card data
 */
export const unlockGiftCard = async (slug, password) => {
  return axios.post(`${API_URL}/gift-cards/unlock/${slug}`, { password });
};

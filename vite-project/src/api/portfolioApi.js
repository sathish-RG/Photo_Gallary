import axios from 'axios';

const API_URL = 'http://localhost:5000/api/portfolio';

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Create or update portfolio
 * @param {Object} portfolioData - Portfolio data
 * @returns {Promise} API response
 */
export const upsertPortfolio = async (portfolioData) => {
  const response = await axios.post(API_URL, portfolioData, getAuthHeader());
  return response.data;
};

/**
 * Get portfolio by slug (public)
 * @param {string} slug - Portfolio slug
 * @returns {Promise} API response
 */
export const getPortfolioBySlug = async (slug) => {
  const response = await axios.get(`${API_URL}/${slug}`);
  return response.data;
};

/**
 * Get current user's portfolio
 * @returns {Promise} API response
 */
export const getMyPortfolio = async () => {
  const response = await axios.get(`${API_URL}/my/portfolio`, getAuthHeader());
  return response.data;
};

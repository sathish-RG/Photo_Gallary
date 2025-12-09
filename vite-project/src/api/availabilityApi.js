import axios from 'axios';

const API_URL = 'http://localhost:5000/api/availability';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Get photographer's availability
 */
export const getAvailability = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

/**
 * Update photographer's availability
 */
export const updateAvailability = async (data) => {
  const response = await axios.put(API_URL, data, getAuthHeader());
  return response.data;
};

/**
 * Get available time slots for a specific date and service
 */
export const getAvailableSlots = async (photographerId, serviceId, date) => {
  const response = await axios.get(`${API_URL}/${photographerId}/slots`, {
    params: { serviceId, date },
  });
  return response.data;
};

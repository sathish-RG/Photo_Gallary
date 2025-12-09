import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bookings';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Get all bookings for photographer
 */
export const getBookings = async (status = null) => {
  const params = status ? { status } : {};
  const response = await axios.get(API_URL, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

/**
 * Create new booking (public)
 */
export const createBooking = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/${id}/status`, { status }, getAuthHeader());
  return response.data;
};

/**
 * Cancel booking
 */
export const cancelBooking = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

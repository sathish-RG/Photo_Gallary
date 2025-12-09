import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Get all notifications
 */
export const getNotifications = async (unreadOnly = false) => {
  const params = unreadOnly ? { unreadOnly: 'true' } : {};
  const response = await axios.get(API_URL, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/read`, {}, getAuthHeader());
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  const response = await axios.put(`${API_URL}/read-all`, {}, getAuthHeader());
  return response.data;
};

/**
 * Delete notification
 */
export const deleteNotification = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

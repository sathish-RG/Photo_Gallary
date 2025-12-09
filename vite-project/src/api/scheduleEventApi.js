import axios from 'axios';

const API_URL = 'http://localhost:5000/api/schedule-events';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Get all schedule events
 */
export const getScheduleEvents = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await axios.get(API_URL, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

/**
 * Create schedule event
 */
export const createScheduleEvent = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeader());
  return response.data;
};

/**
 * Update schedule event
 */
export const updateScheduleEvent = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

/**
 * Delete schedule event
 */
export const deleteScheduleEvent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

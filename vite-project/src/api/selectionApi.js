import axios from 'axios';

const API_URL = 'http://localhost:5000/api/selections';

export const createSelection = async (data) => {
  return await axios.post(API_URL, data);
};

export const getSelectionsByFolder = async (folderId) => {
  const token = localStorage.getItem('token');
  return await axios.get(`${API_URL}/folder/${folderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateSelectionStatus = async (id, status) => {
  const token = localStorage.getItem('token');
  return await axios.put(`${API_URL}/${id}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

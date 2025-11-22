import axios from 'axios';

const API_URL = 'http://localhost:5000/api/folders';

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
 * Create a new folder
 * @param {string} name - The folder name
 * @param {string} password - Optional password for folder protection
 */
export const createFolder = async (name, password = null) => {
  const data = { name };
  if (password) {
    data.password = password;
  }
  const response = await axios.post(API_URL, data, getAuthHeader());
  return response.data;
};

/**
 * Get all folders for the logged-in user
 */
export const getFolders = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

/**
 * Delete a folder by ID
 * @param {string} folderId - The ID of the folder to delete
 * @param {string} password - Optional password for protected folders
 */
export const deleteFolder = async (folderId, password = null) => {
  const data = password ? { password } : {};
  const response = await axios.delete(`${API_URL}/${folderId}`, {
    ...getAuthHeader(),
    data,
  });
  return response.data;
};

/**
 * Verify folder password
 * @param {string} folderId - The ID of the folder
 * @param {string} password - The password to verify
 */
export const verifyFolderPassword = async (folderId, password) => {
  const response = await axios.post(`${API_URL}/${folderId}/verify`, { password }, getAuthHeader());
  return response.data;
};


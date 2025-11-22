import axios from 'axios';

const API_URL = 'http://localhost:5000/api/photos';

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
 * Upload a new photo
 * @param {File} imageFile - The image file to upload
 * @param {string} caption - Optional caption for the photo
 * @param {string} folderId - Optional folder ID to save photo into
 */
export const uploadPhoto = async (imageFile, caption = '', folderId = null) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('caption', caption);
  if (folderId) {
    formData.append('folderId', folderId);
  }

  const response = await axios.post(API_URL, formData, {
    headers: {
      ...getAuthHeader().headers,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Get all photos for the logged-in user (optionally filtered by folder)
 * @param {string} folderId - Optional folder ID to filter photos
 */
export const getPhotos = async (folderId = null) => {
  const url = folderId ? `${API_URL}?folderId=${folderId}` : API_URL;
  const response = await axios.get(url, getAuthHeader());
  return response.data;
};

/**
 * Delete a photo by ID
 * @param {string} photoId - The ID of the photo to delete
 */
export const deletePhoto = async (photoId) => {
  const response = await axios.delete(`${API_URL}/${photoId}`, getAuthHeader());
  return response.data;
};

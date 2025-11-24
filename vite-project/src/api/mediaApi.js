import axios from 'axios';

const API_URL = 'http://localhost:5000/api/media';

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
 * Upload a new media file
 * @param {File} mediaFile - The media file to upload (image, video, or audio)
 * @param {string} caption - Optional caption for the media
 * @param {string} folderId - Optional folder ID to save media into
 */
export const uploadMedia = async (mediaData) => {
  const response = await axios.post(API_URL, mediaData, {
    headers: {
      ...getAuthHeader().headers,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

/**
 * Get all media for the logged-in user (optionally filtered by folder)
 * @param {string} folderId - Optional folder ID to filter media
 */
export const getMedia = async (folderId = null) => {
  const url = folderId ? `${API_URL}?folderId=${folderId}` : API_URL;
  const response = await axios.get(url, getAuthHeader());
  return response.data;
};

/**
 * Delete a media file by ID
 * @param {string} mediaId - The ID of the media to delete
 */
export const deleteMedia = async (mediaId) => {
  const response = await axios.delete(`${API_URL}/${mediaId}`, getAuthHeader());
  return response.data;
};

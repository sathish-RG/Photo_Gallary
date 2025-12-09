import axios from 'axios';

const API_URL = 'http://localhost:5000/api/clients';

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
 * Get all clients for the logged-in user
 */
export const getClients = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

/**
 * Get single client by ID
 * @param {string} clientId - The ID of the client
 */
export const getClient = async (clientId) => {
  const response = await axios.get(`${API_URL}/${clientId}`, getAuthHeader());
  return response.data;
};

/**
 * Create a new client
 * @param {Object} clientData - The client data (name, email, phone, address, notes)
 */
export const createClient = async (clientData) => {
  const response = await axios.post(API_URL, clientData, getAuthHeader());
  return response.data;
};

/**
 * Update an existing client
 * @param {string} clientId - The ID of the client to update
 * @param {Object} clientData - The updated client data
 */
export const updateClient = async (clientId, clientData) => {
  const response = await axios.put(`${API_URL}/${clientId}`, clientData, getAuthHeader());
  return response.data;
};

/**
 * Delete a client
 * @param {string} clientId - The ID of the client to delete
 */
export const deleteClient = async (clientId) => {
  const response = await axios.delete(`${API_URL}/${clientId}`, getAuthHeader());
  return response.data;
};

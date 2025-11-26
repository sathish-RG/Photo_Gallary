import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all templates
export const getAllTemplates = () => {
  return axios.get(`${API_URL}/templates`);
};

// Get single template
export const getTemplateById = (id) => {
  return axios.get(`${API_URL}/templates/${id}`);
};

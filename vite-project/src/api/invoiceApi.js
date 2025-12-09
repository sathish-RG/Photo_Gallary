import axios from 'axios';

const API_URL = 'http://localhost:5000/api/invoices';

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
 * Get all invoices for the logged-in user
 */
export const getInvoices = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

/**
 * Get single invoice by ID
 * @param {string} invoiceId - The ID of the invoice
 */
export const getInvoice = async (invoiceId) => {
  const response = await axios.get(`${API_URL}/${invoiceId}`, getAuthHeader());
  return response.data;
};

/**
 * Create a new invoice
 * @param {Object} invoiceData - The invoice data (client, items, status, dueDate)
 */
export const createInvoice = async (invoiceData) => {
  const response = await axios.post(API_URL, invoiceData, getAuthHeader());
  return response.data;
};

/**
 * Update an existing invoice
 * @param {string} invoiceId - The ID of the invoice to update
 * @param {Object} invoiceData - The updated invoice data
 */
export const updateInvoice = async (invoiceId, invoiceData) => {
  const response = await axios.put(`${API_URL}/${invoiceId}`, invoiceData, getAuthHeader());
  return response.data;
};

/**
 * Delete an invoice
 * @param {string} invoiceId - The ID of the invoice to delete
 */
export const deleteInvoice = async (invoiceId) => {
  const response = await axios.delete(`${API_URL}/${invoiceId}`, getAuthHeader());
  return response.data;
};

/**
 * Generate and download invoice PDF
 * @param {string} invoiceId - The ID of the invoice
 */
export const generateInvoicePDF = async (invoiceId) => {
  const response = await axios.get(`${API_URL}/generate/${invoiceId}`, {
    ...getAuthHeader(),
    responseType: 'blob', // Important for PDF download
  });
  
  // Create a download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice-${invoiceId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response.data;
};

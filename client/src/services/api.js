import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Remove empty / "All" filters before sending
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== 'All' && v != null)
  );

export const getErrorMessage = (error) =>
  error.response?.data?.message ||
  (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
  (error.request ? 'Cannot reach the server. Check that the API is running.' : error.message) ||
  'Something went wrong';

export const getTransactions = async (params) =>
  (await api.get('/transactions', { params: cleanParams(params) })).data.data;

export const getSummary = async (params) =>
  (await api.get('/transactions/summary', { params: cleanParams(params) })).data.data;

export const createTransaction = async (payload) =>
  (await api.post('/transactions', payload)).data.data;

export const updateTransaction = async (id, payload) =>
  (await api.put(`/transactions/${id}`, payload)).data.data;

export const deleteTransaction = async (id) =>
  (await api.delete(`/transactions/${id}`)).data;

export default api;

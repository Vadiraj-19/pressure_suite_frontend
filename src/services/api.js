import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Pressure Test API calls
export const pressureTestAPI = {
  // Get all tests
  getAllTests: () => api.get('/api/pressure-tests'),
  
  // Get ongoing tests
  getOngoingTests: () => api.get('/api/pressure-tests/ongoing'),
  
  // Get test by ID
  getTestById: (id) => api.get(`/api/pressure-tests/${id}`),
  
  // Create new test
  createTest: (formData) => api.post('/api/pressure-tests', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Update test (end test)
  updateTest: (id, formData) => api.put(`/api/pressure-tests/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Delete test
  deleteTest: (id) => api.delete(`/api/pressure-tests/${id}`),
};

export default api;

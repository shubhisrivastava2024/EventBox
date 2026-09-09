import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getMe: () => api.get('/auth/me'),
};

export const venueAPI = {
  create: (data) => api.post('/venues', data),
  getAll: () => api.get('/venues'),
};

export const eventAPI = {
  create: (data) => api.post('/events', data),
  getAll: (category) => api.get('/events', { params: { category } }),
  getById: (id) => api.get(`/events/${id}`),
  getSeats: (id) => api.get(`/events/${id}/seats`),
};

export const orderAPI = {
  checkout: (data) => api.post('/orders/checkout', data),
  getMyOrders: () => api.get('/orders/my-orders'),
};

export const ticketAPI = {
  validate: (ticketCode) => api.post('/tickets/validate', { ticket_code: ticketCode }),
  getMyTickets: () => api.get('/tickets/my-tickets'),
};

export const supportAPI = {
  createCase: (data) => api.post('/support/cases', data),
  getCases: () => api.get('/support/cases'),
  approveRefund: (data) => api.post('/support/refund/approve', data),
};

export default api;

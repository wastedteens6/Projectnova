// API Service for frontend
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api'

// Export API_BASE for use in other components
export const API_BASE_URL = API_BASE

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth Services
export const authService = {
  register: (email, name, password) =>
    api.post('/auth/register', { email, name, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  adminLogin: (email, password) =>
    api.post('/auth/admin-login', { email, password }),
  getCurrentUser: () =>
    api.get('/auth/me'),
  logout: () =>
    api.post('/auth/logout'),
}

// Projects Services
export const projectService = {
  getAll: () =>
    api.get('/projects'),
  getBySlug: (slug) =>
    api.get(`/projects/${slug}`),
  create: (projectData) =>
    api.post('/projects/create', projectData),
}

// Cart Services
export const cartService = {
  getCart: () =>
    api.get('/cart'),
  addToCart: (projectId) =>
    api.post('/cart/add', { projectId }),
}

// Checkout Services
export const checkoutService = {
  createOrder: (amount, projectIds, email, phone) =>
    api.post('/checkout/create-order', { amount, projectIds, email, phone }),
  verifyPayment: (orderId, paymentId, signature) =>
    api.post('/checkout/verify-payment', { orderId, paymentId, signature }),
}

// Orders Services
export const orderService = {
  getOrders: () =>
    api.get('/orders'),
}

// Support Services
export const supportService = {
  getTickets: () =>
    api.get('/support/tickets'),
  createTicket: (subject, message) =>
    api.post('/support/tickets', { subject, message }),
}

export default api

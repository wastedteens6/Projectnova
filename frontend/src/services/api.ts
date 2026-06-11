import api from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = `${API_URL}/api`;

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
  register: (email: any, name: any, password: any) =>
    api.post('/auth/register', { email, name, password }),
  login: (email: any, password: any) =>
    api.post('/auth/login', { email, password }),
  adminLogin: (email: any, password: any) =>
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
  getBySlug: (slug: any) =>
    api.get(`/projects/${slug}`),
  create: (projectData: any) =>
    api.post('/projects/create', projectData),
}

// Cart Services
export const cartService = {
  getCart: () =>
    api.get('/cart'),
  addToCart: (projectId: any) =>
    api.post('/cart/add', { projectId }),
}

// Checkout Services
export const checkoutService = {
  createOrder: (amount: any, projectIds: any, email: any, phone: any) =>
    api.post('/checkout/create-order', { amount, projectIds, email, phone }),
  verifyPayment: (orderId: any, paymentId: any, signature: any) =>
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
  createTicket: (subject: any, message: any) =>
    api.post('/support/tickets', { subject, message }),
}

export default api

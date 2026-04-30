import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://caterease-d13p.onrender.com/api' 
    : '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getMe: () => api.get('/me'),
};

// Customer
export const customerAPI = {
  getProviders: () => api.get('/customer/providers'),
  getMenus: (providerId) => api.get(`/customer/menus/${providerId}`),
  createOrder: (data) => api.post('/customer/orders', data),
  getMyOrders: () => api.get('/customer/my-orders'),
  addPayment: (orderId, amount) => api.post(`/customer/orders/${orderId}/payment`, { amount }),
};

// Provider
export const providerAPI = {
  createProfile: (data) => api.post('/provider/profile', data),
  getMenus: () => api.get('/provider/menus'),
  createMenu: (data) => api.post('/provider/menus', data),
  updateMenu: (id, data) => api.put(`/provider/menus/${id}`, data),
  deleteMenu: (id) => api.delete(`/provider/menus/${id}`),
  getOrders: () => api.get('/provider/orders'),
  updateOrderStatus: (id, status) => api.put(`/provider/orders/${id}/status`, { status }),
};

// Admin
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getProviders: () => api.get('/admin/providers'),
  approveProvider: (id, status) => api.put(`/admin/providers/${id}/approve`, { status }),
  getOrders: () => api.get('/admin/orders'),
};

export default api;

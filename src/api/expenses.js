import api from './axios'

export const expensesApi = {
  getAll: (chamaId) => api.get(`/chamas/${chamaId}/expenses`),
  getById: (chamaId, id) => api.get(`/chamas/${chamaId}/expenses/${id}`),
  create: (chamaId, data) => api.post(`/chamas/${chamaId}/expenses`, data),
  update: (chamaId, id, data) => api.put(`/chamas/${chamaId}/expenses/${id}`, data),
  delete: (chamaId, id) => api.delete(`/chamas/${chamaId}/expenses/${id}`),
  getCategories: (chamaId) => api.get(`/chamas/${chamaId}/expense-categories`),
  getStats: (chamaId) => api.get(`/chamas/${chamaId}/expense-stats`)
}

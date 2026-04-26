import api from './axios'

export const recurringContributionsApi = {
  getAll: (chamaId) => api.get(`/chamas/${chamaId}/recurring-contributions`),
  getUserContributions: () => api.get('/recurring-contributions'),
  getById: (chamaId, id) => api.get(`/chamas/${chamaId}/recurring-contributions/${id}`),
  create: (chamaId, data) => api.post(`/chamas/${chamaId}/recurring-contributions`, data),
  update: (chamaId, id, data) => api.put(`/chamas/${chamaId}/recurring-contributions/${id}`, data),
  pause: (chamaId, id) => api.post(`/chamas/${chamaId}/recurring-contributions/${id}/pause`),
  resume: (chamaId, id) => api.post(`/chamas/${chamaId}/recurring-contributions/${id}/resume`),
  cancel: (chamaId, id) => api.delete(`/chamas/${chamaId}/recurring-contributions/${id}`)
}

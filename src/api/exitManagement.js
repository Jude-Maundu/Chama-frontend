import api from './axios'

export const exitManagementApi = {
  getExitRequests: (chamaId) => api.get(`/chamas/${chamaId}/exit-requests`),
  submitExitRequest: (chamaId, data) => api.post(`/chamas/${chamaId}/exit-requests`, data),
  processExitRequest: (chamaId, requestId, data) => api.post(`/chamas/${chamaId}/exit-requests/${requestId}/process`, data),
  getNominations: (chamaId) => api.get(`/chamas/${chamaId}/nominations`),
  storeNomination: (chamaId, data) => api.post(`/chamas/${chamaId}/nominations`, data),
  deleteNomination: (chamaId, nominationId) => api.delete(`/chamas/${chamaId}/nominations/${nominationId}`)
}

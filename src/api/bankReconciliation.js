import api from './axios'

export const bankReconciliationApi = {
  getAll: (chamaId) => api.get(`/chamas/${chamaId}/bank-reconciliation`),
  getById: (chamaId, id) => api.get(`/chamas/${chamaId}/bank-reconciliation/${id}`),
  upload: (chamaId, formData) => api.post(`/chamas/${chamaId}/bank-reconciliation/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getResults: (chamaId, id) => api.get(`/chamas/${chamaId}/bank-reconciliation/${id}/results`),
  getDiscrepancies: (chamaId, id) => api.get(`/chamas/${chamaId}/bank-reconciliation/${id}/discrepancies`),
  approve: (chamaId, id) => api.post(`/chamas/${chamaId}/bank-reconciliation/${id}/approve`)
}

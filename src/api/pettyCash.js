import api from './axios'

export const pettyCashApi = {
  getAll: (chamaId) => api.get(`/chamas/${chamaId}/petty-cash`),
  getById: (chamaId, id) => api.get(`/chamas/${chamaId}/petty-cash/${id}`),
  create: (chamaId, data) => api.post(`/chamas/${chamaId}/petty-cash`, data),
  submitClaim: (chamaId, accountId, data) => api.post(`/chamas/${chamaId}/petty-cash/${accountId}/claims`, data),
  getPendingClaims: (chamaId, accountId) => api.get(`/chamas/${chamaId}/petty-cash/${accountId}/pending-claims`),
  approveClaim: (chamaId, accountId, claimId) => api.post(`/chamas/${chamaId}/petty-cash/${accountId}/claims/${claimId}/approve`),
  payClaim: (chamaId, accountId, claimId) => api.post(`/chamas/${chamaId}/petty-cash/${accountId}/claims/${claimId}/pay`),
  rejectClaim: (chamaId, accountId, claimId) => api.post(`/chamas/${chamaId}/petty-cash/${accountId}/claims/${claimId}/reject`),
  reconcile: (chamaId, accountId, data) => api.post(`/chamas/${chamaId}/petty-cash/${accountId}/reconcile`, data),
  approveReconciliation: (chamaId, accountId, reconciliationId) => api.post(`/chamas/${chamaId}/petty-cash/${accountId}/reconciliations/${reconciliationId}/approve`)
}

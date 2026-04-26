import api from './axios'

export const emergencyFundApi = {
  get(chamaId) {
    return api.get(`/chamas/${chamaId}/emergency-fund`)
  },

  addFunds(chamaId, data) {
    return api.post(`/chamas/${chamaId}/emergency-fund/add-funds`, data)
  },

  requestWithdrawal(chamaId, data) {
    return api.post(`/chamas/${chamaId}/emergency-fund/request-withdrawal`, data)
  },

  getWithdrawal(chamaId, id) {
    return api.get(`/chamas/${chamaId}/emergency-fund/withdrawals/${id}`)
  },

  getPendingWithdrawals(chamaId) {
    return api.get(`/chamas/${chamaId}/emergency-fund/pending-withdrawals`)
  },

  approveWithdrawal(chamaId, id, data) {
    return api.post(`/chamas/${chamaId}/emergency-fund/withdrawals/${id}/approve`, data)
  },

  rejectWithdrawal(chamaId, id, data) {
    return api.post(`/chamas/${chamaId}/emergency-fund/withdrawals/${id}/reject`, data)
  },

  processWithdrawal(chamaId, id) {
    return api.post(`/chamas/${chamaId}/emergency-fund/withdrawals/${id}/process`)
  }
}

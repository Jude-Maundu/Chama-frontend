import api from './axios'

export const engagementApi = {
  getDirectory(chamaId, params) {
    return api.get(`/chamas/${chamaId}/directory`, { params })
  },

  getReferrals(chamaId) {
    return api.get(`/chamas/${chamaId}/referrals`)
  },

  submitFeedback(chamaId, data) {
    return api.post(`/chamas/${chamaId}/feedback`, data)
  },

  getSkills(chamaId) {
    return api.get(`/chamas/${chamaId}/skills`)
  },

  updateSkills(chamaId, data) {
    return api.put(`/chamas/${chamaId}/skills`, data)
  }
}

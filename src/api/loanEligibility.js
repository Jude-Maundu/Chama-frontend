import api from './axios'

export const loanEligibilityApi = {
  getStats(chamaId) {
    return api.get(`/chamas/${chamaId}/loan-eligibility`)
  },

  getUserScore(chamaId, userId) {
    return api.get(`/chamas/${chamaId}/loan-eligibility/${userId}`)
  },

  refreshScore(chamaId, userId) {
    return api.post(`/chamas/${chamaId}/loan-eligibility/${userId}/refresh`)
  }
}

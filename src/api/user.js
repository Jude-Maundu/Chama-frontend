import api from './axios'

export const userApi = {
  getProfile() {
    return api.get('/user')
  },

  getStats() {
    return api.get('/dashboard/stats')
  },

  updateProfile(payload) {
    return api.put('/profile', payload)
  },

  changePassword(payload) {
    return api.post('/auth/change-password', payload)
  },

  updateBank(payload) {
    return api.put('/profile', payload)
  },

  updateNotifications(payload) {
    return api.post('/notifications/preferences', payload)
  }
}

import api from './axios'

export const dashboardApi = {
  getAdminStats() {
    return api.get('/dashboard/admin')
  },
  
  getTreasurerStats() {
    return api.get('/dashboard/treasurer')
  },
  
  getMemberStats() {
    return api.get('/dashboard/member')
  }
}

import api from './axios'

export const adminExtraApi = {
  getRoles: (chamaId) => api.get(`/chamas/${chamaId}/admin/roles`),
  storeRole: (chamaId, data) => api.post(`/chamas/${chamaId}/admin/roles`, data),
  
  getPermissions: (chamaId) => api.get(`/chamas/${chamaId}/admin/permissions`),
  
  getWebhooks: (chamaId) => api.get(`/chamas/${chamaId}/admin/webhooks`),
  storeWebhook: (chamaId, data) => api.post(`/chamas/${chamaId}/admin/webhooks`, data),
  deleteWebhook: (chamaId, id) => api.delete(`/chamas/${chamaId}/admin/webhooks/${id}`),
  
  getBackupSettings: (chamaId) => api.get(`/chamas/${chamaId}/admin/backup-settings`),
  
  getSmsCredits: (chamaId) => api.get(`/chamas/${chamaId}/admin/sms-credits`),
  purchaseSmsCredits: (chamaId, data) => api.post(`/chamas/${chamaId}/admin/sms-credits`, data)
}

export const analyticsApi = {
  getPredictive: (chamaId) => api.get(`/chamas/${chamaId}/analytics/predictive`),
  getBenchmarking: (chamaId) => api.get(`/chamas/${chamaId}/analytics/benchmarking`),
  getTaxSummary: (chamaId) => api.get(`/chamas/${chamaId}/tax/summary`),
  calculateTax: (chamaId, data) => api.post(`/chamas/${chamaId}/tax/calculate`, data),
  getSavingsProjection: (chamaId) => api.get(`/chamas/${chamaId}/reports/savings-projection`)
}

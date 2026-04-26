import api from './axios'

export const settingApi = {
  getAll() {
    return api.get('/settings')
  },

  get(id) {
    return api.get(`/settings/${id}`)
  },

  create(data) {
    return api.post('/settings', data)
  },

  update(id, data) {
    return api.put(`/settings/${id}`, data)
  },

  delete(id) {
    return api.delete(`/settings/${id}`)
  },

  bulkUpdate(data) {
    return api.post('/settings/bulk-update', data)
  }
}

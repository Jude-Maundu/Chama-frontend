import api from './axios'

export const investmentApi = {
  getAll() {
    return api.get('/investments')
  },

  get(id) {
    return api.get(`/investments/${id}`)
  },

  create(data) {
    return api.post('/investments', data)
  },

  update(id, data) {
    return api.put(`/investments/${id}`, data)
  },

  delete(id) {
    return api.delete(`/investments/${id}`)
  },

  withdraw(id, data) {
    return api.post(`/investments/${id}/withdraw`, data)
  }
}
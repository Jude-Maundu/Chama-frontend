import api from './axios'

export const financialGoalsApi = {
  getAll(chamaId, params) {
    return api.get(`/chamas/${chamaId}/financial-goals`, { params })
  },

  get(chamaId, id) {
    return api.get(`/chamas/${chamaId}/financial-goals/${id}`)
  },

  create(chamaId, data) {
    return api.post(`/chamas/${chamaId}/financial-goals`, data)
  },

  update(chamaId, id, data) {
    return api.put(`/chamas/${chamaId}/financial-goals/${id}`, data)
  },

  addProgress(chamaId, id, data) {
    return api.post(`/chamas/${chamaId}/financial-goals/${id}/progress`, data)
  },

  delete(chamaId, id) {
    return api.delete(`/chamas/${chamaId}/financial-goals/${id}`)
  }
}

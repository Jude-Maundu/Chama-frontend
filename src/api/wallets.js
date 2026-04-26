import api from './axios'

export const walletsApi = {
  getAll(chamaId, params) {
    return api.get(`/chamas/${chamaId}/wallets`, { params })
  },

  get(chamaId, id) {
    return api.get(`/chamas/${chamaId}/wallets/${id}`)
  },

  create(chamaId, data) {
    return api.post(`/chamas/${chamaId}/wallets`, data)
  },

  update(chamaId, id, data) {
    return api.put(`/chamas/${chamaId}/wallets/${id}`, data)
  },

  delete(chamaId, id) {
    return api.delete(`/chamas/${chamaId}/wallets/${id}`)
  },

  transfer(chamaId, data) {
    return api.post(`/chamas/${chamaId}/wallets/transfer`, data)
  },

  getTransfers(chamaId, id) {
    return api.get(`/chamas/${chamaId}/wallets/${id}/transfers`)
  }
}

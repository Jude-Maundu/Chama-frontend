import api from './axios'

export const dividendApi = {
  getAll() {
    return api.get('/dividends')
  },

  getMyDividends() {
    return api.get('/dividends/my-dividends')
  },

  get(id) {
    return api.get(`/dividends/${id}`)
  },

  create(data) {
    return api.post('/dividends', data)
  },

  update(id, data) {
    return api.put(`/dividends/${id}`, data)
  },

  delete(id) {
    return api.delete(`/dividends/${id}`)
  },

  calculate(data) {
    return api.post('/dividends/calculate', data)
  },

  distribute(id, data) {
    return api.post(`/dividends/${id}/distribute`, data)
  }
}
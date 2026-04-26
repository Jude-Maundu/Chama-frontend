import api from './axios'

export const contributionApi = {
  getAll(params) {
    return api.get('/contributions', { params })
  },
  
  get(id) {
    return api.get(`/contributions/${id}`)
  },
  
  create(data) {
    return api.post('/contributions', data)
  },
  
  getHistory(memberId) {
    return api.get(`/contributions/history/${memberId}`)
  },
  
  getReport(params) {
    return api.get('/contributions/report', { params })
  },
  
  getPending() {
    return api.get('/contributions/pending')
  },
  
  mpesaPay(data) {
    return api.post('/contributions/mpesa-pay', data)
  },
  
  downloadReceipt(id) {
    return api.get(`/contributions/receipt/${id}`, { responseType: 'blob' })
  }
}

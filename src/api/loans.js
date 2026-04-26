import api from './axios'

export const loanApi = {
  getAll(params) {
    return api.get('/loans', { params })
  },
  
  get(id) {
    return api.get(`/loans/${id}`)
  },
  
  apply(data) {
    return api.post('/loans', data)
  },
  
  approve(id, data) {
    return api.post(`/loans/${id}/approve`, data)
  },
  
  reject(id, data) {
    return api.post(`/loans/${id}/reject`, data)
  },
  
  repay(id, data) {
    return api.post(`/loans/${id}/repay`, data)
  },
  
  getSchedule(id) {
    return api.get(`/loans/${id}/schedule`)
  },
  
  getDefaulters() {
    return api.get('/loans/defaulters')
  }
}

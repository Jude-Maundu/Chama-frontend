import api from './axios'

export const mpesaApi = {
  stkPush(data) {
    return api.post('/mpesa/stkpush', data)
  },
  
  checkStatus(checkoutId) {
    return api.get(`/mpesa/status/${checkoutId}`)
  },
  
  b2c(data) {
    return api.post('/mpesa/b2c', data)
  },
  
  getBalance() {
    return api.get('/mpesa/balance')
  },
  
  reconcile() {
    return api.post('/mpesa/reconcile')
  }
}

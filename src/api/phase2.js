import api from './axios'

export const recurringContributionsApi = {
  getAll(params) {
    return api.get('/chamas/{chama}/recurring-contributions', { params })
  },

  get(id) {
    return api.get(`/chamas/{chama}/recurring-contributions/${id}`)
  },

  create(data) {
    return api.post('/chamas/{chama}/recurring-contributions', data)
  },

  update(id, data) {
    return api.put(`/chamas/{chama}/recurring-contributions/${id}`, data)
  },

  pause(id) {
    return api.post(`/chamas/{chama}/recurring-contributions/${id}/pause`)
  },

  resume(id) {
    return api.post(`/chamas/{chama}/recurring-contributions/${id}/resume`)
  },

  delete(id) {
    return api.delete(`/chamas/{chama}/recurring-contributions/${id}`)
  }
}

export const expensesApi = {
  getAll(params) {
    return api.get('/chamas/{chama}/expenses', { params })
  },

  get(id) {
    return api.get(`/chamas/{chama}/expenses/${id}`)
  },

  create(data) {
    return api.post('/chamas/{chama}/expenses', data)
  },

  update(id, data) {
    return api.put(`/chamas/{chama}/expenses/${id}`, data)
  },

  approve(id) {
    return api.post(`/chamas/{chama}/expenses/${id}/approve`)
  },

  reject(id, data) {
    return api.post(`/chamas/{chama}/expenses/${id}/reject`, data)
  },

  delete(id) {
    return api.delete(`/chamas/{chama}/expenses/${id}`)
  },

  getCategories() {
    return api.get('/chamas/{chama}/expenses/categories')
  }
}

export const pettyCashApi = {
  getAccounts(params) {
    return api.get('/chamas/{chama}/petty-cash/accounts', { params })
  },

  getAccount(id) {
    return api.get(`/chamas/{chama}/petty-cash/accounts/${id}`)
  },

  createAccount(data) {
    return api.post('/chamas/{chama}/petty-cash/accounts', data)
  },

  getClaims(params) {
    return api.get('/chamas/{chama}/petty-cash/claims', { params })
  },

  createClaim(data) {
    return api.post('/chamas/{chama}/petty-cash/claims', data)
  },

  approveClaim(id) {
    return api.post(`/chamas/{chama}/petty-cash/claims/${id}/approve`)
  },

  rejectClaim(id, data) {
    return api.post(`/chamas/{chama}/petty-cash/claims/${id}/reject`, data)
  },

  reconcile(data) {
    return api.post('/chamas/{chama}/petty-cash/reconcile', data)
  }
}

export const exitManagementApi = {
  getRequests(params) {
    return api.get('/chamas/{chama}/exit-requests', { params })
  },

  getRequest(id) {
    return api.get(`/chamas/{chama}/exit-requests/${id}`)
  },

  submitRequest(data) {
    return api.post('/chamas/{chama}/exit-requests', data)
  },

  approveRequest(id) {
    return api.post(`/chamas/{chama}/exit-requests/${id}/approve`)
  },

  rejectRequest(id, data) {
    return api.post(`/chamas/{chama}/exit-requests/${id}/reject`, data)
  },

  processWithdrawal(id) {
    return api.post(`/chamas/{chama}/exit-requests/${id}/process`)
  },

  getNominations(params) {
    return api.get('/chamas/{chama}/nominations', { params })
  },

  createNomination(data) {
    return api.post('/chamas/{chama}/nominations', data)
  },

  acceptNomination(id) {
    return api.post(`/chamas/{chama}/nominations/${id}/accept`)
  },

  declineNomination(id) {
    return api.post(`/chamas/{chama}/nominations/${id}/decline`)
  }
}

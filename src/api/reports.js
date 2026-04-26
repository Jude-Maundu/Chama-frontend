import api from './axios'

export const reportApi = {
  getFinancial(params) {
    return api.get('/reports/financial', { params })
  },
  
  getContributions(params) {
    return api.get('/reports/contributions', { params })
  },
  
  getLoans(params) {
    return api.get('/reports/loans', { params })
  },
  
  getMemberStatement(id, params) {
    return api.get(`/reports/member-statement/${id}`, { params })
  },
  
  getBalanceSheet(params) {
    return api.get('/reports/balance-sheet', { params })
  },
  
  getCashflow(params) {
    return api.get('/reports/cashflow', { params })
  },
  
  getAudit(params) {
    return api.get('/reports/audit', { params })
  },
  
  export(type, format, params) {
    return api.get(`/reports/export/${type}/${format}`, { 
      params,
      responseType: 'blob'
    })
  }
}

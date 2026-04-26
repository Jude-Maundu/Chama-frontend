import api from './axios'

export const communityApi = {
  getMarketplace: (chamaId) => api.get(`/chamas/${chamaId}/marketplace`),
  storeMarketplaceItem: (chamaId, data) => api.post(`/chamas/${chamaId}/marketplace`, data),
  
  getInsurance: (chamaId) => api.get(`/chamas/${chamaId}/insurance`),
  storeInsuranceProduct: (chamaId, data) => api.post(`/chamas/${chamaId}/insurance`, data),
  
  getCharity: (chamaId) => api.get(`/chamas/${chamaId}/charity`),
  storeCharityModule: (chamaId, data) => api.post(`/chamas/${chamaId}/charity`, data),
  
  getJobs: (chamaId) => api.get(`/chamas/${chamaId}/jobs`),
  storeJobPosting: (chamaId, data) => api.post(`/chamas/${chamaId}/jobs`, data),
  
  getBusinessShowcases: (chamaId) => api.get(`/chamas/${chamaId}/business-showcase`),
  storeBusinessShowcase: (chamaId, data) => api.post(`/chamas/${chamaId}/business-showcase`, data),
  
  getEducationalContent: () => api.get('/educational-content'),
  storeEducationalContent: (data) => api.post('/educational-content', data)
}

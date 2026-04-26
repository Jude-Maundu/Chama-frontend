import api from './axios'

export const memberApi = {
  // Get all members
  getAll(params) {
    return api.get('/members', { params })
  },
  
  // Get single member
  get(id) {
    return api.get(`/members/${id}`)
  },
  
  // Create member
  create(data) {
    return api.post('/members', data)
  },
  
  // Update member
  update(id, data) {
    return api.put(`/members/${id}`, data)
  },
  
  // Delete member
  delete(id) {
    return api.delete(`/members/${id}`)
  },
  
  // Get member statement
  getStatement(id, params) {
    return api.get(`/members/${id}/statement`, { params })
  },
  
  // Activate member
  activate(id) {
    return api.post(`/members/${id}/activate`)
  },
  
  // Deactivate member
  deactivate(id) {
    return api.post(`/members/${id}/deactivate`)
  },
  
  // Approve member
  approve(id) {
    return api.post(`/members/${id}/approve`)
  }
}

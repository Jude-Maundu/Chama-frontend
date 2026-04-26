import api from './axios'

export const meetingApi = {
  getAll() {
    return api.get('/meetings')
  },
  
  get(id) {
    return api.get(`/meetings/${id}`)
  },
  
  create(data) {
    return api.post('/meetings', data)
  },
  
  update(id, data) {
    return api.put(`/meetings/${id}`, data)
  },
  
  delete(id) {
    return api.delete(`/meetings/${id}`)
  },
  
  markAttendance(meetingId, data) {
    return api.post(`/meetings/${meetingId}/attendance`, data)
  },
  
  uploadMinutes(meetingId, file) {
    const formData = new FormData()
    formData.append('minutes', file)
    return api.post(`/meetings/${meetingId}/minutes`, formData)
  },
  
  vote(meetingId, data) {
    return api.post(`/meetings/${meetingId}/vote`, data)
  }
}

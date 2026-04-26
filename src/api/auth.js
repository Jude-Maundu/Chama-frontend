import api from './axios'

export const authApi = {
  login(payload) {
    return api.post('/auth/login', payload)
  },

  register(payload) {
    return api.post('/auth/register', payload)
  },

  logout() {
    return api.post('/auth/logout')
  },

  fetchUser() {
    return api.get('/user')
  }
}

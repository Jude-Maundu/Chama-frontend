import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'https://chama-backend-laravel-master-dl6jst.free.laravel.cloud/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const defaultMessage = 'An error occurred while communicating with the server.'
    const responseData = error.response?.data
    const message = responseData?.message || defaultMessage

    // Attach a normalized error message to the thrown error
    error.userMessage = message
    return Promise.reject(error)
  }
)

export default api

<template>
  <div class="forgot-wrapper">
    <div class="forgot-card glass-card">
      <div class="forgot-header">
        <div class="logo">
          <div class="logo-icon">💰</div>
          <span class="logo-text">Chama<span>System</span></span>
        </div>
        <h2>Forgot Password?</h2>
        <p>No worries! Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <form @submit.prevent="handleForgotPassword">
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-icon-wrapper">
            <i class="bi bi-envelope"></i>
            <input 
              type="email" 
              v-model="email" 
              placeholder="Enter your registered email address"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn-reset" :disabled="loading">
          <i v-if="loading" class="bi bi-spinner bi-spin me-2"></i>
          <i v-else class="bi bi-send me-2"></i>
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <div class="back-link">
          <router-link to="/login">
            <i class="bi bi-arrow-left me-2"></i>Back to Login
          </router-link>
        </div>
      </form>

      <div v-if="message" class="alert" :class="messageType">
        <i :class="messageType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'" class="me-2"></i>
        {{ message }}
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'

const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('')

const handleForgotPassword = async () => {
  loading.value = true
  message.value = ''
  try {
    const response = await api.post('/auth/forgot-password', { email: email.value })
    message.value = 'Password reset link sent to your email! Please check your inbox.'
    messageType.value = 'success'
    email.value = ''
  } catch (error) {
    message.value = error.response?.data?.message || 'Failed to send reset link. Please try again.'
    messageType.value = 'error'
  } finally {
    loading.value = false
    
    // Auto hide message after 5 seconds
    setTimeout(() => {
      if (messageType.value === 'success') {
        message.value = ''
      }
    }, 5000)
  }
}
</script>

<style scoped>
.forgot-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a2b0e 0%, #1a4a1f 50%, #2E7D32 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Floating Shapes Animation */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation-delay: 5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  border: 1px solid rgba(46, 125, 50, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.forgot-card {
  width: 100%;
  max-width: 480px;
  padding: 48px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.forgot-card:hover {
  transform: translateY(-4px);
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #FFD700, #FFA000);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a1a2e, #2E7D32);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text span {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Header */
.forgot-header {
  text-align: center;
  margin-bottom: 32px;
}

.forgot-header h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.forgot-header p {
  color: #4a5568;
  font-size: 15px;
  line-height: 1.5;
}

/* Form Styles */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 14px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-wrapper i:first-child {
  position: absolute;
  left: 16px;
  color: #2E7D32;
  font-size: 18px;
  z-index: 1;
}

.input-icon-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: white;
}

.input-icon-wrapper input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

/* Button */
.btn-reset {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.btn-reset::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-reset:hover::before {
  left: 100%;
}

.btn-reset:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(46, 125, 50, 0.3);
}

.btn-reset:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Back Link */
.back-link {
  margin-top: 24px;
  text-align: center;
}

.back-link a {
  color: #2E7D32;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s;
}

.back-link a:hover {
  color: #1B5E20;
  transform: translateX(-4px);
}

/* Alert Messages */
.alert {
  margin-top: 24px;
  padding: 14px 18px;
  border-radius: 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert.success {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid rgba(21, 87, 36, 0.2);
}

.alert.error {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  border: 1px solid rgba(114, 28, 36, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .forgot-card {
    padding: 32px 24px;
  }
  
  .logo-text {
    font-size: 24px;
  }
  
  .forgot-header h2 {
    font-size: 28px;
  }
  
  .forgot-header p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .forgot-card {
    padding: 28px 20px;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .logo-text {
    font-size: 22px;
  }
  
  .forgot-header h2 {
    font-size: 24px;
  }
}
</style>
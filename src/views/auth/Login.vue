<template>
  <div class="login-wrapper">
    <div class="login-container glass-card">
      <div class="login-left">
        <div class="brand-content">
          <div class="logo">
            <div class="logo-icon">💰</div>
            <span class="logo-text">Chama<span>System</span></span>
          </div>
          <h2>Welcome Back!</h2>
          <p>Sign in to manage your Chama, track contributions, and access loans.</p>
          
          <div class="stats-list">
            <div class="stat-item">
              <div class="stat-number">10K+</div>
              <div class="stat-label">Active Members</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">KES 500M+</div>
              <div class="stat-label">Total Savings</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">5K+</div>
              <div class="stat-label">Chama Groups</div>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="form-container">
          <div class="form-header">
            <h3>Sign In</h3>
            <p>Enter your credentials to access your account</p>
          </div>

          <div v-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="form-label">Email or Phone</label>
              <div class="input-icon-wrapper">
                <i class="bi bi-envelope"></i>
                <input type="text" v-model="form.login" placeholder="e.g., admin@chama.com or 254712345678" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-icon-wrapper">
                <i class="bi bi-lock"></i>
                <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="Enter your password" required>
                <i class="bi bi-eye-slash password-toggle" @click="showPassword = !showPassword"></i>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="rememberMe">
                <span>Remember me</span>
              </label>
              <router-link to="/forgot-password" class="forgot-link">Forgot Password?</router-link>
            </div>

            <button type="submit" class="btn-login" :disabled="loading">
              <i v-if="loading" class="bi bi-spinner bi-spin me-2"></i>
              <i v-else class="bi bi-box-arrow-in-right me-2"></i>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>

            <div class="demo-credentials">
              <p><i class="bi bi-info-circle"></i> Demo Credentials</p>
              <div class="demo-buttons">
                <button type="button" class="demo-btn" @click="fillAdmin">
                  <i class="bi bi-shield-lock"></i> Admin
                </button>
                <button type="button" class="demo-btn" @click="fillMember">
                  <i class="bi bi-person"></i> Member
                </button>
              </div>
            </div>

            <div class="login-footer">
              Don't have an account? <router-link to="/register">Create an account</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'

const router = useRouter()
const form = ref({ login: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const response = await authApi.login({
      login: form.value.login,
      password: form.value.password
    })

    const { token, user, requires_2fa } = response.data

    if (requires_2fa) {
      error.value = 'Two-factor authentication required. Please verify your account.'
      return
    }

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    if (rememberMe.value) {
      localStorage.setItem('remember_token', token)
    }
    
    // Redirect based on role
    const roles = user.roles || []
    if (roles.includes('super-admin')) {
      router.push('/admin/dashboard')
    } else if (roles.includes('chama-admin')) {
      router.push('/chama-admin/dashboard')
    } else {
      router.push('/app/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

const fillAdmin = () => {
  form.value.login = 'admin@chama.com'
  form.value.password = 'password'
}

const fillMember = () => {
  form.value.login = 'member@chama.com'
  form.value.password = 'password'
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a2b0e 0%, #1a4a1f 50%, #2E7D32 100%);
  padding: 20px;
}

.login-container {
  display: flex;
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Left Side */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="rgba(255,255,255,0.05)" d="M0 0h200v200H0z"/><circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/><circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/></svg>');
  background-size: cover;
  opacity: 0.3;
}

.brand-content {
  position: relative;
  z-index: 1;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.logo-icon {
  width: 45px;
  height: 45px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.logo-text span {
  color: #FFD700;
}

.brand-content h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
}

.brand-content p {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 48px;
  line-height: 1.6;
}

.stats-list {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 40px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

/* Right Side */
.login-right {
  flex: 1;
  padding: 48px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  max-width: 400px;
  width: 100%;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h3 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.form-header p {
  color: #666;
  font-size: 14px;
}

/* Form Elements */
.form-group {
  margin-bottom: 24px;
}

.form-label {
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
  left: 14px;
  color: #2E7D32;
  z-index: 1;
}

.input-icon-wrapper input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
}

.input-icon-wrapper input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.password-toggle {
  position: absolute;
  right: 14px;
  cursor: pointer;
  color: #999;
  z-index: 1;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2E7D32;
}

.forgot-link {
  color: #2E7D32;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* Alert */
.alert {
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-size: 13px;
}

.alert-danger {
  background: #FFEBEE;
  color: #E53935;
  border-left: 3px solid #E53935;
}

/* Button */
.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Demo Credentials */
.demo-credentials {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.demo-credentials p {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.demo-credentials p i {
  margin-right: 4px;
}

.demo-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.demo-btn {
  padding: 8px 20px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.demo-btn:hover {
  background: #2E7D32;
  color: white;
  border-color: #2E7D32;
}

/* Footer */
.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #2E7D32;
  text-decoration: none;
  font-weight: 600;
}

.login-footer a:hover {
  text-decoration: underline;
}

/* Glass Card Effect */
.glass-card {
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Responsive */
@media (max-width: 968px) {
  .login-container {
    flex-direction: column;
    max-width: 550px;
  }
  
  .login-left {
    padding: 32px;
  }
  
  .login-right {
    padding: 32px;
  }
  
  .brand-content h2 {
    font-size: 28px;
  }
  
  .stats-list {
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .login-left {
    display: none;
  }
  
  .login-right {
    padding: 24px;
  }
  
  .form-header h3 {
    font-size: 24px;
  }
  
  .demo-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .demo-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
<template>
  <div class="register-wrapper">
    <div class="register-container glass-card">
      <div class="register-left">
        <div class="brand-content">
          <div class="logo">
            <div class="logo-icon">💰</div>
            <span class="logo-text">Chama<span>System</span></span>
          </div>
          <h2>Join Our Community</h2>
          <p>Start your journey towards financial freedom with like-minded individuals.</p>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon"><i class="bi bi-check-lg"></i></div>
              <span>Create or join a Chama</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><i class="bi bi-check-lg"></i></div>
              <span>Save together as a group</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><i class="bi bi-check-lg"></i></div>
              <span>Access instant loans</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><i class="bi bi-check-lg"></i></div>
              <span>Earn dividends together</span>
            </div>
          </div>
        </div>
      </div>

      <div class="register-right">
        <div class="form-container">
          <div class="form-header">
            <h3>Create Account</h3>
            <p>Fill in your details to get started</p>
          </div>

          <div v-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
          </div>

          <form @submit.prevent="handleRegister">
            <!-- Personal Information -->
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <div class="input-icon-wrapper">
                <i class="bi bi-person"></i>
                <input type="text" v-model="form.name" placeholder="Enter your full name" required>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-envelope"></i>
                    <input type="email" v-model="form.email" placeholder="you@example.com" required>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-phone"></i>
                    <input type="tel" v-model="form.phone" placeholder="254712345678" required>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">National ID *</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-card-text"></i>
                    <input type="text" v-model="form.national_id" placeholder="Enter National ID" required>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Gender</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-gender-ambiguous"></i>
                    <select v-model="form.gender" class="form-control-custom">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <div class="input-icon-wrapper">
                <i class="bi bi-calendar3"></i>
                <input type="date" v-model="form.dob">
              </div>
            </div>

            <!-- Chama Action Selection -->
            <div class="form-group">
              <label class="form-label">Chama Action *</label>
              <div class="chama-action-group">
                <label class="action-option" :class="{ active: form.chama_action === 'create' }">
                  <input type="radio" value="create" v-model="form.chama_action">
                  <i class="bi bi-plus-circle"></i>
                  <div>
                    <strong>Create a new Chama</strong>
                    <small>Start your own Chama group</small>
                  </div>
                </label>
                <label class="action-option" :class="{ active: form.chama_action === 'join' }">
                  <input type="radio" value="join" v-model="form.chama_action">
                  <i class="bi bi-person-plus"></i>
                  <div>
                    <strong>Join an existing Chama</strong>
                    <small>Use an invitation code</small>
                  </div>
                </label>
              </div>
            </div>

            <!-- Create Chama Fields -->
            <div v-if="form.chama_action === 'create'" class="chama-fields">
              <div class="form-group">
                <label class="form-label">Chama Name *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-building"></i>
                  <input type="text" v-model="form.chama_name" placeholder="e.g., Umoja Chama" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Chama Description</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-file-text"></i>
                  <textarea v-model="form.chama_description" rows="3" placeholder="Describe your Chama's mission and goals..."></textarea>
                </div>
              </div>
            </div>

            <!-- Join Chama Fields -->
            <div v-if="form.chama_action === 'join'" class="chama-fields">
              <div class="form-group">
                <label class="form-label">Join Code *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-key"></i>
                  <input type="text" v-model="form.join_code" placeholder="Enter invitation code" required>
                </div>
                <small class="text-muted">Ask your Chama admin for the join code</small>
              </div>
            </div>

            <!-- Password Fields -->
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Password *</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-lock"></i>
                    <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="Create a password" required>
                    <i class="bi bi-eye-slash password-toggle" @click="showPassword = !showPassword"></i>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Confirm Password *</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-lock"></i>
                    <input :type="showConfirm ? 'text' : 'password'" v-model="form.password_confirmation" placeholder="Confirm your password" required>
                    <i class="bi bi-eye-slash password-toggle" @click="showConfirm = !showConfirm"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="password-hint">
              <small>Password must be at least 8 characters</small>
            </div>

            <button type="submit" class="btn-register" :disabled="loading">
              <i v-if="loading" class="bi bi-spinner bi-spin me-2"></i>
              <i v-else class="bi bi-person-plus me-2"></i>
              {{ loading ? 'Creating account...' : 'Register' }}
            </button>

            <div class="register-footer">
              Already have an account? <router-link to="/login">Sign In</router-link>
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
const showPassword = ref(false)
const showConfirm = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  national_id: '',
  gender: '',
  dob: '',
  chama_action: 'create',
  chama_name: '',
  chama_description: '',
  join_code: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''
  
  // Validation
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (form.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  
  if (form.value.chama_action === 'create' && !form.value.chama_name) {
    error.value = 'Please enter a Chama name'
    return
  }
  
  if (form.value.chama_action === 'join' && !form.value.join_code) {
    error.value = 'Please enter the join code'
    return
  }

  loading.value = true

  try {
    const response = await authApi.register(form.value)

    const { token, user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    router.push('/app/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please review your input.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a2b0e 0%, #1a4a1f 50%, #2E7D32 100%);
  padding: 20px;
}

.register-container {
  display: flex;
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Left Side */
.register-left {
  flex: 1;
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.register-left::before {
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
  margin-bottom: 40px;
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
  margin-bottom: 40px;
  line-height: 1.6;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* Right Side */
.register-right {
  flex: 1;
  padding: 48px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  max-width: 450px;
  width: 100%;
}

.form-header {
  margin-bottom: 28px;
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
  margin-bottom: 20px;
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

.input-icon-wrapper input,
.input-icon-wrapper textarea,
.input-icon-wrapper select {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.input-icon-wrapper textarea {
  resize: vertical;
  padding-top: 12px;
  padding-bottom: 12px;
}

.input-icon-wrapper select {
  cursor: pointer;
  background: white;
}

.input-icon-wrapper input:focus,
.input-icon-wrapper textarea:focus,
.input-icon-wrapper select:focus {
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

/* Chama Action Group */
.chama-action-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-option input {
  display: none;
}

.action-option i {
  font-size: 28px;
  color: #999;
}

.action-option strong {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.action-option small {
  font-size: 11px;
  color: #999;
}

.action-option.active {
  border-color: #2E7D32;
  background: rgba(46, 125, 50, 0.05);
}

.action-option.active i {
  color: #2E7D32;
}

.action-option.active strong {
  color: #2E7D32;
}

/* Chama Fields */
.chama-fields {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 16px;
  margin-bottom: 20px;
}

.password-hint {
  margin-top: -12px;
  margin-bottom: 20px;
}

.password-hint small {
  color: #999;
  font-size: 11px;
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
.btn-register {
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

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Footer */
.register-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-footer a {
  color: #2E7D32;
  text-decoration: none;
  font-weight: 600;
}

.register-footer a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 968px) {
  .register-container {
    flex-direction: column;
    max-width: 550px;
  }
  
  .register-left {
    padding: 32px;
  }
  
  .register-right {
    padding: 32px;
  }
  
  .brand-content h2 {
    font-size: 28px;
  }
  
  .chama-action-group {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .register-left {
    display: none;
  }
  
  .register-right {
    padding: 24px;
  }
  
  .form-header h3 {
    font-size: 24px;
  }
}
</style>
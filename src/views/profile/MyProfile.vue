<template>
  <div class="profile-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">Manage your personal information and account settings</p>
      </div>
      <button class="btn-outline-custom" @click="refreshData">
        <i class="bi bi-arrow-repeat me-2"></i>Refresh
      </button>
    </div>

    <div class="row g-4">
      <!-- Profile Summary Card -->
      <div class="col-lg-4">
        <div class="glass-card profile-summary">
          <div class="profile-header">
            <div class="avatar-container">
              <img :src="user.photo_url" :alt="user.name" class="profile-avatar-img" v-if="user.photo_url && !user.photo_url.includes('ui-avatars')">
              <div class="profile-avatar" :style="{ background: avatarGradient }" v-else>
                {{ user.name?.charAt(0) || 'U' }}
              </div>
              <div class="avatar-edit-overlay" @click="triggerPhotoUpload">
                <i class="bi bi-camera-fill"></i>
                <input type="file" ref="fileInput" @change="handlePhotoUpload" accept="image/*" class="d-none">
              </div>
              <div v-if="uploadingPhoto" class="upload-spinner">
                <div class="spinner-border spinner-border-sm text-white" role="status"></div>
              </div>
            </div>
            <h3 class="mt-3 mb-1">{{ user.name }}</h3>
            <p class="text-muted">{{ user.role || 'Member' }}</p>
            <span :class="['status-badge', user.is_active ? 'active' : 'inactive']">
              <i :class="user.is_active ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
              {{ user.is_active ? 'Active Member' : 'Inactive' }}
            </span>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">{{ formatDate(user.created_at, 'YYYY') }}</div>
              <div class="stat-label">Member Since</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value text-success">KES {{ formatMoney(stats.total_savings) }}</div>
              <div class="stat-label">Total Savings</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value text-warning">KES {{ formatMoney(stats.total_loans) }}</div>
              <div class="stat-label">Total Loans</div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Card -->
        <div class="glass-card mt-4">
          <div class="card-header-custom">
            <div class="header-icon" style="background: linear-gradient(135deg, #1565C0, #0D47A1);">
              <i class="bi bi-bar-chart"></i>
            </div>
            <h6 class="mb-0">Quick Statistics</h6>
          </div>
          <div class="card-body-custom">
            <div class="quick-stats">
              <div class="quick-stat">
                <div class="quick-stat-label">Contributions Made</div>
                <div class="quick-stat-value">{{ stats.contributions_count || 0 }}</div>
              </div>
              <div class="quick-stat">
                <div class="quick-stat-label">Loans Taken</div>
                <div class="quick-stat-value">{{ stats.loans_count || 0 }}</div>
              </div>
              <div class="quick-stat">
                <div class="quick-stat-label">Meetings Attended</div>
                <div class="quick-stat-value">{{ stats.meetings_attended || 0 }}</div>
              </div>
              <div class="quick-stat">
                <div class="quick-stat-label">Dividends Received</div>
                <div class="quick-stat-value">{{ stats.dividends_count || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Edit Forms -->
      <div class="col-lg-8">
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon">
              <i class="bi bi-person-gear"></i>
            </div>
            <ul class="nav-tabs-custom">
              <li>
                <button class="tab-btn" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">
                  <i class="bi bi-person"></i> Personal Info
                </button>
              </li>
              <li>
                <button class="tab-btn" :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">
                  <i class="bi bi-key"></i> Change Password
                </button>
              </li>
              <li>
                <button class="tab-btn" :class="{ active: activeTab === 'bank' }" @click="activeTab = 'bank'">
                  <i class="bi bi-bank"></i> Bank Details
                </button>
              </li>
              <li>
                <button class="tab-btn" :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
                  <i class="bi bi-bell"></i> Notifications
                </button>
              </li>
            </ul>
          </div>
          
          <div class="card-body-custom">
            <!-- Personal Info Tab -->
            <form v-if="activeTab === 'info'" @submit.prevent="updateProfile">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-person"></i>
                  <input type="text" class="form-control-custom" v-model="profile.name" required>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Email Address *</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-envelope"></i>
                      <input type="email" class="form-control-custom" v-model="profile.email" required>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Phone Number *</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-phone"></i>
                      <input type="tel" class="form-control-custom" v-model="profile.phone" required>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">National ID</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-card-text"></i>
                      <input type="text" class="form-control-custom" v-model="profile.national_id">
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Gender</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-gender-ambiguous"></i>
                      <select class="form-control-custom" v-model="profile.gender">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Occupation</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-briefcase"></i>
                  <input type="text" class="form-control-custom" v-model="profile.occupation">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Address</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-geo-alt"></i>
                  <textarea class="form-control-custom" v-model="profile.address" rows="2" placeholder="Your physical address"></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary-custom" @click="resetProfileForm">Reset</button>
                <button type="submit" class="btn-primary-custom" :disabled="updating">
                  <i v-if="updating" class="bi bi-spinner bi-spin me-2"></i>
                  <i v-else class="bi bi-check-lg me-2"></i>
                  {{ updating ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>

            <!-- Change Password Tab -->
            <form v-if="activeTab === 'password'" @submit.prevent="changePassword">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-lock"></i>
                  <input :type="showCurrentPassword ? 'text' : 'password'" class="form-control-custom" v-model="passwordForm.current_password" required>
                  <i class="bi bi-eye-slash password-toggle" @click="showCurrentPassword = !showCurrentPassword"></i>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">New Password</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-key"></i>
                  <input :type="showNewPassword ? 'text' : 'password'" class="form-control-custom" v-model="passwordForm.password" required>
                  <i class="bi bi-eye-slash password-toggle" @click="showNewPassword = !showNewPassword"></i>
                </div>
                <div class="password-strength" v-if="passwordForm.password">
                  <div class="strength-bar" :class="passwordStrength"></div>
                  <small>{{ getPasswordStrengthText() }}</small>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-key"></i>
                  <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control-custom" v-model="passwordForm.password_confirmation" required>
                  <i class="bi bi-eye-slash password-toggle" @click="showConfirmPassword = !showConfirmPassword"></i>
                </div>
                <div v-if="passwordForm.password && passwordForm.password_confirmation" class="password-match">
                  <i :class="passwordsMatch ? 'bi bi-check-circle-fill text-success' : 'bi bi-x-circle-fill text-danger'"></i>
                  {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary-custom" @click="resetPasswordForm">Reset</button>
                <button type="submit" class="btn-primary-custom" :disabled="changingPassword">
                  <i v-if="changingPassword" class="bi bi-spinner bi-spin me-2"></i>
                  <i v-else class="bi bi-shield-check me-2"></i>
                  {{ changingPassword ? 'Changing...' : 'Change Password' }}
                </button>
              </div>
            </form>

            <!-- Bank Details Tab -->
            <form v-if="activeTab === 'bank'" @submit.prevent="updateBank">
              <div class="form-group">
                <label class="form-label">Bank Name</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-bank"></i>
                  <input type="text" class="form-control-custom" v-model="bank.bank_name" placeholder="e.g., Equity Bank, KCB, Co-op Bank">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Account Number</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-credit-card"></i>
                  <input type="text" class="form-control-custom" v-model="bank.bank_account_number" placeholder="Your bank account number">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Account Name</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-person"></i>
                  <input type="text" class="form-control-custom" v-model="bank.account_name" placeholder="Account holder name">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">M-Pesa Number</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-phone"></i>
                  <input type="tel" class="form-control-custom" v-model="bank.mpesa_number" placeholder="254XXXXXXXXX">
                </div>
                <small class="text-muted">Format: 254XXXXXXXXX (e.g., 254712345678)</small>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary-custom" @click="resetBankForm">Reset</button>
                <button type="submit" class="btn-primary-custom" :disabled="savingBank">
                  <i v-if="savingBank" class="bi bi-spinner bi-spin me-2"></i>
                  <i v-else class="bi bi-save me-2"></i>
                  {{ savingBank ? 'Saving...' : 'Save Bank Details' }}
                </button>
              </div>
            </form>

            <!-- Notifications Tab -->
            <div v-if="activeTab === 'notifications'">
              <div class="notification-settings">
                <div class="notification-group">
                  <h6>Notification Channels</h6>
                  <p class="text-muted small">Choose how you want to receive alerts</p>
                  <div class="notification-item">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="emailNotif" v-model="notifications.email_notifications">
                      <label class="form-check-label" for="emailNotif">Email Notifications</label>
                    </div>
                  </div>
                  <div class="notification-item">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="smsNotif" v-model="notifications.sms_notifications">
                      <label class="form-check-label" for="smsNotif">SMS Notifications</label>
                    </div>
                  </div>
                  <div class="notification-item">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="pushNotif" v-model="notifications.push_notifications">
                      <label class="form-check-label" for="pushNotif">In-App Notifications</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-primary-custom" @click="saveNotificationSettings" :disabled="savingNotifications">
                  <i v-if="savingNotifications" class="bi bi-spinner bi-spin me-2"></i>
                  <i v-else class="bi bi-bell-check me-2"></i>
                  {{ savingNotifications ? 'Saving...' : 'Save Preferences' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { userApi } from '@/api/user'
import api from '@/api/axios'

const activeTab = ref('info')
const updating = ref(false)
const changingPassword = ref(false)
const savingBank = ref(false)
const savingNotifications = ref(false)
const uploadingPhoto = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const fileInput = ref(null)

const user = ref({})
const stats = ref({
  total_savings: 0,
  total_loans: 0,
  contributions_count: 0,
  loans_count: 0,
  meetings_attended: 0,
  dividends_count: 0
})

const profile = ref({
  name: '',
  email: '',
  phone: '',
  national_id: '',
  gender: '',
  occupation: '',
  address: ''
})

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const bank = ref({
  bank_name: '',
  bank_account_number: '',
  account_name: '',
  mpesa_number: ''
})

const notifications = ref({
  email_notifications: true,
  sms_notifications: true,
  push_notifications: true
})

const avatarGradient = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #2E7D32, #1B5E20)',
    'linear-gradient(135deg, #1565C0, #0D47A1)',
    'linear-gradient(135deg, #FF8F00, #E65100)',
    'linear-gradient(135deg, #C62828, #8E0000)',
    'linear-gradient(135deg, #6A1B9A, #4A148C)'
  ]
  const index = (user.value.name?.charCodeAt(0) || 0) % gradients.length
  return gradients[index]
})

const passwordsMatch = computed(() => {
  return passwordForm.value.password && passwordForm.value.password_confirmation && 
         passwordForm.value.password === passwordForm.value.password_confirmation
})

const passwordStrength = computed(() => {
  const pwd = passwordForm.value.password
  if (!pwd) return 'weak'
  if (pwd.length < 6) return 'weak'
  if (pwd.length < 10) return 'medium'
  return 'strong'
})

const getPasswordStrengthText = () => {
  const strength = passwordStrength.value
  if (strength === 'weak') return 'Weak password'
  if (strength === 'medium') return 'Medium strength'
  return 'Strong password'
}

const loadProfile = async () => {
  try {
    const response = await userApi.getProfile()
    user.value = response.data
    
    profile.value = {
      name: user.value.name,
      email: user.value.email,
      phone: user.value.phone,
      national_id: user.value.profile?.national_id || '',
      gender: user.value.profile?.gender || '',
      occupation: user.value.profile?.occupation || '',
      address: user.value.profile?.address || ''
    }
    
    bank.value = {
      bank_name: user.value.profile?.bank_name || '',
      bank_account_number: user.value.profile?.bank_account_number || '',
      account_name: user.value.profile?.account_name || '',
      mpesa_number: user.value.profile?.mpesa_number || ''
    }
    
    // Fetch notification preferences
    try {
      const notifRes = await api.get('/notifications/preferences')
      notifications.value = notifRes.data.data
    } catch (e) {
      console.warn('Failed to load notification preferences')
    }
    
    const statsResponse = await userApi.getStats()
    stats.value = statsResponse.data
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}

const updateProfile = async () => {
  updating.value = true
  try {
    await userApi.updateProfile(profile.value)
    Swal.fire('Success', 'Profile updated successfully', 'success')
    loadProfile()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to update profile', 'error')
  } finally {
    updating.value = false
  }
}

const triggerPhotoUpload = () => {
  fileInput.value.click()
}

const handlePhotoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('photo', file)

  uploadingPhoto.value = true
  try {
    const response = await api.post('/profile/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.success) {
      user.value.photo_url = response.data.photo_url
      Swal.fire('Success', 'Profile photo updated', 'success')
      loadProfile()
    }
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Upload failed', 'error')
  } finally {
    uploadingPhoto.value = false
    event.target.value = ''
  }
}

const changePassword = async () => {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    Swal.fire('Error', 'Passwords do not match', 'error')
    return
  }
  
  if (passwordForm.value.password.length < 8) {
    Swal.fire('Error', 'Password must be at least 8 characters', 'error')
    return
  }
  
  changingPassword.value = true
  try {
    await userApi.changePassword(passwordForm.value)
    Swal.fire('Success', 'Password changed successfully', 'success')
    resetPasswordForm()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to change password', 'error')
  } finally {
    changingPassword.value = false
  }
}

const updateBank = async () => {
  savingBank.value = true
  try {
    await userApi.updateBank(bank.value)
    Swal.fire('Success', 'Bank details saved successfully', 'success')
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to save bank details', 'error')
  } finally {
    savingBank.value = false
  }
}

const saveNotificationSettings = async () => {
  savingNotifications.value = true
  try {
    await api.post('/notifications/preferences', notifications.value)
    Swal.fire('Success', 'Notification preferences saved', 'success')
  } catch (error) {
    Swal.fire('Error', 'Failed to save preferences', 'error')
  } finally {
    savingNotifications.value = false
  }
}

const resetProfileForm = () => {
  loadProfile()
}

const resetPasswordForm = () => {
  passwordForm.value = {
    current_password: '',
    password: '',
    password_confirmation: ''
  }
}

const resetBankForm = () => {
  loadProfile()
}

const refreshData = () => {
  loadProfile()
  Swal.fire('Refreshed', 'Profile data updated', 'success')
}

const formatDate = (date, format = 'YYYY') => {
  if (!date) return 'N/A'
  return new Date(date).getFullYear()
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #1a1a2e, #2E7D32);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: #666;
  margin-bottom: 0;
}

/* Avatar Styles */
.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.profile-avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  font-weight: 600;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.avatar-edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: #2E7D32;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  border: 3px solid white;
  transition: all 0.2s;
}

.avatar-edit-overlay:hover {
  transform: scale(1.1);
  background: #1B5E20;
}

.upload-spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Glass Card */
.glass-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Profile Summary */
.profile-summary {
  text-align: center;
}

.profile-header {
  padding: 32px 24px 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  background: #e0e0e0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.active {
  background: #E8F5E9;
  color: #2E7D32;
}

.status-badge.inactive {
  background: #FFEBEE;
  color: #E53935;
}

/* Card Header */
.card-header-custom {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.card-body-custom {
  padding: 24px;
}

/* Custom Tabs */
.nav-tabs-custom {
  display: flex;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.tab-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn:hover {
  background: #f0f0f0;
}

.tab-btn.active {
  background: #2E7D32;
  color: white;
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

.form-control-custom {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control-custom:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

textarea.form-control-custom {
  resize: vertical;
  padding-top: 12px;
  padding-bottom: 12px;
}

select.form-control-custom {
  cursor: pointer;
}

.password-toggle {
  position: absolute;
  right: 14px;
  cursor: pointer;
  color: #999;
}

/* Password Strength */
.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  margin-bottom: 4px;
  transition: all 0.3s;
}

.strength-bar.weak {
  width: 33%;
  background: #E53935;
}

.strength-bar.medium {
  width: 66%;
  background: #FF8F00;
}

.strength-bar.strong {
  width: 100%;
  background: #2E7D32;
}

.password-strength small {
  font-size: 11px;
  color: #999;
}

.password-match {
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.quick-stat {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
}

.quick-stat-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.quick-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

/* Notification Settings */
.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.notification-group h6 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.notification-item {
  margin-bottom: 12px;
}

.form-check-input:checked {
  background-color: #2E7D32;
  border-color: #2E7D32;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* Buttons */
.btn-primary-custom {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.btn-primary-custom:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
}

.btn-primary-custom:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary-custom {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary-custom:hover {
  background: #e0e0e0;
}

.btn-outline-custom {
  background: transparent;
  border: 2px solid #2E7D32;
  color: #2E7D32;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-outline-custom:hover {
  background: #2E7D32;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .profile-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .stat-divider {
    display: none;
  }
  
  .card-header-custom {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .nav-tabs-custom {
    width: 100%;
  }
  
  .tab-btn {
    flex: 1;
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary-custom,
  .btn-secondary-custom {
    width: 100%;
    justify-content: center;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">System Settings</h1>
        <p class="page-subtitle">Configure your Chama system preferences</p>
      </div>
      <div class="header-badge">
        <i class="bi bi-shield-check"></i>
        <span>Admin Access Only</span>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-3">
        <div class="glass-card settings-sidebar">
          <div class="sidebar-header">
            <i class="bi bi-sliders2"></i>
            <span>Settings Categories</span>
          </div>
          <div class="sidebar-menu">
            <button v-for="tab in tabs" :key="tab.id" 
                    :class="['settings-tab', { active: activeTab === tab.id }]"
                    @click="activeTab = tab.id">
              <i :class="tab.icon"></i>
              <span>{{ tab.name }}</span>
              <i v-if="hasChanges(tab.id)" class="bi bi-circle-fill changed-indicator"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="col-lg-9">
        <div class="glass-card settings-content">
          <div class="card-header-custom">
            <div class="header-icon">
              <i :class="currentTab.icon"></i>
            </div>
            <h5 class="mb-0">{{ currentTab.name }} Settings</h5>
            <div class="ms-auto">
              <span class="status-badge" :class="{ 'has-changes': hasChanges(activeTab) }">
                <i v-if="hasChanges(activeTab)" class="bi bi-pencil-square"></i>
                <i v-else class="bi bi-check-circle"></i>
                {{ hasChanges(activeTab) ? 'Unsaved Changes' : 'Saved' }}
              </span>
            </div>
          </div>
          
          <div class="card-body-custom">
            <form @submit.prevent="saveSettings">
              <!-- General Settings -->
              <div v-if="activeTab === 'general'" class="settings-form">
                <div class="form-group">
                  <label class="form-label">Chama Name</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-building"></i>
                    <input type="text" class="form-control-custom" v-model="settings.chama_name" placeholder="Enter Chama name">
                  </div>
                  <small class="text-muted">This name will appear throughout the system</small>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Chama Email</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-envelope"></i>
                        <input type="email" class="form-control-custom" v-model="settings.chama_email" placeholder="contact@chama.com">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Chama Phone</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-phone"></i>
                        <input type="tel" class="form-control-custom" v-model="settings.chama_phone" placeholder="254700000000">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Currency</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-currency-dollar"></i>
                        <select class="form-control-custom" v-model="settings.currency">
                          <option value="KES">Kenyan Shilling (KES)</option>
                          <option value="UGX">Ugandan Shilling (UGX)</option>
                          <option value="TZS">Tanzanian Shilling (TZS)</option>
                          <option value="USD">US Dollar (USD)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Fiscal Year Start</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-calendar3"></i>
                        <select class="form-control-custom" v-model="settings.fiscal_year_start">
                          <option value="January">January</option>
                          <option value="February">February</option>
                          <option value="March">March</option>
                          <option value="April">April</option>
                          <option value="May">May</option>
                          <option value="June">June</option>
                          <option value="July">July</option>
                          <option value="August">August</option>
                          <option value="September">September</option>
                          <option value="October">October</option>
                          <option value="November">November</option>
                          <option value="December">December</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Chama Address</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-geo-alt"></i>
                    <textarea class="form-control-custom" v-model="settings.chama_address" rows="2" placeholder="Physical address"></textarea>
                  </div>
                </div>
              </div>

              <!-- Contribution Settings -->
              <div v-if="activeTab === 'contributions'" class="settings-form">
                <div class="form-group">
                  <label class="form-label">Monthly Contribution (KES)</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-cash-stack"></i>
                    <input type="number" class="form-control-custom" v-model="settings.monthly_contribution">
                  </div>
                  <small class="text-muted">Default contribution amount for all members</small>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Late Penalty (%)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-percent"></i>
                        <input type="number" class="form-control-custom" v-model="settings.late_penalty_percentage">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Penalty Grace Days</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-calendar"></i>
                        <input type="number" class="form-control-custom" v-model="settings.penalty_grace_days">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Contribution Due Day</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-calendar-check"></i>
                    <select class="form-control-custom" v-model="settings.contribution_due_day">
                      <option v-for="day in 28" :key="day" :value="day">{{ day }}th of the month</option>
                    </select>
                  </div>
                </div>

                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="allowPartial" v-model="settings.allow_partial_payments">
                  <label class="form-check-label" for="allowPartial">Allow Partial Payments</label>
                </div>
              </div>

              <!-- Loan Settings -->
              <div v-if="activeTab === 'loans'" class="settings-form">
                <div class="form-group">
                  <label class="form-label">Default Interest Rate (%)</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-percent"></i>
                    <input type="number" step="0.5" class="form-control-custom" v-model="settings.loan_interest_rate">
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Maximum Loan Ratio (x savings)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-calculator"></i>
                        <input type="number" step="0.5" class="form-control-custom" v-model="settings.max_loan_ratio">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Minimum Membership (Months)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-clock"></i>
                        <input type="number" class="form-control-custom" v-model="settings.min_membership_months">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Minimum Loan Amount (KES)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-arrow-down"></i>
                        <input type="number" class="form-control-custom" v-model="settings.min_loan_amount">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Maximum Loan Amount (KES)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-arrow-up"></i>
                        <input type="number" class="form-control-custom" v-model="settings.max_loan_amount">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Loan Processing Fee (KES)</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-receipt"></i>
                    <input type="number" class="form-control-custom" v-model="settings.loan_processing_fee">
                  </div>
                </div>
              </div>

              <!-- M-Pesa Settings -->
              <div v-if="activeTab === 'mpesa'" class="settings-form">
                <div class="alert-info">
                  <i class="bi bi-shield-lock"></i>
                  <span>M-Pesa API credentials are sensitive. Keep them secure!</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Paybill Shortcode</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-upc-scan"></i>
                    <input type="text" class="form-control-custom" v-model="settings.mpesa_shortcode" placeholder="174379">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Consumer Key</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-key"></i>
                    <input :type="showConsumerKey ? 'text' : 'password'" class="form-control-custom" v-model="settings.mpesa_consumer_key">
                    <i class="bi bi-eye-slash password-toggle" @click="showConsumerKey = !showConsumerKey"></i>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Consumer Secret</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-shield-lock"></i>
                    <input :type="showConsumerSecret ? 'text' : 'password'" class="form-control-custom" v-model="settings.mpesa_consumer_secret">
                    <i class="bi bi-eye-slash password-toggle" @click="showConsumerSecret = !showConsumerSecret"></i>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Passkey</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-lock"></i>
                        <input :type="showPasskey ? 'text' : 'password'" class="form-control-custom" v-model="settings.mpesa_passkey">
                        <i class="bi bi-eye-slash password-toggle" @click="showPasskey = !showPasskey"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Environment</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-globe"></i>
                        <select class="form-control-custom" v-model="settings.mpesa_environment">
                          <option value="sandbox">Sandbox (Testing)</option>
                          <option value="production">Production (Live)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="test-credentials" @click="testMpesaCredentials">
                  <i class="bi bi-check-circle"></i>
                  <span>Test M-Pesa Connection</span>
                </div>
              </div>

              <!-- Notification Settings -->
              <div v-if="activeTab === 'notifications'" class="settings-form">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Contribution Reminder (Days before)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-bell"></i>
                        <input type="number" class="form-control-custom" v-model="settings.contribution_reminder_days">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Meeting Reminder (Hours before)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-calendar-bell"></i>
                        <input type="number" class="form-control-custom" v-model="settings.meeting_reminder_hours">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Loan Repayment Reminder (Days before)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-bank"></i>
                        <input type="number" class="form-control-custom" v-model="settings.loan_repayment_reminder_days">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Dividend Notification (Days before)</label>
                      <div class="input-icon-wrapper">
                        <i class="bi bi-gift"></i>
                        <input type="number" class="form-control-custom" v-model="settings.dividend_notification_days">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="notification-toggles">
                  <h6>Notification Channels</h6>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="smsEnabled" v-model="settings.sms_enabled">
                    <label class="form-check-label" for="smsEnabled">Enable SMS Notifications</label>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="emailEnabled" v-model="settings.email_enabled">
                    <label class="form-check-label" for="emailEnabled">Enable Email Notifications</label>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="pushEnabled" v-model="settings.push_enabled">
                    <label class="form-check-label" for="pushEnabled">Enable Push Notifications</label>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" class="btn-secondary-custom" @click="resetSettings">
                  <i class="bi bi-arrow-repeat me-2"></i>Reset to Saved
                </button>
                <button type="submit" class="btn-primary-custom" :disabled="saving">
                  <i v-if="saving" class="bi bi-spinner bi-spin me-2"></i>
                  <i v-else class="bi bi-check-lg me-2"></i>
                  {{ saving ? 'Saving...' : 'Save All Settings' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div class="toast-container" v-if="showToast">
      <div class="toast-message success">
        <i class="bi bi-check-circle-fill"></i>
        <span>Settings saved successfully!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { settingApi } from '@/api/settings'
import Swal from 'sweetalert2'

const activeTab = ref('general')
const saving = ref(false)
const showToast = ref(false)
const showConsumerKey = ref(false)
const showConsumerSecret = ref(false)
const showPasskey = ref(false)

const originalSettings = ref({})
const settings = ref({
  chama_name: 'My Chama',
  chama_email: '',
  chama_phone: '',
  chama_address: '',
  currency: 'KES',
  fiscal_year_start: 'January',
  monthly_contribution: 5000,
  late_penalty_percentage: 5,
  penalty_grace_days: 5,
  contribution_due_day: 5,
  allow_partial_payments: false,
  loan_interest_rate: 10,
  max_loan_ratio: 3,
  min_membership_months: 3,
  min_loan_amount: 1000,
  max_loan_amount: 500000,
  loan_processing_fee: 500,
  mpesa_shortcode: '',
  mpesa_consumer_key: '',
  mpesa_consumer_secret: '',
  mpesa_passkey: '',
  mpesa_environment: 'sandbox',
  contribution_reminder_days: 3,
  meeting_reminder_hours: 24,
  loan_repayment_reminder_days: 2,
  dividend_notification_days: 7,
  sms_enabled: true,
  email_enabled: true,
  push_enabled: false
})

const tabs = [
  { id: 'general', name: 'General', icon: 'bi bi-gear' },
  { id: 'contributions', name: 'Contributions', icon: 'bi bi-cash-stack' },
  { id: 'loans', name: 'Loans', icon: 'bi bi-bank' },
  { id: 'mpesa', name: 'M-Pesa', icon: 'bi bi-phone' },
  { id: 'notifications', name: 'Notifications', icon: 'bi bi-bell' }
]

const currentTab = computed(() => tabs.find(t => t.id === activeTab.value))

const hasChanges = (tabId) => {
  // Check if settings have changed for the specific tab
  const tabSettings = {
    general: ['chama_name', 'chama_email', 'chama_phone', 'chama_address', 'currency', 'fiscal_year_start'],
    contributions: ['monthly_contribution', 'late_penalty_percentage', 'penalty_grace_days', 'contribution_due_day', 'allow_partial_payments'],
    loans: ['loan_interest_rate', 'max_loan_ratio', 'min_membership_months', 'min_loan_amount', 'max_loan_amount', 'loan_processing_fee'],
    mpesa: ['mpesa_shortcode', 'mpesa_consumer_key', 'mpesa_consumer_secret', 'mpesa_passkey', 'mpesa_environment'],
    notifications: ['contribution_reminder_days', 'meeting_reminder_hours', 'loan_repayment_reminder_days', 'dividend_notification_days', 'sms_enabled', 'email_enabled', 'push_enabled']
  }
  
  const fields = tabSettings[tabId] || []
  for (const field of fields) {
    if (settings.value[field] !== originalSettings.value[field]) {
      return true
    }
  }
  return false
}

const loadSettings = async () => {
  try {
    const response = await settingApi.getAll()
    const data = response.data
    Object.assign(settings.value, data)
    Object.assign(originalSettings.value, JSON.parse(JSON.stringify(data)))
  } catch (error) {
    console.error('Failed to load settings:', error)
    Swal.fire('Error', 'Failed to load settings', 'error')
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await settingApi.update(settings.value)
    Object.assign(originalSettings.value, JSON.parse(JSON.stringify(settings.value)))
    showToastMessage()
    Swal.fire('Success', 'Settings saved successfully', 'success')
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to save settings', 'error')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  Object.assign(settings.value, JSON.parse(JSON.stringify(originalSettings.value)))
  Swal.fire('Reset', 'Settings reset to last saved version', 'info')
}

const testMpesaCredentials = () => {
  Swal.fire({
    title: 'Testing M-Pesa Connection',
    text: 'This will test your M-Pesa API credentials...',
    icon: 'info',
    timer: 2000,
    showConfirmButton: false
  })
  // Implement actual M-Pesa test logic here
}

const showToastMessage = () => {
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

onMounted(() => {
  loadSettings()
})

// Watch for unsaved changes warning
window.addEventListener('beforeunload', (e) => {
  let hasUnsavedChanges = false
  for (const tab of tabs) {
    if (hasChanges(tab.id)) {
      hasUnsavedChanges = true
      break
    }
  }
  if (hasUnsavedChanges) {
    e.preventDefault()
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
  }
})
</script>

<style scoped>
.settings-page {
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

.header-badge {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
  color: #2E7D32;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Glass Card */
.glass-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  height: 100%;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Settings Sidebar */
.settings-sidebar {
  position: sticky;
  top: 20px;
}

.sidebar-header {
  padding: 20px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.sidebar-menu {
  padding: 12px;
}

.settings-tab {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  position: relative;
}

.settings-tab i:first-child {
  width: 20px;
  font-size: 18px;
}

.settings-tab span {
  flex: 1;
  text-align: left;
}

.settings-tab:hover {
  background: #f5f5f5;
}

.settings-tab.active {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
}

.changed-indicator {
  font-size: 8px;
  color: #FF8F00;
  margin-left: auto;
}

/* Settings Content */
.card-header-custom {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
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

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #f5f5f5;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-badge.has-changes {
  background: #FFF3E0;
  color: #FF8F00;
}

.card-body-custom {
  padding: 24px;
}

/* Form Elements */
.settings-form {
  max-width: 100%;
}

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

/* Alert Info */
.alert-info {
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #1565C0;
}

.alert-info i {
  font-size: 20px;
}

/* Test Credentials */
.test-credentials {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}

.test-credentials:hover {
  background: #e0e0e0;
}

/* Notification Toggles */
.notification-toggles {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.notification-toggles h6 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a2e;
}

.form-check {
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
  margin-top: 32px;
  padding-top: 24px;
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

/* Toast */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1100;
  animation: slideIn 0.3s ease;
}

.toast-message {
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-message.success {
  background: #2E7D32;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 992px) {
  .settings-page {
    padding: 16px;
  }
  
  .settings-sidebar {
    position: static;
    margin-bottom: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary-custom,
  .btn-secondary-custom {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
  
  .card-body-custom {
    padding: 20px;
  }
  
  .row {
    flex-direction: column;
  }
}
</style>

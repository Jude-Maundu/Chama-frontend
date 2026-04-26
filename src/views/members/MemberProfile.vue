<template>
  <div class="member-profile-page">
    <div class="page-header">
      <button class="btn-outline-custom" @click="$router.back()">
        <i class="bi bi-arrow-left me-2"></i>Back to Members
      </button>
      <button class="btn-primary-custom" @click="openEditModal">
        <i class="bi bi-pencil me-2"></i>Edit Profile
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <div class="row g-4">
        <!-- Profile Card -->
        <div class="col-lg-4">
          <div class="glass-card profile-card">
            <div class="profile-header">
              <div class="member-avatar-large" :style="{ background: getAvatarGradient(member.name) }">
                {{ member.name?.charAt(0) }}
              </div>
              <h3 class="mt-3 mb-1">{{ member.name }}</h3>
              <p class="text-muted">Member since {{ formatDate(member.created_at) }}</p>
              <span :class="['status-badge', member.is_active ? 'active' : 'inactive']">
                <i :class="member.is_active ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                {{ member.is_active ? 'Active Member' : 'Inactive' }}
              </span>
            </div>
            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-value">{{ stats.contributions_count || 0 }}</div>
                <div class="stat-label">Contributions</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.loans_count || 0 }}</div>
                <div class="stat-label">Loans Taken</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.meetings_attended || 0 }}</div>
                <div class="stat-label">Meetings</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Information Card -->
        <div class="col-lg-8">
          <div class="glass-card">
            <div class="card-header-custom">
              <div class="header-icon">
                <i class="bi bi-person-badge"></i>
              </div>
              <h5 class="mb-0">Personal Information</h5>
            </div>
            <div class="card-body-custom">
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">
                    <i class="bi bi-person"></i>
                    <span>Full Name</span>
                  </div>
                  <div class="info-value">{{ member.name }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">
                    <i class="bi bi-envelope"></i>
                    <span>Email Address</span>
                  </div>
                  <div class="info-value">{{ member.email }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">
                    <i class="bi bi-phone"></i>
                    <span>Phone Number</span>
                  </div>
                  <div class="info-value">{{ member.phone }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">
                    <i class="bi bi-card-text"></i>
                    <span>National ID</span>
                  </div>
                  <div class="info-value">{{ member.profile?.national_id || 'Not provided' }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">
                    <i class="bi bi-gender-ambiguous"></i>
                    <span>Gender</span>
                  </div>
                  <div class="info-value">{{ member.profile?.gender ? capitalize(member.profile.gender) : 'Not specified' }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">
                    <i class="bi bi-briefcase"></i>
                    <span>Occupation</span>
                  </div>
                  <div class="info-value">{{ member.profile?.occupation || 'Not specified' }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">
                    <i class="bi bi-calendar3"></i>
                    <span>Join Date</span>
                  </div>
                  <div class="info-value">{{ formatDate(member.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Summary Card -->
          <div class="glass-card mt-4">
            <div class="card-header-custom">
              <div class="header-icon" style="background: linear-gradient(135deg, #FF8F00, #E65100);">
                <i class="bi bi-graph-up"></i>
              </div>
              <h5 class="mb-0">Financial Summary</h5>
            </div>
            <div class="card-body-custom">
              <div class="financial-grid">
                <div class="financial-card">
                  <div class="financial-icon bg-success">
                    <i class="bi bi-cash-stack"></i>
                  </div>
                  <div class="financial-info">
                    <span class="financial-label">Total Contributions</span>
                    <h4 class="financial-value">KES {{ formatMoney(stats.total_contributions) }}</h4>
                  </div>
                </div>
                <div class="financial-card">
                  <div class="financial-icon bg-warning">
                    <i class="bi bi-bank"></i>
                  </div>
                  <div class="financial-info">
                    <span class="financial-label">Total Loans</span>
                    <h4 class="financial-value">KES {{ formatMoney(stats.total_loans) }}</h4>
                  </div>
                </div>
                <div class="financial-card">
                  <div class="financial-icon bg-info">
                    <i class="bi bi-arrow-repeat"></i>
                  </div>
                  <div class="financial-info">
                    <span class="financial-label">Outstanding Balance</span>
                    <h4 class="financial-value text-warning">KES {{ formatMoney(stats.outstanding_balance) }}</h4>
                  </div>
                </div>
                <div class="financial-card">
                  <div class="financial-icon bg-primary">
                    <i class="bi bi-gift"></i>
                  </div>
                  <div class="financial-info">
                    <span class="financial-label">Dividends Earned</span>
                    <h4 class="financial-value">KES {{ formatMoney(stats.total_dividends) }}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity Card -->
          <div class="glass-card mt-4">
            <div class="card-header-custom">
              <div class="header-icon" style="background: linear-gradient(135deg, #1565C0, #0D47A1);">
                <i class="bi bi-clock-history"></i>
              </div>
              <h5 class="mb-0">Recent Activity</h5>
              <router-link :to="`/members/${member.id}/statement`" class="link-small">View All</router-link>
            </div>
            <div class="card-body-custom p-0">
              <div class="activity-list">
                <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                  <div :class="['activity-icon', activity.type]">
                    <i :class="activity.icon"></i>
                  </div>
                  <div class="activity-details">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                  <div class="activity-amount" :class="activity.amountClass">
                    {{ activity.amount }}
                  </div>
                </div>
                <div v-if="recentActivities.length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-4"></i>
                  <p class="mb-0 mt-2">No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal" :class="{ 'show': showEditModal }" v-if="showEditModal">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil-fill me-2"></i>Edit Member Profile
            </h5>
            <button class="btn-close" @click="closeEditModal">✕</button>
          </div>
          <form @submit.prevent="updateMember">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-person"></i>
                      <input type="text" class="form-control-custom" v-model="editForm.name" required>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Email *</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-envelope"></i>
                      <input type="email" class="form-control-custom" v-model="editForm.email" required>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Phone *</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-phone"></i>
                      <input type="tel" class="form-control-custom" v-model="editForm.phone" required>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">National ID</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-card-text"></i>
                      <input type="text" class="form-control-custom" v-model="editForm.national_id">
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Gender</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-gender-ambiguous"></i>
                      <select class="form-control-custom" v-model="editForm.gender">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Occupation</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-briefcase"></i>
                      <input type="text" class="form-control-custom" v-model="editForm.occupation">
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Emergency Contact Name</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-person"></i>
                      <input type="text" class="form-control-custom" v-model="editForm.emergency_contact_name">
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Emergency Contact Phone</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-phone"></i>
                      <input type="tel" class="form-control-custom" v-model="editForm.emergency_contact_phone">
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary-custom" @click="closeEditModal">Cancel</button>
              <button type="submit" class="btn-primary-custom" :disabled="updating">
                <i v-if="updating" class="bi bi-spinner bi-spin me-2"></i>
                <i v-else class="bi bi-check-lg me-2"></i>
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showEditModal"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { memberApi } from '@/api/members'
import Swal from 'sweetalert2'

const route = useRoute()
const member = ref({})
const loading = ref(false)
const showEditModal = ref(false)
const updating = ref(false)

const stats = ref({
  total_contributions: 0,
  total_loans: 0,
  outstanding_balance: 0,
  total_dividends: 0,
  contributions_count: 0,
  loans_count: 0,
  meetings_attended: 0
})

const recentActivities = ref([])

const editForm = ref({
  name: '',
  email: '',
  phone: '',
  national_id: '',
  gender: '',
  occupation: '',
  emergency_contact_name: '',
  emergency_contact_phone: ''
})

const loadMember = async () => {
  loading.value = true
  try {
    const response = await memberApi.get(route.params.id)
    member.value = response.data
    
    // Load stats
    stats.value.total_contributions = member.value.total_contributions || 0
    stats.value.total_loans = member.value.total_loans || 0
    stats.value.outstanding_balance = member.value.outstanding_balance || 0
    stats.value.total_dividends = member.value.total_dividends || 0
    stats.value.contributions_count = member.value.contributions_count || 0
    stats.value.loans_count = member.value.loans_count || 0
    stats.value.meetings_attended = member.value.meetings_attended || 0
    
    // Load recent activity
    loadRecentActivity()
  } catch (error) {
    console.error('Failed to load member:', error)
    Swal.fire('Error', 'Failed to load member details', 'error')
  } finally {
    loading.value = false
  }
}

const loadRecentActivity = async () => {
  try {
    const response = await memberApi.getStatement(route.params.id, { per_page: 5 })
    const activities = response.data || []
    recentActivities.value = activities.map(a => ({
      id: a.id,
      type: a.type,
      icon: getActivityIcon(a.type),
      title: a.description,
      time: formatDate(a.created_at),
      amount: a.type === 'credit' ? `+ KES ${formatMoney(a.amount)}` : `- KES ${formatMoney(a.amount)}`,
      amountClass: a.type === 'credit' ? 'positive' : 'negative'
    }))
  } catch (error) {
    console.error('Failed to load activity:', error)
  }
}

const openEditModal = () => {
  editForm.value = {
    name: member.value.name,
    email: member.value.email,
    phone: member.value.phone,
    national_id: member.value.profile?.national_id || '',
    gender: member.value.profile?.gender || '',
    occupation: member.value.profile?.occupation || '',
    emergency_contact_name: member.value.profile?.emergency_contact_name || '',
    emergency_contact_phone: member.value.profile?.emergency_contact_phone || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const updateMember = async () => {
  updating.value = true
  try {
    await memberApi.update(route.params.id, editForm.value)
    Swal.fire('Success', 'Member profile updated successfully', 'success')
    closeEditModal()
    loadMember()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to update member', 'error')
  } finally {
    updating.value = false
  }
}

const getActivityIcon = (type) => {
  const icons = {
    contribution: 'bi bi-cash-stack',
    loan: 'bi bi-bank',
    meeting: 'bi bi-calendar',
    dividend: 'bi bi-gift'
  }
  return icons[type] || 'bi bi-activity'
}

const getAvatarGradient = (name) => {
  const gradients = [
    'linear-gradient(135deg, #2E7D32, #1B5E20)',
    'linear-gradient(135deg, #1565C0, #0D47A1)',
    'linear-gradient(135deg, #FF8F00, #E65100)',
    'linear-gradient(135deg, #C62828, #8E0000)',
    'linear-gradient(135deg, #6A1B9A, #4A148C)'
  ]
  const index = name?.charCodeAt(0) % gradients.length || 0
  return gradients[index]
}

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

onMounted(() => {
  loadMember()
})
</script>

<style scoped>
.member-profile-page {
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

/* Profile Card */
.profile-card {
  text-align: center;
}

.profile-header {
  padding: 32px 24px 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
}

.member-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 48px;
  color: white;
  font-weight: 600;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  background: #e0e0e0;
}

/* Status Badge */
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
  gap: 10px;
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
  padding: 20px;
}

.link-small {
  margin-left: auto;
  font-size: 13px;
  color: #2E7D32;
  text-decoration: none;
}

/* Info Grid */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  min-width: 140px;
}

.info-label i {
  width: 20px;
  color: #2E7D32;
}

.info-value {
  font-weight: 500;
  color: #1a1a2e;
}

/* Financial Grid */
.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.financial-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
}

.financial-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.bg-success { background: linear-gradient(135deg, #2E7D32, #1B5E20); }
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
.bg-info { background: linear-gradient(135deg, #00897B, #00695C); }
.bg-primary { background: linear-gradient(135deg, #6A1B9A, #4A148C); }

.financial-info {
  flex: 1;
}

.financial-label {
  font-size: 11px;
  color: #999;
  display: block;
}

.financial-value {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

/* Activity List */
.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.activity-item:hover {
  background: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.activity-icon.contribution { background: #E8F5E9; color: #2E7D32; }
.activity-icon.loan { background: #FFF3E0; color: #FF8F00; }
.activity-icon.meeting { background: #E3F2FD; color: #1565C0; }
.activity-icon.dividend { background: #F3E5F5; color: #7B1FA2; }

.activity-details {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.activity-time {
  font-size: 11px;
  color: #999;
}

.activity-amount {
  font-weight: 600;
}

.activity-amount.positive { color: #2E7D32; }
.activity-amount.negative { color: #E53935; }

/* Buttons */
.btn-primary-custom {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  padding: 10px 20px;
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

.btn-secondary-custom {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
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

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal.show {
  display: flex;
}

.modal-dialog {
  width: 100%;
  max-width: 700px;
  margin: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

/* Form Elements */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 13px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-wrapper i:first-child {
  position: absolute;
  left: 12px;
  color: #2E7D32;
  z-index: 1;
}

.form-control-custom {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control-custom:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

select.form-control-custom {
  cursor: pointer;
}

.text-warning {
  color: #FF8F00 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .member-profile-page {
    padding: 16px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .financial-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .stat-divider {
    display: none;
  }
  
  .modal-dialog {
    margin: 16px;
  }
}
</style>
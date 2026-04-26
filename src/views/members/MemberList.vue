<template>
  <div class="members-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Members</h1>
        <p class="page-subtitle">Manage all Chama members</p>
      </div>
      <button class="btn-primary-custom" @click="openAddModal">
        <i class="bi bi-plus-lg me-2"></i>Add Member
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-people-fill"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.total }}</h3>
          <p>Total Members</p>
          <span class="trend">Active community</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.active }}</h3>
          <p>Active Members</p>
          <span class="trend up">Currently active</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-warning">
          <i class="bi bi-clock-history"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.pending }}</h3>
          <p>Pending Approval</p>
          <span class="trend">Awaiting activation</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-info">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(stats.totalSavings) }}</h3>
          <p>Total Savings</p>
          <span class="trend up">+12% this month</span>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-bar glass-card">
      <div class="search-box">
        <i class="bi bi-search"></i>
        <input type="text" v-model="filters.search" @input="debouncedSearch" placeholder="Search by name, email or phone...">
      </div>
      <select class="filter-select" v-model="filters.status" @change="loadMembers">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button class="btn-icon" @click="exportMembers" title="Export to CSV">
        <i class="bi bi-download"></i>
      </button>
      <button class="btn-icon" @click="refreshData" title="Refresh">
        <i class="bi bi-arrow-repeat"></i>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Members Table -->
    <div v-else class="table-container glass-card">
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Member</th>
              <th>Contact</th>
              <th>Join Date</th>
              <th>Savings</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member?.id || Math.random()">
              <template v-if="member">
                <td>
                  <div class="member-info">
                    <div class="member-avatar" :style="{ background: getAvatarColor(member.name) }">
                      {{ (member.name || 'U').charAt(0) }}
                    </div>
                    <div>
                      <div class="member-name">{{ member.name || 'Unknown' }}</div>
                      <div class="member-id">ID: {{ member.id }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>{{ member.email || 'N/A' }}</div>
                  <small class="text-muted">{{ member.phone || member.phone_number || 'N/A' }}</small>
                </td>
                <td>{{ formatDate(member.created_at) }}</td>
                <td class="fw-semibold text-success">KES {{ formatMoney(member.total_contributions || 0) }}</td>
                <td>
                  <span :class="['status-badge', member.is_active ? 'active' : 'inactive']">
                    <i :class="member.is_active ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                    {{ member.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn" @click="viewMember(member)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-btn" @click="editMember(member)" title="Edit Member">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-btn" @click="toggleMemberStatus(member)" :title="member.is_active ? 'Deactivate' : 'Activate'">
                      <i :class="member.is_active ? 'bi bi-pause-circle' : 'bi bi-play-circle'"></i>
                    </button>
                    <button class="action-btn danger" @click="deleteMember(member)" title="Delete Member">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </template>
            </tr>
            <tr v-if="!members || members.length === 0">
              <td colspan="6" class="text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="text-muted mt-2">No members found</p>
                <button class="btn-primary-custom btn-sm mt-2" @click="openAddModal">
                  Add your first member
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="pagination-wrapper">
        <button class="page-btn" :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="page-info">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
        <button class="page-btn" :disabled="pagination.current_page === pagination.last_page" @click="changePage(pagination.current_page + 1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Add/Edit Member Modal -->
    <div class="modal" :class="{ 'show': showModal }" v-if="showModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="editing ? 'bi bi-pencil-fill' : 'bi bi-person-plus-fill'" class="me-2"></i>
              {{ editing ? 'Edit Member' : 'Add New Member' }}
            </h5>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>
          <form @submit.prevent="saveMember">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-person"></i>
                  <input type="text" class="form-control-custom" v-model="form.name" required placeholder="Enter full name">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-envelope"></i>
                  <input type="email" class="form-control-custom" v-model="form.email" required placeholder="Enter email address">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-phone"></i>
                  <input type="tel" class="form-control-custom" v-model="form.phone" required placeholder="254712345678">
                </div>
              </div>
              <div class="form-group" v-if="!editing">
                <label class="form-label">Password *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-lock"></i>
                  <input :type="showPassword ? 'text' : 'password'" class="form-control-custom" v-model="form.password" required placeholder="Create password">
                  <i class="bi bi-eye-slash password-toggle" @click="showPassword = !showPassword"></i>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">National ID</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-card-text"></i>
                  <input type="text" class="form-control-custom" v-model="form.national_id" placeholder="Optional">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary-custom" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary-custom" :disabled="saving">
                <i v-if="saving" class="bi bi-spinner bi-spin me-2"></i>
                <i v-else class="bi bi-check-lg me-2"></i>
                {{ saving ? 'Saving...' : (editing ? 'Update Member' : 'Add Member') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showModal" @click="closeModal"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { memberApi } from '@/api/members'

const router = useRouter()
const members = ref([])
const loading = ref(false)
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const showPassword = ref(false)

let searchTimeout = null

const stats = reactive({
  total: 0,
  active: 0,
  pending: 0,
  totalSavings: 0
})

const filters = reactive({
  search: '',
  status: ''
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  email: '',
  phone: '',
  password: '',
  national_id: ''
})

const loadMembers = async () => {
  loading.value = true
  try {
    const response = await memberApi.getAll({
      page: pagination.current_page,
      search: filters.search,
      status: filters.status
    })
    
    // Robustly handle response data
    const responseData = response.data?.data || []
    members.value = Array.isArray(responseData) ? responseData : []
    
    pagination.current_page = response.data?.current_page || 1
    pagination.last_page = response.data?.last_page || 1
    pagination.total = response.data?.total || 0
    
    // Update stats safely
    stats.total = pagination.total
    stats.active = members.value.filter(m => m && m.is_active).length
    stats.pending = members.value.filter(m => m && !m.is_active).length
    stats.totalSavings = members.value.reduce((sum, m) => sum + (m?.total_contributions || 0), 0)
  } catch (error) {
    console.error('Failed to load members:', error)
    members.value = []
    Swal.fire('Error', 'Failed to load members', 'error')
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.current_page = 1
    loadMembers()
  }, 500)
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    loadMembers()
  }
}

const openAddModal = () => {
  editing.value = false
  resetForm()
  showModal.value = true
}

const editMember = (member) => {
  if (!member) return
  editing.value = true
  form.id = member.id
  form.name = member.name
  form.email = member.email
  form.phone = member.phone || member.phone_number
  form.national_id = member.profile?.national_id || ''
  showModal.value = true
}

const saveMember = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await memberApi.update(form.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        national_id: form.national_id
      })
      Swal.fire('Success', 'Member updated successfully', 'success')
    } else {
      await memberApi.create(form)
      Swal.fire('Success', 'Member added successfully', 'success')
    }
    closeModal()
    loadMembers()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to save member', 'error')
  } finally {
    saving.value = false
  }
}

const toggleMemberStatus = async (member) => {
  if (!member) return
  const action = member.is_active ? 'deactivate' : 'activate'
  const result = await Swal.fire({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Member?`,
    text: `Are you sure you want to ${action} ${member.name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Yes, ${action}`,
    cancelButtonText: 'Cancel'
  })
  
  if (result.isConfirmed) {
    try {
      if (member.is_active) {
        await memberApi.deactivate(member.id)
      } else {
        await memberApi.activate(member.id)
      }
      Swal.fire('Success', `Member ${action}d successfully`, 'success')
      loadMembers()
    } catch (error) {
      Swal.fire('Error', `Failed to ${action} member`, 'error')
    }
  }
}

const viewMember = (member) => {
  if (member && member.id) {
    router.push(`/members/${member.id}`)
  }
}

const deleteMember = async (member) => {
  if (!member) return
  const result = await Swal.fire({
    title: 'Delete Member?',
    text: `This will permanently delete ${member.name}. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete'
  })
  
  if (result.isConfirmed) {
    try {
      await memberApi.delete(member.id)
      Swal.fire('Deleted', 'Member deleted successfully', 'success')
      loadMembers()
    } catch (error) {
      Swal.fire('Error', 'Failed to delete member', 'error')
    }
  }
}

const exportMembers = () => {
  if (!members.value.length) {
    Swal.fire('Info', 'No members to export', 'info')
    return
  }
  const csv = convertToCSV(members.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `members_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const convertToCSV = (data) => {
  const headers = ['Name', 'Email', 'Phone', 'Status', 'Join Date', 'Savings']
  const rows = data.map(m => [
    m.name,
    m.email,
    m.phone || m.phone_number,
    m.is_active ? 'Active' : 'Inactive',
    formatDate(m.created_at),
    m.total_contributions || 0
  ])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const refreshData = () => {
  loadMembers()
  Swal.fire({
    title: 'Refreshed',
    text: 'Member list updated',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  })
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.id = null
  form.name = ''
  form.email = ''
  form.phone = ''
  form.password = ''
  form.national_id = ''
}

const getAvatarColor = (name) => {
  if (!name) return '#2E7D32'
  const colors = ['#2E7D32', '#1565C0', '#FF8F00', '#C62828', '#6A1B9A', '#00897B']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

onMounted(() => {
  loadMembers()
})
</script>

<style scoped>
.members-page {
  padding: 24px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  min-height: 100vh;
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
  color: var(--text-primary);
}

.page-subtitle {
  color: var(--text-secondary);
  margin-bottom: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 55px;
  height: 55px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.bg-success { background: linear-gradient(135deg, #2E7D32, #1B5E20); }
.bg-primary { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
.bg-info { background: linear-gradient(135deg, #00897B, #00695C); }

.stat-info h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 2px;
  color: var(--text-primary);
}

.stat-info p {
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-size: 13px;
}

.trend {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: var(--bg-tertiary);
  display: inline-block;
  color: var(--text-secondary);
}

.trend.up { color: #2E7D32; background-color: rgba(46, 125, 50, 0.1); }

/* Filters Bar */
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
  min-width: 200px;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 12px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.filter-select {
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  min-width: 140px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
}

.btn-icon:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
}

/* Table */
.table-container {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
}

.table-custom {
  width: 100%;
  border-collapse: collapse;
}

.table-custom thead {
  background-color: var(--bg-tertiary);
}

.table-custom th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.table-custom td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.table-custom tbody tr:hover {
  background-color: var(--bg-tertiary);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.member-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.member-id {
  font-size: 11px;
  color: var(--text-muted);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(46, 125, 50, 0.1);
  color: #2E7D32;
}

.status-badge.inactive {
  background-color: rgba(229, 57, 53, 0.1);
  color: #E53935;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  border-radius: 6px;
}

.action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
}

.action-btn.danger:hover {
  background-color: rgba(229, 57, 53, 0.1);
  color: #E53935;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  padding: 8px 16px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Buttons */
.btn-primary-custom {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
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
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
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
  max-width: 500px;
  margin: 20px;
}

.modal-content {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  overflow: hidden;
  color: var(--text-primary);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
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
  background: rgba(0, 0, 0, 0.7);
  z-index: 1040;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-muted);
}

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
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
  color: var(--primary-color);
  z-index: 1;
}

.form-control-custom {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control-custom:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.password-toggle {
  position: absolute;
  right: 14px;
  cursor: pointer;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .members-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-bar {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .table-custom th,
  .table-custom td {
    padding: 12px;
    font-size: 13px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>

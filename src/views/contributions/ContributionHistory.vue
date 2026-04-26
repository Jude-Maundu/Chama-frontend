<template>
  <div class="contributions-history">
    <div class="page-header">
      <div>
        <h1 class="page-title">Contribution History</h1>
        <p class="page-subtitle">Track all your contributions and payment records</p>
      </div>
      <button class="btn-primary-custom" @click="$router.push('/app/contributions')">
        <i class="bi bi-plus-lg me-2"></i>New Contribution
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(totalContributions) }}</h3>
          <p>Total Contributions</p>
          <span class="trend up">↑ 12% from last month</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-calendar-check"></i>
        </div>
        <div class="stat-info">
          <h3>{{ onTimePayments }}%</h3>
          <p>On-Time Payment Rate</p>
          <span class="trend up">Excellent record</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-warning">
          <i class="bi bi-graph-up"></i>
        </div>
        <div class="stat-info">
          <h3>{{ totalPenalties > 0 ? 'KES ' + formatMoney(totalPenalties) : 'None' }}</h3>
          <p>Total Penalties</p>
          <span class="trend down">Keep it up!</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-info">
          <i class="bi bi-people"></i>
        </div>
        <div class="stat-info">
          <h3>{{ contributionCount }}</h3>
          <p>Total Payments Made</p>
          <span class="trend">Regular contributor</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar glass-card">
      <div class="search-box">
        <i class="bi bi-search"></i>
        <input type="text" v-model="filters.search" @input="loadContributions" placeholder="Search by receipt number...">
      </div>
      <select class="form-select-custom" v-model="filters.status" @change="loadContributions">
        <option value="">All Status</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>
      <select class="form-select-custom" v-model="filters.payment_method" @change="loadContributions">
        <option value="">All Methods</option>
        <option value="mpesa">M-Pesa</option>
        <option value="cash">Cash</option>
        <option value="bank">Bank Transfer</option>
      </select>
      <input type="month" class="form-select-custom" v-model="filters.month" @change="loadContributions">
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Contributions Table -->
    <div v-else class="table-container glass-card">
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Receipt No.</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Penalty</th>
              <th>Total</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contribution in contributions" :key="contribution.id">
              <td class="fw-semibold">{{ contribution.receipt_number || 'N/A' }}</td>
              <td>{{ formatDate(contribution.payment_date) }}</td>
              <td>KES {{ formatMoney(contribution.amount) }}</td>
              <td class="text-danger">{{ contribution.penalty > 0 ? 'KES ' + formatMoney(contribution.penalty) : '-' }}</td>
              <td class="fw-bold text-success">KES {{ formatMoney(contribution.total_amount) }}</td>
              <td>
                <span :class="['method-badge', contribution.payment_method]">
                  <i :class="getMethodIcon(contribution.payment_method)"></i>
                  {{ contribution.payment_method?.toUpperCase() }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', contribution.status]">
                  <i :class="getStatusIcon(contribution.status)"></i>
                  {{ contribution.status }}
                </span>
              </td>
              <td>
                <button class="action-btn" @click="downloadReceipt(contribution)" title="Download Receipt">
                  <i class="bi bi-download"></i>
                </button>
                <button class="action-btn" @click="viewDetails(contribution)" title="View Details">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            </tr>
            <tr v-if="contributions.length === 0">
              <td colspan="8" class="text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="text-muted mt-2">No contributions found</p>
                <button class="btn-primary-custom btn-sm mt-2" @click="$router.push('/app/contributions')">
                  Make your first contribution
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

    <!-- View Details Modal -->
    <div class="modal" :class="{ 'show': showDetailsModal }" v-if="showDetailsModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">Contribution Details</h5>
            <button class="btn-close" @click="showDetailsModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="details-list">
              <div class="detail-item">
                <span class="label">Receipt Number:</span>
                <span class="value">{{ selectedContribution?.receipt_number || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Date:</span>
                <span class="value">{{ formatDate(selectedContribution?.payment_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Amount:</span>
                <span class="value">KES {{ formatMoney(selectedContribution?.amount) }}</span>
              </div>
              <div class="detail-item" v-if="selectedContribution?.penalty > 0">
                <span class="label">Penalty:</span>
                <span class="value text-danger">KES {{ formatMoney(selectedContribution?.penalty) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Paid:</span>
                <span class="value fw-bold text-success">KES {{ formatMoney(selectedContribution?.total_amount) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Method:</span>
                <span class="value">{{ selectedContribution?.payment_method?.toUpperCase() }}</span>
              </div>
              <div class="detail-item">
                <span class="label">M-Pesa Receipt:</span>
                <span class="value">{{ selectedContribution?.mpesa_receipt || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span :class="['status-badge', selectedContribution?.status]">{{ selectedContribution?.status }}</span>
              </div>
              <div class="detail-item" v-if="selectedContribution?.notes">
                <span class="label">Notes:</span>
                <span class="value">{{ selectedContribution?.notes }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showDetailsModal = false">Close</button>
            <button class="btn-primary-custom" @click="downloadReceipt(selectedContribution)">
              <i class="bi bi-download me-2"></i>Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showDetailsModal"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const contributions = ref([])
const loading = ref(false)
const showDetailsModal = ref(false)
const selectedContribution = ref(null)

const filters = reactive({
  search: '',
  status: '',
  payment_method: '',
  month: ''
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

// Computed stats
const totalContributions = computed(() => {
  return contributions.value.reduce((sum, c) => sum + (c.total_amount || 0), 0)
})

const totalPenalties = computed(() => {
  return contributions.value.reduce((sum, c) => sum + (c.penalty || 0), 0)
})

const contributionCount = computed(() => contributions.value.length)

const onTimePayments = computed(() => {
  if (contributions.value.length === 0) return 100
  const onTime = contributions.value.filter(c => c.penalty === 0).length
  return Math.round((onTime / contributions.value.length) * 100)
})

const loadContributions = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current_page,
      search: filters.search,
      status: filters.status,
      payment_method: filters.payment_method,
      month: filters.month
    }
    const response = await api.get('/contributions', { params })
    contributions.value = response.data.data || []
    pagination.current_page = response.data.current_page
    pagination.last_page = response.data.last_page
    pagination.total = response.data.total
  } catch (error) {
    console.error('Failed to load contributions:', error)
    Swal.fire('Error', 'Failed to load contribution history', 'error')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    loadContributions()
  }
}

const viewDetails = (contribution) => {
  selectedContribution.value = contribution
  showDetailsModal.value = true
}

const downloadReceipt = async (contribution) => {
  try {
    const response = await api.get(`/contributions/receipt/${contribution.id}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `receipt_${contribution.receipt_number || contribution.id}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    Swal.fire('Success', 'Receipt downloaded successfully', 'success')
  } catch (error) {
    Swal.fire('Error', 'Failed to download receipt', 'error')
  }
}

const getMethodIcon = (method) => {
  const icons = {
    mpesa: 'bi bi-phone',
    cash: 'bi bi-cash',
    bank: 'bi bi-bank'
  }
  return icons[method] || 'bi bi-credit-card'
}

const getStatusIcon = (status) => {
  const icons = {
    completed: 'bi bi-check-circle',
    pending: 'bi bi-clock',
    failed: 'bi bi-x-circle'
  }
  return icons[status] || 'bi bi-question-circle'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

onMounted(() => {
  loadContributions()
})
</script>

<style scoped>
.contributions-history {
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.bg-success { background: linear-gradient(135deg, #2E7D32, #1B5E20); }
.bg-primary { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
.bg-info { background: linear-gradient(135deg, #00897B, #00695C); }

.stat-info h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-info p {
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  background: #f5f5f5;
}

.trend.up { color: #2E7D32; background: #E8F5E9; }
.trend.down { color: #E53935; background: #FFEBEE; }

/* Filters */
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  flex-wrap: wrap;
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
  color: #999;
}

.search-box input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.form-select-custom {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  min-width: 140px;
}

.form-select-custom:focus {
  outline: none;
  border-color: #2E7D32;
}

/* Table */
.table-container {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  padding: 0;
}

.table-custom {
  width: 100%;
  border-collapse: collapse;
}

.table-custom thead {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.table-custom th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 14px;
}

.table-custom td {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.table-custom tbody tr:hover {
  background: #f8f9fa;
}

.method-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.method-badge.mpesa { background: #E3F2FD; color: #1565C0; }
.method-badge.cash { background: #E8F5E9; color: #2E7D32; }
.method-badge.bank { background: #FFF3E0; color: #FF8F00; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.completed { background: #E8F5E9; color: #2E7D32; }
.status-badge.pending { background: #FFF3E0; color: #FF8F00; }
.status-badge.failed { background: #FFEBEE; color: #E53935; }

.action-btn {
  background: none;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  border-radius: 8px;
}

.action-btn:hover {
  background: #f0f0f0;
  color: #2E7D32;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.page-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #2E7D32;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* Buttons */
.btn-primary-custom {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.btn-primary-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
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

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
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

.details-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
}

.detail-item .value {
  font-weight: 500;
  color: #1a1a2e;
}

/* Responsive */
@media (max-width: 768px) {
  .contributions-history {
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
  
  .search-box, .form-select-custom {
    width: 100%;
  }
  
  .table-custom th,
  .table-custom td {
    padding: 12px;
    font-size: 13px;
  }
  
  .method-badge, .status-badge {
    white-space: nowrap;
  }
}
</style>
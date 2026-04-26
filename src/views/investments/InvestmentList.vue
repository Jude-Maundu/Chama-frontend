<template>
  <div class="investments-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Investments</h1>
        <p class="page-subtitle">Track and manage Chama investment portfolio</p>
      </div>
      <button class="btn-primary-custom" @click="openAddModal">
        <i class="bi bi-plus-lg me-2"></i>Add Investment
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(summary.total_invested) }}</h3>
          <p>Total Invested</p>
          <span class="trend">Portfolio value</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-graph-up"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(summary.current_value) }}</h3>
          <p>Current Value</p>
          <span class="trend up">
            <i class="bi bi-arrow-up"></i> +{{ formatMoney((summary.current_value || 0) - (summary.total_invested || 0)) }}
          </span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon" :class="(summary.roi_percentage || 0) >= 0 ? 'bg-warning' : 'bg-danger'">
          <i class="bi" :class="(summary.roi_percentage || 0) >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
        </div>
        <div class="stat-info">
          <h3 :class="(summary.roi_percentage || 0) >= 0 ? 'text-success' : 'text-danger'">
            {{ (summary.roi_percentage || 0).toFixed(2) }}%
          </h3>
          <p>Return on Investment</p>
          <span class="trend">{{ (summary.roi_percentage || 0) >= 0 ? 'Profit' : 'Loss' }}</span>
        </div>
      </div>
    </div>

    <!-- Investments Table -->
    <div class="glass-card">
      <div class="card-header-custom">
        <div class="header-icon">
          <i class="bi bi-briefcase"></i>
        </div>
        <h5 class="mb-0">Investment Portfolio</h5>
        <div class="ms-auto">
          <button class="btn-icon" @click="refreshData" title="Refresh">
            <i class="bi bi-arrow-repeat"></i>
          </button>
          <button class="btn-icon" @click="exportData" title="Export">
            <i class="bi bi-download"></i>
          </button>
        </div>
      </div>
      <div class="card-body-custom p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="!investments || investments.length === 0" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted"></i>
          <p class="text-muted mt-2">No investments found</p>
          <button class="btn-primary-custom btn-sm mt-2" @click="openAddModal">
            Add your first investment
          </button>
        </div>
        <div v-else class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Investment Type</th>
                <th>Amount Invested</th>
                <th>Current Value</th>
                <th>Return</th>
                <th>ROI</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="investment in investments" :key="investment?.id || Math.random()">
                <template v-if="investment">
                  <td class="fw-semibold">
                    <span class="investment-type" :class="investment.investment_type">
                      <i :class="getTypeIcon(investment.investment_type)"></i>
                      {{ formatType(investment.investment_type) }}
                    </span>
                  </td>
                  <td>KES {{ formatMoney(investment.amount_invested) }}</td>
                  <td>KES {{ formatMoney(investment.current_value) }}</td>
                  <td :class="getReturnClass(investment)">
                    {{ getReturnSymbol(investment) }} KES {{ formatMoney(Math.abs(getReturn(investment))) }}
                  </td>
                  <td :class="getROIClass(investment)">
                    {{ getROI(investment).toFixed(2) }}%
                  </td>
                  <td>{{ formatDate(investment.investment_date || investment.created_at) }}</td>
                  <td>
                    <span :class="['status-badge', investment.status || 'active']">
                      <i :class="investment.status === 'withdrawn' ? 'bi bi-box-arrow-right' : 'bi bi-check-circle'"></i>
                      {{ investment.status || 'Active' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="action-btn" @click="viewInvestment(investment)" title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="action-btn" @click="editInvestment(investment)" title="Edit">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button v-if="investment.status !== 'withdrawn'" class="action-btn" @click="withdrawInvestment(investment)" title="Withdraw">
                        <i class="bi bi-cash-stack"></i>
                      </button>
                    </div>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Investment Modal -->
    <div class="modal" :class="{ 'show': showModal }" v-if="showModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="isEditing ? 'bi bi-pencil-fill' : 'bi bi-plus-circle-fill'" class="me-2"></i>
              {{ isEditing ? 'Edit Investment' : 'Add Investment' }}
            </h5>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveInvestment">
              <div class="form-group">
                <label class="form-label">Investment Type *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-briefcase"></i>
                  <select v-model="investmentForm.investment_type" class="form-control-custom" required>
                    <option value="">Select investment type</option>
                    <option value="stocks">Stocks & Shares</option>
                    <option value="bonds">Government Bonds</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="business">Business Venture</option>
                    <option value="savings">Savings Account</option>
                    <option value="saccco">SACCO</option>
                    <option value="treasury">Treasury Bills</option>
                    <option value="other">Other Investment</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Amount Invested (KES) *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-cash"></i>
                  <input type="number" v-model="investmentForm.amount_invested" class="form-control-custom" 
                         placeholder="Enter amount invested" required min="0" step="0.01">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Current Value (KES) *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-graph-up"></i>
                  <input type="number" v-model="investmentForm.current_value" class="form-control-custom" 
                         placeholder="Enter current market value" required min="0" step="0.01">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Investment Date</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-calendar3"></i>
                  <input type="date" v-model="investmentForm.investment_date" class="form-control-custom">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-file-text"></i>
                  <textarea v-model="investmentForm.description" class="form-control-custom" rows="3" 
                            placeholder="Additional details about this investment..."></textarea>
                </div>
              </div>

              <div class="info-banner" v-if="investmentForm.amount_invested && investmentForm.current_value">
                <i class="bi bi-info-circle-fill"></i>
                <span>
                  Projected ROI: 
                  <strong :class="calculateROIFromForm() >= 0 ? 'text-success' : 'text-danger'">
                    {{ calculateROIFromForm().toFixed(2) }}%
                  </strong>
                </span>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary-custom" @click="closeModal">Cancel</button>
                <button type="submit" class="btn-primary-custom" :disabled="saving">
                  <i v-if="saving" class="bi bi-spinner bi-spin me-2"></i>
                  <i v-else class="bi bi-check-lg me-2"></i>
                  {{ saving ? 'Saving...' : (isEditing ? 'Update Investment' : 'Add Investment') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showModal" @click="closeModal"></div>

    <!-- View Details Modal -->
    <div class="modal" :class="{ 'show': showViewModal }" v-if="showViewModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">Investment Details</h5>
            <button class="btn-close" @click="showViewModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="details-list" v-if="selectedInvestment">
              <div class="detail-item">
                <span class="label">Type:</span>
                <span class="value">{{ formatType(selectedInvestment.investment_type) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Amount Invested:</span>
                <span class="value">KES {{ formatMoney(selectedInvestment.amount_invested) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Current Value:</span>
                <span class="value">KES {{ formatMoney(selectedInvestment.current_value) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Return:</span>
                <span :class="['value', getReturnClass(selectedInvestment)]">
                  {{ getReturnSymbol(selectedInvestment) }} KES {{ formatMoney(Math.abs(getReturn(selectedInvestment))) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">ROI:</span>
                <span :class="['value', getROIClass(selectedInvestment)]">
                  {{ getROI(selectedInvestment).toFixed(2) }}%
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Investment Date:</span>
                <span class="value">{{ formatDate(selectedInvestment.investment_date || selectedInvestment.created_at) }}</span>
              </div>
              <div class="detail-item" v-if="selectedInvestment.description">
                <span class="label">Description:</span>
                <span class="value">{{ selectedInvestment.description }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary-custom" @click="showViewModal = false">Close</button>
            <button class="btn-primary-custom" @click="editFromView">Edit Investment</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showViewModal" @click="showViewModal = false"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { investmentApi } from '@/api/investments'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

const investments = ref([])
const summary = ref({
  total_invested: 0,
  current_value: 0,
  roi_percentage: 0
})
const loading = ref(false)
const showModal = ref(false)
const showViewModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const selectedInvestment = ref(null)

const investmentForm = ref({
  investment_type: '',
  amount_invested: '',
  current_value: '',
  description: '',
  investment_date: dayjs().format('YYYY-MM-DD')
})

const loadInvestments = async () => {
  loading.value = true
  try {
    const response = await investmentApi.getAll()
    const responseData = response.data?.investments || response.data?.data || []
    investments.value = Array.isArray(responseData) ? responseData : []
    
    summary.value = response.data?.summary || {
      total_invested: investments.value.reduce((sum, i) => sum + (i?.amount_invested || 0), 0),
      current_value: investments.value.reduce((sum, i) => sum + (i?.current_value || 0), 0),
      roi_percentage: 0
    }
    
    if (summary.value.total_invested > 0) {
      summary.value.roi_percentage = ((summary.value.current_value - summary.value.total_invested) / summary.value.total_invested) * 100
    }
  } catch (error) {
    console.error('Failed to load investments:', error)
    investments.value = []
    Swal.fire('Error', 'Failed to load investments', 'error')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  selectedInvestment.value = null
  resetForm()
  showModal.value = true
}

const editInvestment = (investment) => {
  if (!investment) return
  isEditing.value = true
  selectedInvestment.value = investment
  investmentForm.value = {
    investment_type: investment.investment_type,
    amount_invested: investment.amount_invested,
    current_value: investment.current_value,
    description: investment.description || '',
    investment_date: investment.investment_date ? dayjs(investment.investment_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  }
  showModal.value = true
}

const saveInvestment = async () => {
  if (!investmentForm.value.investment_type || !investmentForm.value.amount_invested || !investmentForm.value.current_value) {
    Swal.fire('Error', 'Please fill in all required fields', 'error')
    return
  }

  saving.value = true
  try {
    if (isEditing.value && selectedInvestment.value) {
      await investmentApi.update(selectedInvestment.value.id, investmentForm.value)
      Swal.fire('Success', 'Investment updated successfully', 'success')
    } else {
      await investmentApi.create(investmentForm.value)
      Swal.fire('Success', 'Investment added successfully', 'success')
    }
    closeModal()
    loadInvestments()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to save investment', 'error')
  } finally {
    saving.value = false
  }
}

const withdrawInvestment = async (investment) => {
  if (!investment) return
  const result = await Swal.fire({
    title: 'Withdraw Investment?',
    html: `
      <p>You are about to withdraw from:</p>
      <strong>${formatType(investment.investment_type)}</strong>
      <p>Current value: <strong>KES ${formatMoney(investment.current_value)}</strong></p>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, withdraw',
    cancelButtonText: 'Cancel'
  })

  if (result.isConfirmed) {
    try {
      await investmentApi.withdraw(investment.id, { 
        withdrawal_date: new Date().toISOString(),
        withdrawal_amount: investment.current_value
      })
      Swal.fire('Success', 'Investment withdrawn successfully', 'success')
      loadInvestments()
    } catch (error) {
      Swal.fire('Error', 'Failed to withdraw investment', 'error')
    }
  }
}

const viewInvestment = (investment) => {
  if (!investment) return
  selectedInvestment.value = investment
  showViewModal.value = true
}

const editFromView = () => {
  if (!selectedInvestment.value) return
  showViewModal.value = false
  editInvestment(selectedInvestment.value)
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  investmentForm.value = {
    investment_type: '',
    amount_invested: '',
    current_value: '',
    description: '',
    investment_date: dayjs().format('YYYY-MM-DD')
  }
}

const refreshData = () => {
  loadInvestments()
  Swal.fire({
    title: 'Refreshed',
    text: 'Investment data updated',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  })
}

const exportData = () => {
  if (!investments.value.length) {
    Swal.fire('Info', 'No investments to export', 'info')
    return
  }
  const csv = convertToCSV(investments.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `investments_${dayjs().format('YYYY-MM-DD')}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const convertToCSV = (data) => {
  const headers = ['Type', 'Amount Invested', 'Current Value', 'ROI', 'Date', 'Status']
  const rows = data.map(i => [
    formatType(i?.investment_type),
    i?.amount_invested || 0,
    i?.current_value || 0,
    getROI(i).toFixed(2) + '%',
    formatDate(i?.investment_date || i?.created_at),
    i?.status || 'Active'
  ])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const getTypeIcon = (type) => {
  const icons = {
    stocks: 'bi bi-graph-up',
    bonds: 'bi bi-file-text',
    real_estate: 'bi bi-building',
    business: 'bi bi-shop',
    savings: 'bi bi-piggy-bank',
    saccco: 'bi bi-people',
    treasury: 'bi bi-bank',
    other: 'bi bi-box'
  }
  return icons[type] || 'bi bi-briefcase'
}

const formatType = (type) => {
  const types = {
    stocks: 'Stocks & Shares',
    bonds: 'Government Bonds',
    real_estate: 'Real Estate',
    business: 'Business Venture',
    savings: 'Savings Account',
    saccco: 'SACCO',
    treasury: 'Treasury Bills',
    other: 'Other Investment'
  }
  return types[type] || type || 'Investment'
}

const getReturn = (investment) => {
  if (!investment) return 0
  return (investment.current_value || 0) - (investment.amount_invested || 0)
}

const getReturnSymbol = (investment) => {
  return getReturn(investment) >= 0 ? '+' : '-'
}

const getReturnClass = (investment) => {
  return getReturn(investment) >= 0 ? 'text-success' : 'text-danger'
}

const getROI = (investment) => {
  if (!investment || !investment.amount_invested || investment.amount_invested === 0) return 0
  return (getReturn(investment) / investment.amount_invested) * 100
}

const getROIClass = (investment) => {
  return getROI(investment) >= 0 ? 'text-success' : 'text-danger'
}

const calculateROIFromForm = () => {
  const invested = parseFloat(investmentForm.value.amount_invested) || 0
  const current = parseFloat(investmentForm.value.current_value) || 0
  if (invested === 0) return 0
  return ((current - invested) / invested) * 100
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return dayjs(date).format('MMM DD, YYYY')
}

onMounted(() => {
  loadInvestments()
})
</script>

<style scoped>
.investments-page {
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
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
  flex-shrink: 0;
}

.bg-success { background: linear-gradient(135deg, #2E7D32, #1B5E20); }
.bg-primary { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
.bg-danger { background: linear-gradient(135deg, #E53935, #C62828); }

.stat-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.stat-info p {
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 14px;
}

.trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: var(--bg-tertiary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.trend.up { color: #2E7D32; background-color: rgba(46, 125, 50, 0.1); }
.text-success { color: #2E7D32 !important; }
.text-danger { color: #E53935 !important; }

/* Glass Card */
.glass-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header-custom {
  padding: 20px 24px;
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.card-body-custom {
  padding: 0;
}

/* Table Styles */
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

.investment-type {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.investment-type.stocks { background-color: rgba(21, 101, 192, 0.1); color: #1565C0; }
.investment-type.bonds { background-color: rgba(46, 125, 50, 0.1); color: #2E7D32; }
.investment-type.real_estate { background-color: rgba(255, 143, 0, 0.1); color: #FF8F00; }
.investment-type.business { background-color: rgba(106, 27, 154, 0.1); color: #7B1FA2; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active { background-color: rgba(46, 125, 50, 0.1); color: #2E7D32; }
.status-badge.withdrawn { background-color: rgba(229, 57, 53, 0.1); color: #E53935; }

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  border-radius: 8px;
}

.action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
}

.btn-icon {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
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
  max-width: 550px;
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
  font-size: 24px;
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

textarea.form-control-custom {
  resize: vertical;
  padding-top: 12px;
  padding-bottom: 12px;
}

select.form-control-custom {
  cursor: pointer;
}

.info-banner {
  background-color: var(--bg-tertiary);
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
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
  border-bottom: 1px solid var(--border-color);
}

.detail-item .label {
  font-weight: 500;
  color: var(--text-secondary);
}

.detail-item .value {
  font-weight: 500;
  color: var(--text-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .investments-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-custom th,
  .table-custom td {
    padding: 12px;
    font-size: 13px;
  }
  
  .modal-dialog {
    margin: 16px;
  }
}
</style>

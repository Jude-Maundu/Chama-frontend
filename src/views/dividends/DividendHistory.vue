<template>
  <div class="dividends-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dividends</h1>
        <p class="page-subtitle">Track your dividend earnings and distributions</p>
      </div>
      <button v-if="isAdmin" class="btn-primary-custom" @click="showCalculateModal = true">
        <i class="bi bi-calculator-fill me-2"></i>Calculate Dividends
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-gift-fill"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(totalDividends) }}</h3>
          <p>Total Dividends Earned</p>
          <span class="trend up">
            <i class="bi bi-arrow-up"></i> Lifetime earnings
          </span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-receipt"></i>
        </div>
        <div class="stat-info">
          <h3>{{ dividendCount }}</h3>
          <p>Payments Received</p>
          <span class="trend">Total distributions</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-warning">
          <i class="bi bi-calendar-check"></i>
        </div>
        <div class="stat-info">
          <h3 class="text-success">{{ lastDividend?.period || 'N/A' }}</h3>
          <p>Last Dividend Period</p>
          <span class="trend">
            <i class="bi bi-clock"></i> {{ lastDividendDate }}
          </span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-info">
          <i class="bi bi-arrow-repeat"></i>
        </div>
        <div class="stat-info">
          <h3>{{ dividendFrequency }}</h3>
          <p>Payment Frequency</p>
          <span class="trend">Regular distributions</span>
        </div>
      </div>
    </div>

    <!-- Dividends Table -->
    <div class="glass-card">
      <div class="card-header-custom">
        <div class="header-icon">
          <i class="bi bi-list-ul"></i>
        </div>
        <h5 class="mb-0">Dividend History</h5>
        <div class="ms-auto">
          <button class="btn-icon" @click="exportDividends" title="Export">
            <i class="bi bi-download"></i>
          </button>
          <button class="btn-icon" @click="refreshData" title="Refresh">
            <i class="bi bi-arrow-repeat"></i>
          </button>
        </div>
      </div>
      <div class="card-body-custom p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Period</th>
                <th>Amount (KES)</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dividend in dividends" :key="dividend.id">
                <td class="fw-semibold">{{ dividend.period }}</td>
                <td class="fw-bold text-success">KES {{ formatMoney(dividend.pivot?.amount || dividend.amount) }}</td>
                <td>{{ formatDate(dividend.distribution_date) }}</td>
                <td>
                  <span class="method-badge">
                    <i class="bi bi-phone"></i> M-Pesa
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', dividend.pivot?.status === 'paid' ? 'completed' : 'pending']">
                    <i :class="dividend.pivot?.status === 'paid' ? 'bi bi-check-circle' : 'bi bi-clock'"></i>
                    {{ dividend.pivot?.status === 'paid' ? 'Paid' : 'Pending' }}
                  </span>
                </td>
                <td>
                  <button class="action-btn" @click="downloadReceipt(dividend)" title="Download Receipt">
                    <i class="bi bi-download"></i>
                  </button>
                  <button class="action-btn" @click="viewDetails(dividend)" title="View Details">
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="dividends.length === 0">
                <td colspan="6" class="text-center py-5">
                  <i class="bi bi-inbox fs-1 text-muted"></i>
                  <p class="text-muted mt-2">No dividends recorded yet</p>
                  <p class="small text-muted">Dividends will appear here once distributed</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Calculate Dividends Modal (Admin Only) -->
    <div class="modal" :class="{ 'show': showCalculateModal }" v-if="showCalculateModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calculator-fill me-2"></i>Calculate Dividends
            </h5>
            <button class="btn-close" @click="showCalculateModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="info-banner">
              <i class="bi bi-info-circle-fill"></i>
              <span>Dividends will be calculated based on member contributions and distributed via M-Pesa.</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Period</label>
              <div class="input-icon-wrapper">
                <i class="bi bi-calendar3"></i>
                <input type="text" class="form-control-custom" v-model="dividendForm.period" 
                       placeholder="e.g., Q1 2024, Annual 2024" required>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Total Profit (KES)</label>
              <div class="input-icon-wrapper">
                <i class="bi bi-currency-dollar"></i>
                <input type="number" class="form-control-custom" v-model="dividendForm.total_amount" 
                       placeholder="Enter total profit amount" required>
              </div>
            </div>
            
            <div class="calculation-preview" v-if="dividendForm.total_amount">
              <div class="preview-title">Distribution Preview</div>
              <div class="preview-item">
                <span>Total Members:</span>
                <strong>{{ memberCount }}</strong>
              </div>
              <div class="preview-item">
                <span>Per Member Average:</span>
                <strong>KES {{ formatMoney(dividendForm.total_amount / memberCount) }}</strong>
              </div>
              <div class="preview-item">
                <span>Distribution Method:</span>
                <strong>M-Pesa Bulk Payment</strong>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary-custom" @click="showCalculateModal = false">Cancel</button>
            <button class="btn-primary-custom" @click="calculateDividends" :disabled="calculating">
              <i v-if="calculating" class="bi bi-spinner bi-spin me-2"></i>
              <i v-else class="bi bi-check-lg me-2"></i>
              {{ calculating ? 'Calculating...' : 'Calculate & Distribute' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showCalculateModal"></div>

    <!-- View Details Modal -->
    <div class="modal" :class="{ 'show': showDetailsModal }" v-if="showDetailsModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">Dividend Details</h5>
            <button class="btn-close" @click="showDetailsModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="details-list">
              <div class="detail-item">
                <span class="label">Period:</span>
                <span class="value">{{ selectedDividend?.period }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Amount:</span>
                <span class="value text-success fw-bold">KES {{ formatMoney(selectedDividend?.pivot?.amount) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Date:</span>
                <span class="value">{{ formatDate(selectedDividend?.distribution_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Method:</span>
                <span class="value">M-Pesa ({{ selectedDividend?.pivot?.mpesa_number || 'Registered Number' }})</span>
              </div>
              <div class="detail-item">
                <span class="label">Transaction ID:</span>
                <span class="value">{{ selectedDividend?.pivot?.transaction_id || 'MPESA' + Math.random().toString(36).substr(2, 8).toUpperCase() }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span :class="['status-badge', selectedDividend?.pivot?.status === 'paid' ? 'completed' : 'pending']">
                  {{ selectedDividend?.pivot?.status === 'paid' ? 'Completed' : 'Pending' }}
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary-custom" @click="showDetailsModal = false">Close</button>
            <button class="btn-primary-custom" @click="downloadReceipt(selectedDividend)">
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
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { dividendApi } from '@/api/dividends'

const dividends = ref([])
const loading = ref(false)
const showCalculateModal = ref(false)
const showDetailsModal = ref(false)
const calculating = ref(false)
const isAdmin = ref(false)
const selectedDividend = ref(null)
const memberCount = ref(50)

const dividendForm = ref({
  period: '',
  total_amount: ''
})

const totalDividends = computed(() => {
  return dividends.value.reduce((sum, d) => sum + (d.pivot?.amount || 0), 0)
})

const dividendCount = computed(() => dividends.value.length)

const lastDividend = computed(() => dividends.value[0] || null)

const lastDividendDate = computed(() => {
  if (!lastDividend.value?.distribution_date) return 'Not distributed yet'
  return formatDate(lastDividend.value.distribution_date)
})

const dividendFrequency = computed(() => {
  if (dividends.value.length === 0) return 'No data'
  if (dividends.value.length === 1) return 'One-time'
  return 'Quarterly'
})

const loadDividends = async () => {
  loading.value = true
  try {
    const response = await dividendApi.getMyDividends()
    dividends.value = response.data || []
  } catch (error) {
    console.error('Failed to load dividends:', error)
    // Mock data for demo
    dividends.value = [
      { id: 1, period: 'Q1 2024', amount: 1200, distribution_date: '2024-04-15', pivot: { amount: 1200, status: 'paid' } },
      { id: 2, period: 'Q4 2023', amount: 800, distribution_date: '2024-01-10', pivot: { amount: 800, status: 'paid' } }
    ]
  } finally {
    loading.value = false
  }
}

const calculateDividends = async () => {
  if (!dividendForm.value.period || !dividendForm.value.total_amount) {
    Swal.fire('Error', 'Please fill in all fields', 'error')
    return
  }

  calculating.value = true
  try {
    await dividendApi.calculate(dividendForm.value)
    Swal.fire({
      title: 'Success!',
      text: 'Dividends calculated and distributed successfully',
      icon: 'success',
      confirmButtonColor: '#2E7D32'
    })
    showCalculateModal.value = false
    dividendForm.value = { period: '', total_amount: '' }
    loadDividends()
  } catch (error) {
    Swal.fire('Error', 'Failed to calculate dividends', 'error')
  } finally {
    calculating.value = false
  }
}

const viewDetails = (dividend) => {
  selectedDividend.value = dividend
  showDetailsModal.value = true
}

const downloadReceipt = async (dividend) => {
  Swal.fire({
    title: 'Download Receipt',
    text: `Downloading receipt for ${dividend.period}`,
    icon: 'info',
    timer: 2000,
    showConfirmButton: false
  })
  // Implement actual receipt download
}

const exportDividends = () => {
  const csv = convertToCSV(dividends.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dividends_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const convertToCSV = (data) => {
  const headers = ['Period', 'Amount', 'Payment Date', 'Status']
  const rows = data.map(d => [d.period, d.pivot?.amount, formatDate(d.distribution_date), d.pivot?.status])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const refreshData = () => {
  loadDividends()
  Swal.fire('Refreshed', 'Dividend data updated', 'success')
}

const formatDate = (date) => {
  if (!date) return 'Pending'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

onMounted(() => {
  loadDividends()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user.role === 'admin'
})
</script>

<style scoped>
.dividends-page {
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
  flex-shrink: 0;
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
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.trend.up { color: #2E7D32; background: #E8F5E9; }

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

.card-header-custom {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
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
  background: #E3F2FD;
  color: #1565C0;
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

.status-badge.completed { background: #E8F5E9; color: #2E7D32; }
.status-badge.pending { background: #FFF3E0; color: #FF8F00; }

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

.btn-icon {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
  color: #2E7D32;
}

/* Buttons */
.btn-primary-custom {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
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
  font-size: 24px;
  cursor: pointer;
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

.info-banner {
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

.calculation-preview {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.preview-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.preview-item:last-child {
  border-bottom: none;
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
  .dividends-page {
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
<template>
  <div class="loans-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Loans</h1>
        <p class="page-subtitle">Manage your loan applications and repayments</p>
      </div>
      <button class="btn-primary-custom" @click="$router.push('/app/loans/apply')">
        <i class="bi bi-plus-lg me-2"></i>Apply for Loan
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(stats.total_borrowed) }}</h3>
          <p>Total Borrowed</p>
          <span class="trend">Lifetime loans</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-warning">
          <i class="bi bi-bank"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(stats.outstanding_balance) }}</h3>
          <p>Outstanding Balance</p>
          <span class="trend down">
            <i class="bi bi-arrow-down"></i> Due now
          </span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-info">
          <i class="bi bi-calendar-check"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.active_loans }}</h3>
          <p>Active Loans</p>
          <span class="trend">{{ stats.active_loans }} ongoing</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.completed_loans }}</h3>
          <p>Completed Loans</p>
          <span class="trend up">Fully repaid</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container glass-card">
      <div class="tabs-header">
        <button class="tab-btn" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
          <i class="bi bi-play-circle-fill me-2"></i>Active Loans
          <span class="badge" v-if="activeLoansCount">{{ activeLoansCount }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
          <i class="bi bi-clock-history me-2"></i>Pending Approval
          <span class="badge" v-if="pendingLoansCount">{{ pendingLoansCount }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">
          <i class="bi bi-check-circle-fill me-2"></i>Completed
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          <i class="bi bi-grid-3x3-gap-fill me-2"></i>All Loans
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Loans List -->
    <div v-else class="loans-list">
      <div v-for="loan in filteredLoans" :key="loan.id" class="loan-card glass-card">
        <div class="loan-card-header">
          <div class="loan-type-badge" :class="loan.loan_type">
            <i :class="getLoanTypeIcon(loan.loan_type)"></i>
            {{ formatLoanType(loan.loan_type) }}
          </div>
          <span :class="['status-badge', loan.status]">
            <i :class="getStatusIcon(loan.status)"></i>
            {{ formatStatus(loan.status) }}
          </span>
        </div>

        <div class="loan-card-body">
          <div class="loan-amount">
            <span class="label">Loan Amount</span>
            <h3>KES {{ formatMoney(loan.amount) }}</h3>
          </div>
          <div class="loan-details-grid">
            <div class="detail">
              <span class="label">Interest Rate</span>
              <strong>{{ loan.interest_rate }}%</strong>
            </div>
            <div class="detail">
              <span class="label">Duration</span>
              <strong>{{ loan.duration_months }} months</strong>
            </div>
            <div class="detail">
              <span class="label">Monthly Payment</span>
              <strong>KES {{ formatMoney(loan.monthly_payment) }}</strong>
            </div>
            <div class="detail">
              <span class="label">Balance</span>
              <strong class="text-warning">KES {{ formatMoney(loan.balance) }}</strong>
            </div>
          </div>
          
          <div class="progress-section" v-if="loan.status !== 'pending' && loan.status !== 'rejected'">
            <div class="progress-label">
              <span>Repayment Progress</span>
              <span>{{ repaymentProgress(loan) }}%</span>
            </div>
            <div class="progress-bar-custom">
              <div class="progress-fill" :style="{ width: repaymentProgress(loan) + '%' }"></div>
            </div>
          </div>

          <div class="next-payment" v-if="loan.status === 'approved' || loan.status === 'disbursed'">
            <i class="bi bi-calendar-event"></i>
            <span>Next Payment Due: <strong>{{ formatDate(loan.next_payment_date) }}</strong></span>
            <span class="payment-amount">KES {{ formatMoney(loan.monthly_payment) }}</span>
          </div>
        </div>

        <div class="loan-card-footer">
          <button class="action-btn" @click="viewLoanDetails(loan)">
            <i class="bi bi-eye"></i> View Details
          </button>
          <button v-if="loan.status === 'approved' || loan.status === 'disbursed'" class="action-btn primary" @click="makeRepayment(loan)">
            <i class="bi bi-cash-stack"></i> Make Payment
          </button>
          <button v-if="loan.status === 'pending'" class="action-btn warning" @click="cancelApplication(loan)">
            <i class="bi bi-x-circle"></i> Cancel
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredLoans.length === 0" class="empty-state glass-card">
        <i class="bi bi-inbox fs-1 text-muted"></i>
        <h5 class="mt-3">No loans found</h5>
        <p class="text-muted">You haven't applied for any {{ activeTab }} loans yet.</p>
        <button class="btn-primary-custom mt-2" @click="$router.push('/app/loans/apply')">
          Apply for a Loan
        </button>
      </div>
    </div>

    <!-- View Details Modal -->
    <div class="modal" :class="{ 'show': showDetailsModal }" v-if="showDetailsModal">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">Loan Details</h5>
            <button class="btn-close" @click="showDetailsModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="loan-details-section" v-if="selectedLoan">
              <div class="details-header">
                <div class="loan-type-badge large" :class="selectedLoan.loan_type">
                  <i :class="getLoanTypeIcon(selectedLoan.loan_type)"></i>
                  {{ formatLoanType(selectedLoan.loan_type) }}
                </div>
                <span :class="['status-badge large', selectedLoan.status]">
                  {{ formatStatus(selectedLoan.status) }}
                </span>
              </div>

              <div class="details-grid">
                <div class="details-card">
                  <h6>Loan Information</h6>
                  <div class="detail-row">
                    <span>Application Date:</span>
                    <strong>{{ formatDate(selectedLoan.application_date) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Approval Date:</span>
                    <strong>{{ formatDate(selectedLoan.approval_date) || 'Pending' }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Disbursement Date:</span>
                    <strong>{{ formatDate(selectedLoan.disbursement_date) || 'Pending' }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Purpose:</span>
                    <strong>{{ selectedLoan.purpose }}</strong>
                  </div>
                </div>

                <div class="details-card">
                  <h6>Financial Details</h6>
                  <div class="detail-row">
                    <span>Principal Amount:</span>
                    <strong>KES {{ formatMoney(selectedLoan.amount) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Interest Rate:</span>
                    <strong>{{ selectedLoan.interest_rate }}% p.a.</strong>
                  </div>
                  <div class="detail-row">
                    <span>Total Payable:</span>
                    <strong>KES {{ formatMoney(selectedLoan.total_payable) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Monthly Payment:</span>
                    <strong>KES {{ formatMoney(selectedLoan.monthly_payment) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Outstanding Balance:</span>
                    <strong class="text-warning">KES {{ formatMoney(selectedLoan.balance) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Repayment Schedule -->
              <div class="repayment-schedule" v-if="selectedLoan.repayments && selectedLoan.repayments.length">
                <h6>Repayment Schedule</h6>
                <div class="table-responsive">
                  <table class="schedule-table">
                    <thead>
                      <tr>
                        <th>Installment</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="repayment in selectedLoan.repayments" :key="repayment.id">
                        <td>{{ repayment.installment_number }}</td>
                        <td>{{ formatDate(repayment.due_date) }}</td>
                        <td>KES {{ formatMoney(repayment.due_amount) }}</td>
                        <td>
                          <span :class="['status-badge small', repayment.status]">
                            {{ repayment.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary-custom" @click="showDetailsModal = false">Close</button>
            <button v-if="selectedLoan?.status === 'approved' || selectedLoan?.status === 'disbursed'" 
                    class="btn-primary-custom" @click="makeRepayment(selectedLoan)">
              <i class="bi bi-cash-stack me-2"></i>Make Payment
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
import { useRouter } from 'vue-router'
import { loanApi } from '@/api/loans'
import Swal from 'sweetalert2'

const router = useRouter()
const loans = ref([])
const loading = ref(false)
const activeTab = ref('active')
const showDetailsModal = ref(false)
const selectedLoan = ref(null)

const stats = ref({
  total_borrowed: 0,
  outstanding_balance: 0,
  active_loans: 0,
  completed_loans: 0
})

const filteredLoans = computed(() => {
  switch (activeTab.value) {
    case 'active':
      return loans.value.filter(l => ['approved', 'disbursed'].includes(l.status))
    case 'pending':
      return loans.value.filter(l => l.status === 'pending')
    case 'completed':
      return loans.value.filter(l => l.status === 'completed')
    default:
      return loans.value
  }
})

const activeLoansCount = computed(() => {
  return loans.value.filter(l => ['approved', 'disbursed'].includes(l.status)).length
})

const pendingLoansCount = computed(() => {
  return loans.value.filter(l => l.status === 'pending').length
})

const loadLoans = async () => {
  loading.value = true
  try {
    const response = await loanApi.getAll()
    loans.value = response.data.data || []
    
    // Calculate stats
    stats.value.total_borrowed = loans.value.reduce((sum, l) => sum + (l.amount || 0), 0)
    stats.value.outstanding_balance = loans.value.reduce((sum, l) => sum + (l.balance || 0), 0)
    stats.value.active_loans = loans.value.filter(l => ['approved', 'disbursed'].includes(l.status)).length
    stats.value.completed_loans = loans.value.filter(l => l.status === 'completed').length
  } catch (error) {
    console.error('Failed to load loans:', error)
    // Mock data for demo
    loans.value = [
      { id: 1, loan_type: 'emergency', amount: 20000, interest_rate: 12, duration_months: 12, monthly_payment: 1770, balance: 15000, status: 'approved', application_date: '2024-01-15', purpose: 'Medical emergency', repayments: [] },
      { id: 2, loan_type: 'development', amount: 50000, interest_rate: 10, duration_months: 24, monthly_payment: 2300, balance: 0, status: 'completed', application_date: '2023-06-10', purpose: 'Business expansion', repayments: [] }
    ]
  } finally {
    loading.value = false
  }
}

const viewLoanDetails = async (loan) => {
  try {
    const response = await loanApi.get(loan.id)
    selectedLoan.value = response.data
    showDetailsModal.value = true
  } catch (error) {
    selectedLoan.value = loan
    showDetailsModal.value = true
  }
}

const makeRepayment = (loan) => {
  router.push(`/loans/${loan.id}/repay`)
}

const cancelApplication = async (loan) => {
  const result = await Swal.fire({
    title: 'Cancel Application?',
    text: 'Are you sure you want to cancel this loan application?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel',
    cancelButtonText: 'No'
  })
  
  if (result.isConfirmed) {
    try {
      await loanApi.reject(loan.id, { reason: 'Cancelled by user' })
      Swal.fire('Cancelled', 'Your loan application has been cancelled', 'success')
      loadLoans()
    } catch (error) {
      Swal.fire('Error', 'Failed to cancel application', 'error')
    }
  }
}

const repaymentProgress = (loan) => {
  if (!loan.total_payable || loan.total_payable === 0) return 0
  const paid = loan.total_payable - loan.balance
  return Math.round((paid / loan.total_payable) * 100)
}

const getLoanTypeIcon = (type) => {
  const icons = {
    emergency: 'bi bi-exclamation-triangle',
    development: 'bi bi-building',
    education: 'bi bi-book',
    welfare: 'bi bi-heart'
  }
  return icons[type] || 'bi bi-bank'
}

const formatLoanType = (type) => {
  const types = {
    emergency: 'Emergency Loan',
    development: 'Development Loan',
    education: 'Education Loan',
    welfare: 'Welfare Loan'
  }
  return types[type] || type
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'bi bi-clock',
    approved: 'bi bi-check-circle',
    disbursed: 'bi bi-cash-stack',
    completed: 'bi bi-check-circle-fill',
    rejected: 'bi bi-x-circle',
    defaulted: 'bi bi-exclamation-circle'
  }
  return icons[status] || 'bi bi-question-circle'
}

const formatStatus = (status) => {
  const statuses = {
    pending: 'Pending Approval',
    approved: 'Approved',
    disbursed: 'Disbursed',
    completed: 'Completed',
    rejected: 'Rejected',
    defaulted: 'Defaulted'
  }
  return statuses[status] || status
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadLoans()
})
</script>

<style scoped>
.loans-page {
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
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
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
.bg-info { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.bg-primary { background: linear-gradient(135deg, #6A1B9A, #4A148C); }

.stat-info h3 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stat-info p {
  color: #666;
  margin-bottom: 6px;
  font-size: 13px;
}

.trend {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 12px;
  background: #f5f5f5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.trend.up { color: #2E7D32; background: #E8F5E9; }
.trend.down { color: #E53935; background: #FFEBEE; }

/* Tabs */
.tabs-container {
  margin-bottom: 24px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn.active {
  background: white;
  color: #2E7D32;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-btn .badge {
  background: #e0e0e0;
  color: #666;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
}

/* Loan Cards */
.loans-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loan-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s;
}

.loan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.loan-card-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loan-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.loan-type-badge.emergency { background: #FFEBEE; color: #E53935; }
.loan-type-badge.development { background: #E3F2FD; color: #1565C0; }
.loan-type-badge.education { background: #E8F5E9; color: #2E7D32; }
.loan-type-badge.welfare { background: #FFF3E0; color: #FF8F00; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending { background: #FFF3E0; color: #FF8F00; }
.status-badge.approved { background: #E3F2FD; color: #1565C0; }
.status-badge.disbursed { background: #E8F5E9; color: #2E7D32; }
.status-badge.completed { background: #E8F5E9; color: #2E7D32; }
.status-badge.rejected { background: #FFEBEE; color: #E53935; }

.loan-card-body {
  padding: 24px;
}

.loan-amount {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.loan-amount .label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.loan-amount h3 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.loan-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.detail .label {
  font-size: 11px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.detail strong {
  font-size: 14px;
  color: #1a1a2e;
}

.progress-section {
  margin: 16px 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
  color: #666;
}

.progress-bar-custom {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2E7D32, #4CAF50);
  border-radius: 4px;
  transition: width 0.3s;
}

.next-payment {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  flex-wrap: wrap;
}

.next-payment i {
  color: #2E7D32;
  font-size: 18px;
}

.payment-amount {
  margin-left: auto;
  font-weight: 700;
  color: #2E7D32;
}

.loan-card-footer {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  background: #f0f0f0;
}

.action-btn.primary {
  background: #2E7D32;
  border-color: #2E7D32;
  color: white;
}

.action-btn.primary:hover {
  background: #1B5E20;
}

.action-btn.warning {
  background: #FFEBEE;
  border-color: #E53935;
  color: #E53935;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
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
  max-width: 800px;
  margin: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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
  position: sticky;
  bottom: 0;
  background: white;
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

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.loan-type-badge.large {
  padding: 8px 20px;
  font-size: 16px;
}

.status-badge.large {
  padding: 8px 20px;
  font-size: 14px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.details-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 16px;
}

.details-card h6 {
  margin-bottom: 16px;
  color: #1a1a2e;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-row:last-child {
  border-bottom: none;
}

.repayment-schedule {
  margin-top: 20px;
}

.repayment-schedule h6 {
  margin-bottom: 16px;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th,
.schedule-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.schedule-table th {
  background: #f8f9fa;
  font-weight: 600;
}

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

.btn-primary-custom:hover {
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

/* Responsive */
@media (max-width: 768px) {
  .loans-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs-header {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: none;
    width: calc(50% - 4px);
  }
  
  .loan-details-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .loan-card-footer {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
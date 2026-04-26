<template>
  <div class="my-loans-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Loans</h1>
        <p class="page-subtitle">Track and manage your loan applications</p>
      </div>
      <button class="btn-primary-custom" @click="$router.push('/app/loans/apply')">
        <i class="bi bi-plus-lg me-2"></i>Apply for Loan
      </button>
    </div>

    <!-- Summary Cards - Fixed -->
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
          <span class="trend down">Due now</span>
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

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Loans Grid -->
    <div v-else class="loans-grid">
      <div v-for="loan in loans" :key="loan.id" class="loan-card glass-card">
        <!-- Card Header -->
        <div class="loan-card-header">
          <div class="loan-type" :class="loan.loan_type">
            <i :class="getLoanTypeIcon(loan.loan_type)"></i>
            {{ formatLoanType(loan.loan_type) }}
          </div>
          <span :class="['status-badge', loan.status]">
            <i :class="getStatusIcon(loan.status)"></i>
            {{ formatStatus(loan.status) }}
          </span>
        </div>

        <!-- Card Body -->
        <div class="loan-card-body">
          <div class="loan-amount">
            <span class="label">Loan Amount</span>
            <h3>KES {{ formatMoney(loan.amount) }}</h3>
          </div>

          <div class="loan-details">
            <div class="detail-item">
              <i class="bi bi-percent"></i>
              <div>
                <span>Interest Rate</span>
                <strong>{{ loan.interest_rate }}% p.a.</strong>
              </div>
            </div>
            <div class="detail-item">
              <i class="bi bi-calendar-range"></i>
              <div>
                <span>Duration</span>
                <strong>{{ loan.duration_months }} months</strong>
              </div>
            </div>
            <div class="detail-item">
              <i class="bi bi-cash"></i>
              <div>
                <span>Monthly Payment</span>
                <strong>KES {{ formatMoney(loan.monthly_payment) }}</strong>
              </div>
            </div>
            <div class="detail-item">
              <i class="bi bi-piggy-bank"></i>
              <div>
                <span>Balance</span>
                <strong class="text-warning">KES {{ formatMoney(loan.balance) }}</strong>
              </div>
            </div>
          </div>

          <!-- Progress Bar for Active Loans -->
          <div v-if="loan.status === 'approved' || loan.status === 'disbursed'" class="progress-section">
            <div class="progress-label">
              <span>Repayment Progress</span>
              <span>{{ repaymentProgress(loan) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: repaymentProgress(loan) + '%' }"></div>
            </div>
          </div>

          <!-- Next Payment Info -->
          <div v-if="loan.next_payment_date && (loan.status === 'approved' || loan.status === 'disbursed')" class="next-payment">
            <i class="bi bi-calendar-event"></i>
            <div>
              <span>Next Payment Due</span>
              <strong>{{ formatDate(loan.next_payment_date) }}</strong>
            </div>
            <div class="payment-amount">
              KES {{ formatMoney(loan.monthly_payment) }}
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="loan-card-footer">
          <button class="btn-outline-custom" @click="viewLoanDetails(loan)">
            <i class="bi bi-eye"></i> View Details
          </button>
          <button v-if="loan.status === 'approved' || loan.status === 'disbursed'" 
                  class="btn-primary-custom small" @click="makeRepayment(loan)">
            <i class="bi bi-cash-stack"></i> Make Payment
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="loans.length === 0" class="empty-state glass-card">
        <i class="bi bi-inbox fs-1 text-muted"></i>
        <h5 class="mt-3">No Loans Yet</h5>
        <p class="text-muted">You haven't applied for any loans yet.</p>
        <button class="btn-primary-custom mt-2" @click="$router.push('/app/loans/apply')">
          Apply for Your First Loan
        </button>
      </div>
    </div>

    <!-- View Details Modal -->
    <div class="modal" :class="{ 'show': showDetailsModal }" v-if="showDetailsModal">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h5 class="modal-title">Loan Details</h5>
            <button class="btn-close" @click="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" v-if="selectedLoan">
            <div class="details-header">
              <div class="loan-type large" :class="selectedLoan.loan_type">
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
                  <strong>{{ selectedLoan.interest_rate }}% per annum</strong>
                </div>
                <div class="detail-row">
                  <span>Total Payable:</span>
                  <strong>KES {{ formatMoney(selectedLoan.total_payable) }}</strong>
                </div>
                <div class="detail-row">
                  <span>Monthly Payment:</span>
                  <strong>KES {{ formatMoney(selectedLoan.monthly_payment) }}</strong>
                </div>
                <div class="detail-row highlight">
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
                      <th>#</th>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loanApi } from '@/api/loans'
import Swal from 'sweetalert2'

const router = useRouter()
const loans = ref([])
const loading = ref(false)
const showDetailsModal = ref(false)
const selectedLoan = ref(null)

// Stats calculated properly
const stats = ref({
  total_borrowed: 0,
  outstanding_balance: 0,
  active_loans: 0,
  completed_loans: 0
})

const loadLoans = async () => {
  loading.value = true
  try {
    const response = await loanApi.getAll()
    const loanData = response.data.data || []
    loans.value = loanData
    
    // Calculate stats
    stats.value.total_borrowed = loanData.reduce((sum, l) => sum + Number(l.amount || 0), 0)
    stats.value.outstanding_balance = loanData.reduce((sum, l) => sum + Number(l.balance || 0), 0)
    stats.value.active_loans = loanData.filter(l => ['approved', 'disbursed'].includes(l.status)).length
    stats.value.completed_loans = loanData.filter(l => l.status === 'completed').length
  } catch (error) {
    console.error('Failed to load loans:', error)
    // Mock data for demo
    const mockData = [
      { 
        id: 1, 
        loan_type: 'emergency', 
        amount: 20000, 
        interest_rate: 12, 
        duration_months: 12, 
        monthly_payment: 1770, 
        balance: 15000,
        total_payable: 21240,
        status: 'approved', 
        application_date: '2024-01-15', 
        approval_date: '2024-01-18',
        next_payment_date: '2024-05-15',
        purpose: 'Medical emergency',
        repayments: []
      },
      { 
        id: 2, 
        loan_type: 'development', 
        amount: 50000, 
        interest_rate: 10, 
        duration_months: 24, 
        monthly_payment: 2300, 
        balance: 0,
        total_payable: 55200,
        status: 'completed', 
        application_date: '2023-06-10', 
        approval_date: '2023-06-15',
        disbursement_date: '2023-06-20',
        purpose: 'Business expansion',
        repayments: []
      }
    ]
    loans.value = mockData
    
    // Calculate stats from mock data
    stats.value.total_borrowed = mockData.reduce((sum, l) => sum + Number(l.amount || 0), 0)
    stats.value.outstanding_balance = mockData.reduce((sum, l) => sum + Number(l.balance || 0), 0)
    stats.value.active_loans = mockData.filter(l => ['approved', 'disbursed'].includes(l.status)).length
    stats.value.completed_loans = mockData.filter(l => l.status === 'completed').length
  } finally {
    loading.value = false
  }
}

const viewLoanDetails = async (loan) => {
  try {
    const response = await loanApi.get(loan.id)
    selectedLoan.value = response.data
  } catch (error) {
    selectedLoan.value = loan
  }
  showDetailsModal.value = true
}

const makeRepayment = (loan) => {
  router.push(`/app/loans/${loan.id}/repay`)
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
.my-loans-page {
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
  padding: 2px 8px;
  border-radius: 12px;
  background: #f5f5f5;
  display: inline-block;
}

.trend.up { color: #2E7D32; background: #E8F5E9; }
.trend.down { color: #E53935; background: #FFEBEE; }

/* Loans Grid */
.loans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.loan-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.loan-card-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loan-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.loan-type.emergency { background: #FFEBEE; color: #E53935; }
.loan-type.development { background: #E3F2FD; color: #1565C0; }
.loan-type.education { background: #E8F5E9; color: #2E7D32; }
.loan-type.welfare { background: #FFF3E0; color: #FF8F00; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.pending { background: #FFF3E0; color: #FF8F00; }
.status-badge.approved { background: #E3F2FD; color: #1565C0; }
.status-badge.disbursed { background: #E8F5E9; color: #2E7D32; }
.status-badge.completed { background: #E8F5E9; color: #2E7D32; }
.status-badge.rejected { background: #FFEBEE; color: #E53935; }

.loan-card-body {
  padding: 20px;
}

.loan-amount {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.loan-amount .label {
  font-size: 11px;
  color: #999;
  display: block;
  margin-bottom: 2px;
}

.loan-amount h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.loan-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item i {
  font-size: 18px;
  color: #2E7D32;
  width: 28px;
}

.detail-item div {
  display: flex;
  flex-direction: column;
}

.detail-item span {
  font-size: 10px;
  color: #999;
}

.detail-item strong {
  font-size: 13px;
  color: #1a1a2e;
}

.progress-section {
  margin: 16px 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 6px;
  color: #666;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2E7D32, #4CAF50);
  border-radius: 3px;
  transition: width 0.3s;
}

.next-payment {
  background: #f8f9fa;
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  flex-wrap: wrap;
}

.next-payment i {
  color: #2E7D32;
  font-size: 16px;
}

.next-payment div {
  flex: 1;
}

.next-payment span {
  display: block;
  font-size: 10px;
  color: #999;
}

.next-payment strong {
  font-size: 12px;
}

.payment-amount {
  font-weight: 700;
  color: #2E7D32;
}

.loan-card-footer {
  padding: 14px 20px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

.btn-outline-custom {
  flex: 1;
  background: white;
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-outline-custom:hover {
  background: #f0f0f0;
}

.btn-primary-custom {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.btn-primary-custom.small {
  flex: 1;
  justify-content: center;
}

.btn-primary-custom:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
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
  max-width: 700px;
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
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.loan-type.large {
  padding: 6px 16px;
  font-size: 14px;
}

.status-badge.large {
  padding: 6px 16px;
  font-size: 13px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.details-card {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 16px;
}

.details-card h6 {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.highlight {
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid #e0e0e0;
  border-bottom: none;
}

.repayment-schedule h6 {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.schedule-table th,
.schedule-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.schedule-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.btn-secondary-custom {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 8px 20px;
  border-radius: 10px;
  cursor: pointer;
}

.text-warning {
  color: #FF8F00 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .my-loans-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .loans-grid {
    grid-template-columns: 1fr;
  }
  
  .loan-details {
    grid-template-columns: 1fr;
  }
  
  .loan-card-footer {
    flex-direction: column;
  }
  
  
  .btn-outline-custom,
  .btn-primary-custom.small {
    width: 100%;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .loan-card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
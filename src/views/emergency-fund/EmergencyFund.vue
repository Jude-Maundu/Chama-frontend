<template>
  <div class="emergency-fund-container container">
    <div class="header flex-between gap-4 flex-col-mobile">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Emergency Fund</h1>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-secondary">
          <i class="fas fa-sync"></i> <span class="hide-mobile">Refresh</span>
        </button>
      </div>
    </div>

    <!-- Fund Status -->
    <div class="fund-status-card card margin-y-4">
      <div class="status-header flex-between">
        <h2 class="text-xl-desktop text-lg-tablet text-base">Fund Status</h2>
        <span :class="['status-badge', fund?.status]">{{ formatStatus(fund?.status) }}</span>
      </div>

      <div class="status-grid grid grid-cols-2-mobile grid-cols-4-tablet grid-cols-4-desktop gap-4 margin-y-4">
        <div class="status-item">
          <span class="label text-sm text-gray-600">Total Fund Balance</span>
          <span class="value text-lg-desktop text-base-tablet text-base">{{ formatCurrency(fund?.total_balance) }}</span>
        </div>
        <div class="status-item">
          <span class="label text-sm text-gray-600">Target Amount</span>
          <span class="value text-lg-desktop text-base-tablet text-base">{{ formatCurrency(fund?.target_amount) }}</span>
        </div>
        <div class="status-item">
          <span class="label text-sm text-gray-600">Number of Contributors</span>
          <span class="value text-lg-desktop text-base-tablet text-base">{{ fund?.contributors_count }}</span>
        </div>
        <div class="status-item">
          <span class="label text-sm text-gray-600">Fund Utilization</span>
          <span class="value text-lg-desktop text-base-tablet text-base">{{ fundUtilization }}%</span>
        </div>
      </div>

      <div class="progress-bar-large">
        <div class="progress" :style="{ width: fundUtilization + '%' }"></div>
      </div>

      <div class="button-group">
        <button @click="showAddFundsModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i> Add Funds
        </button>
        <button @click="showRequestWithdrawalModal = true" class="btn btn-warning">
          <i class="fas fa-arrow-up"></i> Request Withdrawal
        </button>
      </div>
    </div>

    <!-- Pending Withdrawals (for admins) -->
    <div v-if="userIsAdmin" class="admin-section">
      <h3>Pending Withdrawal Requests</h3>
      <div v-if="pendingWithdrawals.length === 0" class="empty-state">
        <p>No pending withdrawal requests</p>
      </div>

      <div v-for="withdrawal in pendingWithdrawals" :key="withdrawal.id" class="withdrawal-request">
        <div class="request-header">
          <div>
            <h4>{{ withdrawal.member_name }}</h4>
            <p class="request-date">{{ formatDate(withdrawal.created_at) }}</p>
          </div>
          <div class="request-amount">
            {{ formatCurrency(withdrawal.amount) }}
          </div>
        </div>

        <div class="request-reason">
          <strong>Reason:</strong> {{ withdrawal.reason }}
        </div>

        <div class="admin-actions">
          <button @click="approveWithdrawal(withdrawal.id)" class="btn btn-success btn-sm">
            <i class="fas fa-check"></i> Approve
          </button>
          <button @click="rejectWithdrawal(withdrawal.id)" class="btn btn-danger btn-sm">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      </div>
    </div>

    <!-- My Withdrawal Requests -->
    <div class="my-requests-section">
      <h3>My Withdrawal Requests</h3>

      <div v-if="myWithdrawals.length === 0" class="empty-state">
        <p>You have not made any withdrawal requests</p>
      </div>

      <div v-for="withdrawal in myWithdrawals" :key="withdrawal.id" class="withdrawal-card">
        <div class="withdrawal-header">
          <div>
            <h4>Request ID: {{ withdrawal.id }}</h4>
            <p class="date">{{ formatDate(withdrawal.created_at) }}</p>
          </div>
          <span :class="['status-badge', 'withdrawal-' + withdrawal.status]">
            {{ formatWithdrawalStatus(withdrawal.status) }}
          </span>
        </div>

        <div class="withdrawal-details">
          <div class="detail">
            <span class="label">Requested Amount</span>
            <span class="value">{{ formatCurrency(withdrawal.amount) }}</span>
          </div>
          <div class="detail">
            <span class="label">Reason</span>
            <span class="value">{{ withdrawal.reason }}</span>
          </div>
          <div v-if="withdrawal.status === 'approved'" class="detail">
            <span class="label">Approved Date</span>
            <span class="value">{{ formatDate(withdrawal.approved_at) }}</span>
          </div>
          <div v-if="withdrawal.status === 'rejected'" class="detail">
            <span class="label">Rejection Reason</span>
            <span class="value">{{ withdrawal.rejection_reason }}</span>
          </div>
        </div>

        <div v-if="withdrawal.status === 'approved'" class="withdrawal-actions">
          <button @click="processWithdrawal(withdrawal.id)" class="btn btn-success">
            <i class="fas fa-arrow-right"></i> Process Withdrawal
          </button>
        </div>
      </div>
    </div>

    <!-- Add Funds Modal -->
    <div v-if="showAddFundsModal" class="modal-overlay" @click="closeAddFundsModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Add Funds to Emergency Fund</h2>
          <button @click="closeAddFundsModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitAddFunds">
            <div class="form-group">
              <label>Amount to Contribute *</label>
              <input
                v-model.number="addFundsForm.amount"
                type="number"
                class="form-control"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div class="form-group">
              <label>Payment Method *</label>
              <select v-model="addFundsForm.payment_method" class="form-control" required>
                <option value="">Select Payment Method</option>
                <option value="mpesa">M-Pesa</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea
                v-model="addFundsForm.notes"
                class="form-control"
                placeholder="Additional notes"
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeAddFundsModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Add Funds
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Request Withdrawal Modal -->
    <div v-if="showRequestWithdrawalModal" class="modal-overlay" @click="closeRequestWithdrawalModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Request Emergency Fund Withdrawal</h2>
          <button @click="closeRequestWithdrawalModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitWithdrawalRequest">
            <div class="form-group">
              <label>Amount to Withdraw *</label>
              <input
                v-model.number="withdrawalForm.amount"
                type="number"
                class="form-control"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
              <small>Available Balance: {{ formatCurrency(fund?.total_balance) }}</small>
            </div>

            <div class="form-group">
              <label>Reason for Withdrawal *</label>
              <textarea
                v-model="withdrawalForm.reason"
                class="form-control"
                placeholder="Explain why you need emergency funds"
                rows="4"
                required
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeRequestWithdrawalModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Request Withdrawal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Loading/Error States -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading emergency fund information...</p>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { emergencyFundApi } from '@/api/emergencyFund'

export default {
  name: 'EmergencyFund',
  setup() {
    const fund = ref(null)
    const loading = ref(false)
    const error = ref('')
    const successMessage = ref('')
    const showAddFundsModal = ref(false)
    const showRequestWithdrawalModal = ref(false)
    const pendingWithdrawals = ref([])
    const myWithdrawals = ref([])
    const userIsAdmin = ref(false)

    const currentChamaId = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.current_chama_id || 1
    })

    const addFundsForm = ref({
      amount: 0,
      payment_method: '',
      notes: ''
    })

    const withdrawalForm = ref({
      amount: 0,
      reason: ''
    })

    const fundUtilization = computed(() => {
      if (!fund.value?.target_amount || fund.value.target_amount === 0) return 0
      return Math.round((fund.value.total_balance / fund.value.target_amount) * 100)
    })

    const loadFundStatus = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await emergencyFundApi.get(currentChamaId.value)
        fund.value = response.data
        
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        userIsAdmin.value = user.roles?.includes('chama-admin') || user.roles?.includes('super-admin')
        
        if (userIsAdmin.value) {
          loadPendingWithdrawals()
        }
        loadMyWithdrawals()
      } catch (err) {
        error.value = 'Failed to load emergency fund information'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const loadPendingWithdrawals = async () => {
      try {
        const response = await emergencyFundApi.getPendingWithdrawals(currentChamaId.value)
        pendingWithdrawals.value = response.data
      } catch (err) {
        console.error('Failed to load pending withdrawals', err)
      }
    }

    const loadMyWithdrawals = async () => {
      try {
        // This would need a new endpoint to get user's withdrawals
        // For now, we'll leave it empty
        myWithdrawals.value = []
      } catch (err) {
        console.error('Failed to load withdrawals', err)
      }
    }

    const submitAddFunds = async () => {
      error.value = ''
      try {
        await emergencyFundApi.addFunds(currentChamaId.value, addFundsForm.value)
        successMessage.value = 'Funds added successfully!'
        setTimeout(() => successMessage.value = '', 3000)
        closeAddFundsModal()
        loadFundStatus()
      } catch (err) {
        error.value = 'Failed to add funds'
        console.error(err)
      }
    }

    const submitWithdrawalRequest = async () => {
      error.value = ''
      try {
        await emergencyFundApi.requestWithdrawal(currentChamaId.value, withdrawalForm.value)
        successMessage.value = 'Withdrawal request submitted successfully!'
        setTimeout(() => successMessage.value = '', 3000)
        closeRequestWithdrawalModal()
        loadFundStatus()
      } catch (err) {
        error.value = 'Failed to submit withdrawal request'
        console.error(err)
      }
    }

    const approveWithdrawal = async (withdrawalId) => {
      if (!confirm('Approve this withdrawal request?')) return
      try {
        await emergencyFundApi.approveWithdrawal(currentChamaId.value, withdrawalId, {})
        successMessage.value = 'Withdrawal approved!'
        setTimeout(() => successMessage.value = '', 3000)
        loadPendingWithdrawals()
      } catch (err) {
        error.value = 'Failed to approve withdrawal'
        console.error(err)
      }
    }

    const rejectWithdrawal = async (withdrawalId) => {
      const reason = prompt('Reason for rejection:')
      if (reason === null) return
      
      try {
        await emergencyFundApi.rejectWithdrawal(currentChamaId.value, withdrawalId, { rejection_reason: reason })
        successMessage.value = 'Withdrawal rejected!'
        setTimeout(() => successMessage.value = '', 3000)
        loadPendingWithdrawals()
      } catch (err) {
        error.value = 'Failed to reject withdrawal'
        console.error(err)
      }
    }

    const processWithdrawal = async (withdrawalId) => {
      if (!confirm('Process this withdrawal?')) return
      try {
        await emergencyFundApi.processWithdrawal(currentChamaId.value, withdrawalId)
        successMessage.value = 'Withdrawal processed successfully!'
        setTimeout(() => successMessage.value = '', 3000)
        loadMyWithdrawals()
      } catch (err) {
        error.value = 'Failed to process withdrawal'
        console.error(err)
      }
    }

    const refreshData = () => {
      loadFundStatus()
    }

    const closeAddFundsModal = () => {
      showAddFundsModal.value = false
      addFundsForm.value = {
        amount: 0,
        payment_method: '',
        notes: ''
      }
    }

    const closeRequestWithdrawalModal = () => {
      showRequestWithdrawalModal.value = false
      withdrawalForm.value = {
        amount: 0,
        reason: ''
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
      }).format(amount || 0)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatStatus = (status) => {
      const statuses = {
        active: 'Active',
        inactive: 'Inactive',
        closed: 'Closed'
      }
      return statuses[status] || status
    }

    const formatWithdrawalStatus = (status) => {
      const statuses = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        processed: 'Processed'
      }
      return statuses[status] || status
    }

    onMounted(() => {
      loadFundStatus()
    })

    return {
      fund,
      loading,
      error,
      successMessage,
      showAddFundsModal,
      showRequestWithdrawalModal,
      pendingWithdrawals,
      myWithdrawals,
      userIsAdmin,
      addFundsForm,
      withdrawalForm,
      fundUtilization,
      submitAddFunds,
      submitWithdrawalRequest,
      approveWithdrawal,
      rejectWithdrawal,
      processWithdrawal,
      refreshData,
      closeAddFundsModal,
      closeRequestWithdrawalModal,
      formatCurrency,
      formatDate,
      formatStatus,
      formatWithdrawalStatus
    }
  }
}
</script>

<style scoped>
.emergency-fund-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Fund Status Card */
.fund-status-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-header h2 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.active {
  background: #c8e6c9;
  color: #1b5e20;
}

.status-badge.inactive {
  background: #f3e5f5;
  color: #4a148c;
}

.status-badge.closed {
  background: #ffccbc;
  color: #bf360c;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.status-item {
  display: flex;
  flex-direction: column;
}

.status-item .label {
  color: #999;
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
}

.status-item .value {
  color: #2c5aa0;
  font-size: 1.5rem;
  font-weight: bold;
}

.progress-bar-large {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.progress-bar-large .progress {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  transition: width 0.3s ease;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Sections */
.admin-section,
.my-requests-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.admin-section h3,
.my-requests-section h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

/* Withdrawal Request Cards */
.withdrawal-request {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #ff9800;
  margin-bottom: 1rem;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.request-header h4 {
  margin: 0;
  color: #333;
}

.request-date {
  margin: 0.25rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

.request-amount {
  font-size: 1.3rem;
  font-weight: bold;
  color: #ff9800;
}

.request-reason {
  margin: 0.75rem 0;
  color: #666;
}

.admin-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Withdrawal Cards */
.withdrawal-card {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #e0e0e0;
}

.withdrawal-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.withdrawal-header h4 {
  margin: 0;
  color: #333;
}

.date {
  margin: 0.25rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

.withdrawal-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.withdrawal-badge.withdrawal-pending {
  background: #fff3cd;
  color: #856404;
}

.withdrawal-badge.withdrawal-approved {
  background: #d4edda;
  color: #155724;
}

.withdrawal-badge.withdrawal-rejected {
  background: #f8d7da;
  color: #721c24;
}

.withdrawal-badge.withdrawal-processed {
  background: #cce5ff;
  color: #004085;
}

.withdrawal-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail {
  display: flex;
  flex-direction: column;
}

.detail .label {
  color: #999;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.detail .value {
  color: #333;
  font-weight: 500;
}

.withdrawal-actions {
  display: flex;
  gap: 0.5rem;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #2c5aa0;
  color: white;
}

.btn-primary:hover {
  background: #1e4277;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-warning {
  background: #ff9800;
  color: white;
}

.btn-warning:hover {
  background: #e68900;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

/* Forms */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.35rem;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-danger {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

/* Loading */
.loading {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .emergency-fund-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
    justify-content: center;
  }

  .modal {
    width: 95%;
  }
}
</style>

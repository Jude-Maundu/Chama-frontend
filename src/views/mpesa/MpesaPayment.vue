<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">M-Pesa Integration</h1>
        <p class="page-subtitle">Manage M-Pesa payments and transactions</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="action-card" @click="showStkPushModal = true">
          <div class="action-icon">
            <i class="bi bi-phone"></i>
          </div>
          <h5>STK Push</h5>
          <p>Initiate payment request</p>
        </div>
      </div>
      <div class="col-md-3">
        <div class="action-card" @click="checkBalance">
          <div class="action-icon">
            <i class="bi bi-wallet2"></i>
          </div>
          <h5>Check Balance</h5>
          <p>View account balance</p>
        </div>
      </div>
      <div class="col-md-3">
        <div class="action-card" @click="showB2cModal = true">
          <div class="action-icon">
            <i class="bi bi-send"></i>
          </div>
          <h5>B2C Payment</h5>
          <p>Send money to customer</p>
        </div>
      </div>
      <div class="col-md-3">
        <div class="action-card" @click="loadTransactions">
          <div class="action-icon">
            <i class="bi bi-receipt"></i>
          </div>
          <h5>Transactions</h5>
          <p>View payment history</p>
        </div>
      </div>
    </div>

    <!-- Account Balance -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5>Account Balance</h5>
          </div>
          <div class="card-body">
            <div v-if="loadingBalance" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="balance">
              <div class="balance-item">
                <span class="balance-label">Working Balance</span>
                <span class="balance-value">KES {{ formatCurrency(balance.working_balance) }}</span>
              </div>
              <div class="balance-item">
                <span class="balance-label">Float Available</span>
                <span class="balance-value">KES {{ formatCurrency(balance.float_available) }}</span>
              </div>
              <div class="balance-item">
                <span class="balance-label">Utility Balance</span>
                <span class="balance-value">KES {{ formatCurrency(balance.utility_balance) }}</span>
              </div>
            </div>
            <div v-else>
              <p class="text-muted">Click "Check Balance" to load account information</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5>Recent Transactions</h5>
          </div>
          <div class="card-body">
            <div v-if="loadingTransactions" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="transactions.length > 0">
              <div v-for="transaction in transactions.slice(0, 5)" :key="transaction.id" class="transaction-item">
                <div class="transaction-info">
                  <div class="transaction-type">{{ transaction.type }}</div>
                  <div class="transaction-amount" :class="transaction.amount > 0 ? 'credit' : 'debit'">
                    {{ transaction.amount > 0 ? '+' : '' }}KES {{ formatCurrency(Math.abs(transaction.amount)) }}
                  </div>
                </div>
                <div class="transaction-date">{{ formatDate(transaction.created_at) }}</div>
              </div>
            </div>
            <div v-else>
              <p class="text-muted">No recent transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STK Push Modal -->
    <div class="modal fade show" v-if="showStkPushModal" @click="closeModals">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Initiate STK Push</h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="initiateStkPush">
              <div class="mb-3">
                <label class="form-label">Phone Number *</label>
                <input type="tel" v-model="stkForm.phone" class="form-control" placeholder="254XXXXXXXXX" required>
                <small class="form-text text-muted">Format: 254XXXXXXXXX (no spaces or +)</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Amount (KES) *</label>
                <input type="number" v-model="stkForm.amount" class="form-control" min="1" step="0.01" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Account Reference</label>
                <input type="text" v-model="stkForm.account_reference" class="form-control" placeholder="Optional reference">
              </div>
              <div class="mb-3">
                <label class="form-label">Transaction Description</label>
                <input type="text" v-model="stkForm.transaction_desc" class="form-control" placeholder="Payment description">
              </div>
              <button type="submit" class="btn btn-primary" :disabled="stkLoading">
                {{ stkLoading ? 'Sending...' : 'Send STK Push' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- B2C Payment Modal -->
    <div class="modal fade show" v-if="showB2cModal" @click="closeModals">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">B2C Payment</h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="initiateB2cPayment">
              <div class="mb-3">
                <label class="form-label">Phone Number *</label>
                <input type="tel" v-model="b2cForm.phone" class="form-control" placeholder="254XXXXXXXXX" required>
                <small class="form-text text-muted">Format: 254XXXXXXXXX (no spaces or +)</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Amount (KES) *</label>
                <input type="number" v-model="b2cForm.amount" class="form-control" min="1" step="0.01" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Remarks</label>
                <input type="text" v-model="b2cForm.remarks" class="form-control" placeholder="Payment remarks">
              </div>
              <div class="mb-3">
                <label class="form-label">Occasion</label>
                <input type="text" v-model="b2cForm.occasion" class="form-control" placeholder="Payment occasion">
              </div>
              <button type="submit" class="btn btn-success" :disabled="b2cLoading">
                {{ b2cLoading ? 'Sending...' : 'Send Payment' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="message" class="alert" :class="messageType">
      {{ message }}
    </div>

    <div class="modal-backdrop fade show" v-if="showStkPushModal || showB2cModal"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { mpesaApi } from '@/api/mpesa'
import Swal from 'sweetalert2'

const balance = ref(null)
const transactions = ref([])
const loadingBalance = ref(false)
const loadingTransactions = ref(false)
const showStkPushModal = ref(false)
const showB2cModal = ref(false)
const stkLoading = ref(false)
const b2cLoading = ref(false)
const message = ref('')
const messageType = ref('')

const stkForm = ref({
  phone: '',
  amount: '',
  account_reference: '',
  transaction_desc: ''
})

const b2cForm = ref({
  phone: '',
  amount: '',
  remarks: '',
  occasion: ''
})

const checkBalance = async () => {
  loadingBalance.value = true
  try {
    const response = await mpesaApi.getBalance()
    balance.value = response.data
    message.value = 'Balance loaded successfully'
    messageType.value = 'success'
  } catch (error) {
    console.error('Failed to check balance:', error)
    message.value = 'Failed to load balance'
    messageType.value = 'error'
  } finally {
    loadingBalance.value = false
  }
}

const loadTransactions = async () => {
  loadingTransactions.value = true
  try {
    // Assuming there's an endpoint for transactions, or we can use reconciliation
    const response = await mpesaApi.reconcile()
    transactions.value = response.data.transactions || []
  } catch (error) {
    console.error('Failed to load transactions:', error)
    message.value = 'Failed to load transactions'
    messageType.value = 'error'
  } finally {
    loadingTransactions.value = false
  }
}

const initiateStkPush = async () => {
  stkLoading.value = true
  try {
    const response = await mpesaApi.initiateStkPush(stkForm.value)
    message.value = `STK Push initiated successfully. Checkout Request ID: ${response.data.checkout_request_id}`
    messageType.value = 'success'
    closeModals()
    resetStkForm()
  } catch (error) {
    console.error('Failed to initiate STK push:', error)
    message.value = error.response?.data?.message || 'Failed to initiate STK push'
    messageType.value = 'error'
  } finally {
    stkLoading.value = false
  }
}

const initiateB2cPayment = async () => {
  b2cLoading.value = true
  try {
    const response = await mpesaApi.initiateB2c(b2cForm.value)
    message.value = 'B2C payment initiated successfully'
    messageType.value = 'success'
    closeModals()
    resetB2cForm()
  } catch (error) {
    console.error('Failed to initiate B2C payment:', error)
    message.value = error.response?.data?.message || 'Failed to initiate B2C payment'
    messageType.value = 'error'
  } finally {
    b2cLoading.value = false
  }
}

const closeModals = () => {
  showStkPushModal.value = false
  showB2cModal.value = false
  resetStkForm()
  resetB2cForm()
}

const resetStkForm = () => {
  stkForm.value = {
    phone: '',
    amount: '',
    account_reference: '',
    transaction_desc: ''
  }
}

const resetB2cForm = () => {
  b2cForm.value = {
    phone: '',
    amount: '',
    remarks: '',
    occasion: ''
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount).replace('KES', '').trim()
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

// Auto-clear messages after 5 seconds
watch(message, (newMessage) => {
  if (newMessage) {
    setTimeout(() => {
      message.value = ''
    }, 5000)
  }
})

onMounted(() => {
  // Optionally load balance on mount
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2E7D32;
}

.page-subtitle {
  color: #666;
  margin: 0.5rem 0 0 0;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.5rem;
}

.action-card h5 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #333;
}

.action-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.card-header {
  background: #F8F9FA;
  border-bottom: 1px solid #E9ECEF;
  padding: 1.25rem 1.5rem;
  border-radius: 12px 12px 0 0 !important;
}

.card-header h5 {
  margin: 0;
  font-weight: 600;
  color: #333;
}

.card-body {
  padding: 1.5rem;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #F0F0F0;
}

.balance-item:last-child {
  border-bottom: none;
}

.balance-label {
  font-weight: 500;
  color: #555;
}

.balance-value {
  font-weight: 700;
  color: #2E7D32;
  font-size: 1.1rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #F0F0F0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  display: flex;
  flex-direction: column;
}

.transaction-type {
  font-weight: 500;
  color: #333;
  text-transform: capitalize;
}

.transaction-amount {
  font-weight: 600;
  font-size: 0.9rem;
}

.transaction-amount.credit {
  color: #2E7D32;
}

.transaction-amount.debit {
  color: #D32F2F;
}

.transaction-date {
  color: #666;
  font-size: 0.8rem;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: none;
}

.alert.success {
  background: #D4EDDA;
  color: #155724;
}

.alert.error {
  background: #F8D7DA;
  color: #721C24;
}

.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-header {
  border-bottom: 1px solid #E9ECEF;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.form-control {
  border: 2px solid #E9ECEF;
  border-radius: 8px;
  padding: 0.75rem;
}

.form-control:focus {
  border-color: #2E7D32;
  box-shadow: 0 0 0 0.2rem rgba(46, 125, 50, 0.25);
}

.btn-primary {
  background: #2E7D32;
  border-color: #2E7D32;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover {
  background: #1B5E20;
  border-color: #1B5E20;
}

.btn-success {
  background: #2E7D32;
  border-color: #2E7D32;
  padding: 0.75rem 1.5rem;
}

.btn-success:hover {
  background: #1B5E20;
  border-color: #1B5E20;
}

@media (max-width: 768px) {
  .action-card {
    margin-bottom: 1rem;
  }
}
</style>

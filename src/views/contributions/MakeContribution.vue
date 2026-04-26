<template>
  <div class="make-contribution">
    <div class="page-header">
      <div>
        <h1 class="page-title">Make Contribution</h1>
        <p class="page-subtitle">Record your monthly contribution or pay via M-Pesa</p>
      </div>
      <router-link to="/app/contributions/history" class="btn-outline-custom">
        <i class="bi bi-clock-history me-2"></i>View History
      </router-link>
    </div>

    <div class="row g-4">
      <!-- Contribution Form -->
      <div class="col-lg-6">
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon">
              <i class="bi bi-cash-stack"></i>
            </div>
            <h5 class="mb-0">Record Contribution</h5>
          </div>
          <div class="card-body-custom">
            <form @submit.prevent="submitContribution">
              <div class="form-group">
                <label class="form-label">Amount (KES)</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-currency-dollar"></i>
                  <input type="number" 
                         class="form-control-custom" 
                         v-model="form.amount" 
                         placeholder="Enter amount"
                         required 
                         min="100">
                </div>
                <small class="text-muted">Minimum contribution: KES 100</small>
              </div>

              <div class="form-group">
                <label class="form-label">Payment Method</label>
                <div class="method-options">
                  <label class="method-option" :class="{ active: form.payment_method === 'cash' }">
                    <input type="radio" value="cash" v-model="form.payment_method">
                    <i class="bi bi-cash"></i>
                    <span>Cash</span>
                  </label>
                  <label class="method-option" :class="{ active: form.payment_method === 'mpesa' }">
                    <input type="radio" value="mpesa" v-model="form.payment_method">
                    <i class="bi bi-phone"></i>
                    <span>M-Pesa</span>
                  </label>
                  <label class="method-option" :class="{ active: form.payment_method === 'bank' }">
                    <input type="radio" value="bank" v-model="form.payment_method">
                    <i class="bi bi-bank"></i>
                    <span>Bank Transfer</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Payment Date</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-calendar3"></i>
                  <input type="date" class="form-control-custom" v-model="form.payment_date">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Notes (Optional)</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-pencil"></i>
                  <textarea class="form-control-custom" v-model="form.notes" rows="3" placeholder="Any additional notes..."></textarea>
                </div>
              </div>

              <button type="submit" class="btn-primary-custom w-100" :disabled="submitting">
                <i v-if="submitting" class="bi bi-spinner bi-spin me-2"></i>
                <i v-else class="bi bi-check-circle me-2"></i>
                {{ submitting ? 'Processing...' : 'Submit Contribution' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Recent Contributions & M-Pesa -->
      <div class="col-lg-6">
        <!-- M-Pesa Express Card -->
        <div class="glass-card mb-4">
          <div class="card-header-custom">
            <div class="header-icon" style="background: linear-gradient(135deg, #1565C0, #0D47A1);">
              <i class="bi bi-phone"></i>
            </div>
            <h5 class="mb-0">M-Pesa Express</h5>
          </div>
          <div class="card-body-custom">
            <div class="mpesa-info">
              <i class="bi bi-info-circle-fill"></i>
              <span>Pay instantly using M-Pesa STK Push. Enter your phone number and amount.</span>
            </div>
            <form @submit.prevent="payWithMpesa">
              <div class="form-group">
                <label class="form-label">M-Pesa Number</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-phone"></i>
                  <input type="tel" 
                         class="form-control-custom" 
                         v-model="mpesaForm.phone" 
                         placeholder="254712345678"
                         required>
                </div>
                <small class="text-muted">Format: 254XXXXXXXXX (e.g., 254712345678)</small>
              </div>

              <div class="form-group">
                <label class="form-label">Amount (KES)</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-currency-dollar"></i>
                  <input type="number" 
                         class="form-control-custom" 
                         v-model="mpesaForm.amount" 
                         placeholder="Enter amount"
                         required 
                         min="10">
                </div>
              </div>

              <button type="submit" class="btn-mpesa w-100" :disabled="mpesaLoading">
                <i v-if="mpesaLoading" class="bi bi-spinner bi-spin me-2"></i>
                <i v-else class="bi bi-shield-check me-2"></i>
                {{ mpesaLoading ? 'Processing...' : 'Pay with M-Pesa' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Recent Contributions List -->
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon" style="background: linear-gradient(135deg, #FF8F00, #E65100);">
              <i class="bi bi-clock-history"></i>
            </div>
            <h5 class="mb-0">Recent Contributions</h5>
            <router-link to="/app/contributions/history" class="link-small">View All</router-link>
          </div>
          <div class="card-body-custom p-0">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" style="width: 30px; height: 30px;"></div>
            </div>
            <div v-else class="recent-list">
              <div v-for="c in recentContributions" :key="c.id" class="recent-item">
                <div class="recent-icon" :class="c.payment_method">
                  <i :class="getMethodIcon(c.payment_method)"></i>
                </div>
                <div class="recent-details">
                  <div class="recent-amount">KES {{ formatMoney(c.total_amount || c.amount) }}</div>
                  <div class="recent-date">{{ formatDate(c.payment_date) }}</div>
                </div>
                <div class="recent-status">
                  <span :class="['status-badge', c.status]">{{ c.status }}</span>
                </div>
              </div>
              <div v-if="recentContributions.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-4"></i>
                <p class="mb-0 mt-2">No contributions yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal" :class="{ 'show': showSuccessModal }" v-if="showSuccessModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-body text-center p-4">
            <div class="success-icon">
              <i class="bi bi-check-lg"></i>
            </div>
            <h4 class="mt-3">Contribution Successful!</h4>
            <p class="text-muted">Your contribution has been recorded successfully.</p>
            <button class="btn-primary-custom mt-3" @click="closeSuccessModal">Continue</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showSuccessModal"></div>

    <!-- M-Pesa STK Push Modal -->
    <div class="modal" :class="{ 'show': showMpesaModal }" v-if="showMpesaModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-body text-center p-4">
            <div class="mpesa-pulse">
              <i class="bi bi-phone"></i>
            </div>
            <h4 class="mt-3">STK Push Sent!</h4>
            <p class="text-muted">Check your phone for the M-Pesa prompt. Enter your PIN to complete payment.</p>
            <div class="mpesa-instructions">
              <small>1. Enter M-Pesa PIN</small>
              <small>2. Confirm payment</small>
              <small>3. Wait for confirmation</small>
            </div>
            <button class="btn-secondary-custom mt-3" @click="closeMpesaModal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showMpesaModal"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { contributionApi } from '@/api/contributions'

const router = useRouter()
const submitting = ref(false)
const mpesaLoading = ref(false)
const loading = ref(false)
const showSuccessModal = ref(false)
const showMpesaModal = ref(false)

const form = ref({ 
  amount: '', 
  payment_method: 'cash',
  payment_date: new Date().toISOString().split('T')[0],
  notes: ''
})

const mpesaForm = ref({
  phone: '',
  amount: ''
})

const recentContributions = ref([])

const loadRecentContributions = async () => {
  loading.value = true
  try {
    const response = await contributionApi.getAll({ per_page: 5 })
    recentContributions.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load recent contributions:', error)
  } finally {
    loading.value = false
  }
}

const submitContribution = async () => {
  if (!form.value.amount || form.value.amount < 100) {
    Swal.fire('Error', 'Please enter a valid amount (minimum KES 100)', 'error')
    return
  }

  submitting.value = true
  try {
    await contributionApi.create(form.value)
    showSuccessModal.value = true
    form.value.amount = ''
    form.value.notes = ''
    loadRecentContributions()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to record contribution', 'error')
  } finally {
    submitting.value = false
  }
}

const payWithMpesa = async () => {
  if (!mpesaForm.value.phone || !mpesaForm.value.amount) {
    Swal.fire('Error', 'Please enter both phone number and amount', 'error')
    return
  }

  if (!mpesaForm.value.phone.match(/^254[0-9]{9}$/)) {
    Swal.fire('Error', 'Please enter a valid M-Pesa number (Format: 254XXXXXXXXX)', 'error')
    return
  }

  mpesaLoading.value = true
  try {
    await contributionApi.mpesaPay(mpesaForm.value)
    showMpesaModal.value = true
    mpesaForm.value.phone = ''
    mpesaForm.value.amount = ''
    
    // Refresh recent contributions after delay
    setTimeout(() => {
      loadRecentContributions()
    }, 10000)
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to initiate M-Pesa payment', 'error')
  } finally {
    mpesaLoading.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/app/contributions/history')
}

const closeMpesaModal = () => {
  showMpesaModal.value = false
}

const getMethodIcon = (method) => {
  const icons = {
    mpesa: 'bi bi-phone',
    cash: 'bi bi-cash',
    bank: 'bi bi-bank'
  }
  return icons[method] || 'bi bi-credit-card'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

onMounted(() => {
  loadRecentContributions()
})
</script>

<style scoped>
.make-contribution {
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

/* Glass Card */
.glass-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.glass-card:hover {
  transform: translateY(-4px);
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
  padding: 24px;
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
  font-size: 16px;
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

/* Method Options */
.method-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.method-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-option input {
  display: none;
}

.method-option i {
  font-size: 28px;
  color: #999;
}

.method-option span {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.method-option.active {
  border-color: #2E7D32;
  background: rgba(46, 125, 50, 0.05);
}

.method-option.active i {
  color: #2E7D32;
}

.method-option.active span {
  color: #2E7D32;
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
  justify-content: center;
}

.btn-primary-custom:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
}

.btn-primary-custom:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-outline-custom {
  background: transparent;
  border: 2px solid #2E7D32;
  color: #2E7D32;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
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

.btn-mpesa {
  background: linear-gradient(135deg, #1565C0, #0D47A1);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-mpesa:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(21, 101, 192, 0.3);
}

.btn-secondary-custom {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}

/* M-Pesa Info */
.mpesa-info {
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

.mpesa-info i {
  font-size: 20px;
}

/* Recent List */
.recent-list {
  max-height: 400px;
  overflow-y: auto;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.recent-item:hover {
  background: #f8f9fa;
}

.recent-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.recent-icon.mpesa { background: #E3F2FD; color: #1565C0; }
.recent-icon.cash { background: #E8F5E9; color: #2E7D32; }
.recent-icon.bank { background: #FFF3E0; color: #FF8F00; }

.recent-details {
  flex: 1;
}

.recent-amount {
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.recent-date {
  font-size: 12px;
  color: #999;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.completed { background: #E8F5E9; color: #2E7D32; }
.status-badge.pending { background: #FFF3E0; color: #FF8F00; }

.link-small {
  margin-left: auto;
  font-size: 13px;
  color: #2E7D32;
  text-decoration: none;
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
  max-width: 400px;
  margin: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  overflow: hidden;
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

.success-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.success-icon i {
  font-size: 36px;
  color: white;
}

.mpesa-pulse {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1565C0, #0D47A1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: pulse 1.5s infinite;
}

.mpesa-pulse i {
  font-size: 40px;
  color: white;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(21, 101, 192, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0);
  }
}

.mpesa-instructions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.mpesa-instructions small {
  color: #666;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .make-contribution {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .method-options {
    flex-direction: column;
  }
  
  .card-header-custom {
    padding: 16px 20px;
  }
  
  .card-body-custom {
    padding: 20px;
  }
}
</style>
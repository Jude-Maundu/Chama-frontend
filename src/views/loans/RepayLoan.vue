<template>
  <div class="repay-loan-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Loan Repayment</h1>
        <p class="page-subtitle">Make a payment towards your outstanding loan</p>
      </div>
      <button class="btn-outline-custom" @click="$router.back()">
        <i class="bi bi-arrow-left me-2"></i>Back to Loans
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="loan" class="row">
      <div class="col-lg-5">
        <div class="loan-summary-card glass-card">
          <div class="card-header-custom">
            <h5 class="mb-0">Loan Summary</h5>
          </div>
          <div class="card-body-custom">
            <div class="summary-item">
              <span class="label">Loan Type</span>
              <span class="value">{{ formatLoanType(loan.loan_type) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Principal Amount</span>
              <span class="value font-weight-bold">KES {{ formatMoney(loan.amount) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Payable</span>
              <span class="value">KES {{ formatMoney(loan.total_payable) }}</span>
            </div>
            <div class="summary-item highlight">
              <span class="label">Outstanding Balance</span>
              <span class="value text-warning">KES {{ formatMoney(loan.balance) }}</span>
            </div>
            
            <div class="next-installment mt-4" v-if="nextInstallment">
              <h6>Next Installment</h6>
              <div class="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <div class="text-muted small">Due Date</div>
                  <div class="font-weight-bold">{{ formatDate(nextInstallment.due_date) }}</div>
                </div>
                <div class="text-end">
                  <div class="text-muted small">Amount Due</div>
                  <div class="font-weight-bold text-primary">KES {{ formatMoney(nextInstallment.due_amount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-7">
        <div class="payment-form-card glass-card">
          <div class="card-header-custom">
            <h5 class="mb-0">Make Repayment</h5>
          </div>
          <div class="card-body-custom">
            <form @submit.prevent="submitRepayment">
              <div class="mb-4">
                <label class="form-label">Payment Amount (KES)</label>
                <div class="input-group">
                  <span class="input-group-text">KES</span>
                  <input type="number" v-model="form.amount" class="form-control" 
                         placeholder="Enter amount" required min="1" :max="loan.balance">
                </div>
                <div class="mt-2">
                  <button type="button" class="btn btn-sm btn-light me-2" @click="form.amount = nextInstallment?.due_amount || 0">
                    Pay Current Installment
                  </button>
                  <button type="button" class="btn btn-sm btn-light" @click="form.amount = loan.balance">
                    Pay Full Balance
                  </button>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label">Payment Method</label>
                <div class="payment-methods">
                  <div class="payment-method-option" :class="{ active: form.payment_method === 'mpesa' }"
                       @click="form.payment_method = 'mpesa'">
                    <i class="bi bi-phone"></i>
                    <span>M-Pesa STK Push</span>
                  </div>
                  <div class="payment-method-option" :class="{ active: form.payment_method === 'cash' }"
                       @click="form.payment_method = 'cash'">
                    <i class="bi bi-cash"></i>
                    <span>Cash / Bank Transfer</span>
                  </div>
                </div>
              </div>

              <div v-if="form.payment_method === 'mpesa'" class="mb-4">
                <label class="form-label">M-Pesa Phone Number</label>
                <input type="tel" v-model="form.phone" class="form-control" placeholder="2547XXXXXXXX">
                <small class="text-muted">You will receive an STK push on this number</small>
              </div>

              <button type="submit" class="btn-primary-custom w-100 py-3" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Processing...' : 'Confirm Repayment' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loanApi } from '@/api/loans'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const loanId = route.params.id

const loading = ref(true)
const submitting = ref(false)
const loan = ref(null)
const nextInstallment = ref(null)

const form = ref({
  amount: '',
  payment_method: 'mpesa',
  phone: ''
})

const loadLoanDetails = async () => {
  loading.value = true
  try {
    const response = await loanApi.get(loanId)
    loan.value = response.data.data
    
    // Find next pending installment
    if (loan.value.repayments) {
      nextInstallment.value = loan.value.repayments
        .filter(r => r.status === 'pending')
        .sort((a, b) => a.installment_number - b.installment_number)[0]
      
      if (nextInstallment.value) {
        form.value.amount = nextInstallment.value.due_amount
      }
    }
  } catch (error) {
    console.error('Failed to load loan details:', error)
    Swal.fire('Error', 'Failed to load loan details', 'error')
    router.push('/app/loans')
  } finally {
    loading.value = false
  }
}

const submitRepayment = async () => {
  if (!form.value.amount || form.value.amount <= 0) {
    Swal.fire('Error', 'Please enter a valid amount', 'error')
    return
  }

  submitting.value = true
  try {
    const response = await loanApi.repay(loanId, {
      amount: form.value.amount,
      payment_method: form.value.payment_method,
      phone: form.value.phone
    })

    if (response.data.success) {
      await Swal.fire({
        title: 'Success!',
        text: response.data.message || 'Repayment successful',
        icon: 'success',
        timer: 2000
      })
      router.push('/app/loans')
    } else {
      Swal.fire('Error', response.data.message || 'Repayment failed', 'error')
    }
  } catch (error) {
    console.error('Repayment failed:', error)
    Swal.fire('Error', error.response?.data?.message || 'Repayment failed', 'error')
  } finally {
    submitting.value = false
  }
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

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadLoanDetails()
  
  // Pre-fill phone from user profile
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.phone) {
    form.value.phone = user.phone
  }
})
</script>

<style scoped>
.repay-loan-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.summary-item.highlight {
  border-bottom: none;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 10px;
}

.payment-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.payment-method-option {
  padding: 16px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method-option.active {
  border-color: #2E7D32;
  background-color: rgba(46, 125, 50, 0.05);
}

.payment-method-option i {
  font-size: 24px;
  color: #2E7D32;
}

.card-header-custom {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-body-custom {
  padding: 20px;
}

.btn-primary-custom {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary-custom:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-outline-custom {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}
</style>

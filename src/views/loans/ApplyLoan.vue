<template>
  <div class="apply-loan-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Apply for Loan</h1>
        <p class="page-subtitle">Complete the form below to submit your loan application</p>
      </div>
      <router-link to="/app/loans" class="btn-outline-custom">
        <i class="bi bi-arrow-left me-2"></i>Back to Loans
      </router-link>
    </div>

    <div class="row g-4">
      <!-- Loan Application Form -->
      <div class="col-lg-7">
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon">
              <i class="bi bi-file-text"></i>
            </div>
            <h5 class="mb-0">Loan Application Form</h5>
          </div>
          <div class="card-body-custom">
            <form @submit.prevent="submitLoan">
              <!-- Loan Type Selection -->
              <div class="form-group">
                <label class="form-label">Loan Type *</label>
                <div class="loan-type-grid">
                  <label class="loan-type-option" :class="{ active: form.loan_type === 'emergency' }">
                    <input type="radio" value="emergency" v-model="form.loan_type">
                    <i class="bi bi-exclamation-triangle"></i>
                    <span>Emergency</span>
                    <small>Quick approval</small>
                  </label>
                  <label class="loan-type-option" :class="{ active: form.loan_type === 'development' }">
                    <input type="radio" value="development" v-model="form.loan_type">
                    <i class="bi bi-building"></i>
                    <span>Development</span>
                    <small>Business growth</small>
                  </label>
                  <label class="loan-type-option" :class="{ active: form.loan_type === 'education' }">
                    <input type="radio" value="education" v-model="form.loan_type">
                    <i class="bi bi-book"></i>
                    <span>Education</span>
                    <small>School fees</small>
                  </label>
                  <label class="loan-type-option" :class="{ active: form.loan_type === 'welfare' }">
                    <input type="radio" value="welfare" v-model="form.loan_type">
                    <i class="bi bi-heart"></i>
                    <span>Welfare</span>
                    <small>Medical/emergency</small>
                  </label>
                </div>
              </div>

              <!-- Amount Input -->
              <div class="form-group">
                <label class="form-label">Loan Amount (KES) *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-currency-dollar"></i>
                  <input type="number" class="form-control-custom" v-model="form.amount" 
                         placeholder="Enter amount" required min="1000" :max="maxLoanAmount"
                         @input="calculateLoanDetails">
                </div>
                <div class="range-hint">
                  <span>Min: KES 1,000</span>
                  <span>Max: KES {{ formatMoney(maxLoanAmount) }}</span>
                </div>
                <div class="progress-bar-custom">
                  <div class="progress-fill" :style="{ width: loanProgress + '%' }"></div>
                </div>
              </div>

              <!-- Duration Selection -->
              <div class="form-group">
                <label class="form-label">Loan Duration (Months) *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-calendar3"></i>
                  <select class="form-control-custom" v-model="form.duration_months" @change="calculateLoanDetails">
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                  </select>
                </div>
              </div>

              <!-- Purpose -->
              <div class="form-group">
                <label class="form-label">Purpose of Loan *</label>
                <div class="input-icon-wrapper">
                  <i class="bi bi-chat-text"></i>
                  <textarea class="form-control-custom" v-model="form.purpose" rows="4" 
                            placeholder="Please provide detailed information about how you will use this loan..."
                            required></textarea>
                </div>
              </div>

              <!-- Loan Calculator Preview -->
              <div class="loan-calculator" v-if="form.amount && form.duration_months">
                <div class="calculator-title">
                  <i class="bi bi-calculator-fill"></i>
                  <span>Loan Repayment Summary</span>
                </div>
                <div class="calculator-details">
                  <div class="calc-item">
                    <span>Principal Amount:</span>
                    <strong>KES {{ formatMoney(form.amount) }}</strong>
                  </div>
                  <div class="calc-item">
                    <span>Interest Rate:</span>
                    <strong>{{ interestRate }}% per annum</strong>
                  </div>
                  <div class="calc-item">
                    <span>Total Interest:</span>
                    <strong>KES {{ formatMoney(totalInterest) }}</strong>
                  </div>
                  <div class="calc-item">
                    <span>Total Payable:</span>
                    <strong class="text-success">KES {{ formatMoney(totalPayable) }}</strong>
                  </div>
                  <div class="calc-item highlight">
                    <span>Monthly Payment:</span>
                    <strong class="text-primary">KES {{ formatMoney(monthlyPayment) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Eligibility Info -->
              <div class="info-banner">
                <i class="bi bi-info-circle-fill"></i>
                <div>
                  <strong>Eligibility Requirements:</strong>
                  <ul class="mb-0 mt-1">
                    <li>Minimum 3 months as an active member</li>
                    <li>No defaulted loans</li>
                    <li>Loan amount cannot exceed 3x your savings</li>
                  </ul>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary-custom" @click="resetForm">Reset</button>
                <button type="submit" class="btn-primary-custom" :disabled="submitting">
                  <i v-if="submitting" class="bi bi-spinner bi-spin me-2"></i>
                  <i v-else class="bi bi-send me-2"></i>
                  {{ submitting ? 'Submitting...' : 'Submit Application' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Loan Information Sidebar -->
      <div class="col-lg-5">
        <div class="glass-card mb-4">
          <div class="card-header-custom">
            <div class="header-icon" style="background: linear-gradient(135deg, #1565C0, #0D47A1);">
              <i class="bi bi-info-circle"></i>
            </div>
            <h5 class="mb-0">Loan Information</h5>
          </div>
          <div class="card-body-custom">
            <div class="info-list">
              <div class="info-item">
                <i class="bi bi-clock-history"></i>
                <div>
                  <strong>Processing Time</strong>
                  <p>2-3 business days after approval</p>
                </div>
              </div>
              <div class="info-item">
                <i class="bi bi-graph-up"></i>
                <div>
                  <strong>Interest Rates</strong>
                  <p>Emergency: 12% | Development: 10%<br>Education: 8% | Welfare: 5%</p>
                </div>
              </div>
              <div class="info-item">
                <i class="bi bi-shield-check"></i>
                <div>
                  <strong>Processing Fee</strong>
                  <p>KES 500 (deducted from loan amount)</p>
                </div>
              </div>
              <div class="info-item">
                <i class="bi bi-phone"></i>
                <div>
                  <strong>Disbursement</strong>
                  <p>Funds sent directly to your registered M-Pesa number</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon" style="background: linear-gradient(135deg, #FF8F00, #E65100);">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <h5 class="mb-0">Important Notes</h5>
          </div>
          <div class="card-body-custom">
            <ul class="important-list">
              <li><i class="bi bi-check-circle-fill text-success"></i> Ensure all information is accurate</li>
              <li><i class="bi bi-check-circle-fill text-success"></i> Late payments attract penalties</li>
              <li><i class="bi bi-check-circle-fill text-success"></i> Maximum loan amount based on your savings</li>
              <li><i class="bi bi-check-circle-fill text-success"></i> Early repayment reduces total interest</li>
            </ul>
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
            <h4 class="mt-3">Application Submitted!</h4>
            <p class="text-muted">Your loan application has been submitted successfully. Our team will review it within 2-3 business days.</p>
            <div class="application-details">
              <p><strong>Application Reference:</strong> #{{ applicationRef }}</p>
              <p><strong>Amount Applied:</strong> KES {{ formatMoney(form.amount) }}</p>
            </div>
            <button class="btn-primary-custom mt-3" @click="closeSuccessModal">View My Loans</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showSuccessModal"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { loanApi } from '@/api/loans'

const router = useRouter()
const submitting = ref(false)
const showSuccessModal = ref(false)
const applicationRef = ref('')

const form = ref({
  loan_type: 'emergency',
  amount: '',
  duration_months: 12,
  purpose: ''
})

// Member data for eligibility
const memberSavings = ref(50000) // This should come from API
const maxLoanAmount = computed(() => memberSavings.value * 3)

const loanProgress = computed(() => {
  if (!form.value.amount || !maxLoanAmount.value) return 0
  return (form.value.amount / maxLoanAmount.value) * 100
})

const interestRate = computed(() => {
  const rates = {
    emergency: 12,
    development: 10,
    education: 8,
    welfare: 5
  }
  return rates[form.value.loan_type] || 10
})

const totalInterest = computed(() => {
  if (!form.value.amount || !form.value.duration_months) return 0
  const monthlyRate = interestRate.value / 100 / 12
  const months = form.value.duration_months
  const principal = parseFloat(form.value.amount) || 0
  return principal * monthlyRate * months
})

const totalPayable = computed(() => {
  return parseFloat(form.value.amount || 0) + totalInterest.value
})

const monthlyPayment = computed(() => {
  if (!form.value.duration_months || form.value.duration_months === 0) return 0
  return totalPayable.value / form.value.duration_months
})

const calculateLoanDetails = () => {
  // Trigger reactive updates
  console.log('Loan details updated')
}

const checkEligibility = () => {
  if (form.value.amount > maxLoanAmount.value) {
    Swal.fire({
      title: 'Loan Amount Exceeds Limit',
      text: `Maximum loan amount is KES ${formatMoney(maxLoanAmount.value)} based on your savings.`,
      icon: 'warning',
      confirmButtonColor: '#2E7D32'
    })
    return false
  }
  return true
}

const submitLoan = async () => {
  if (!checkEligibility()) return
  
  if (!form.value.purpose || form.value.purpose.length < 10) {
    Swal.fire('Error', 'Please provide a detailed purpose (minimum 10 characters)', 'error')
    return
  }

  submitting.value = true
  try {
    const response = await loanApi.apply(form.value)
    applicationRef.value = response.data.id || Math.floor(Math.random() * 1000000)
    showSuccessModal.value = true
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to submit application', 'error')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    loan_type: 'emergency',
    amount: '',
    duration_months: 12,
    purpose: ''
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/app/loans')
}

const formatMoney = (amount) => {
  if (!amount) return '0'
  return parseFloat(amount).toLocaleString()
}

const loadMemberData = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:8000/api/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const userData = await response.json()
    memberSavings.value = userData.total_savings || 50000
  } catch (error) {
    console.error('Failed to load member data:', error)
  }
}

onMounted(() => {
  loadMemberData()
})
</script>

<style scoped>
.apply-loan-page {
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
  padding: 24px;
}

/* Loan Type Grid */
.loan-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.loan-type-option {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.loan-type-option input {
  position: absolute;
  opacity: 0;
}

.loan-type-option i {
  font-size: 28px;
  color: #999;
  margin-bottom: 8px;
  display: block;
}

.loan-type-option span {
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.loan-type-option small {
  font-size: 11px;
  color: #999;
}

.loan-type-option.active {
  border-color: #2E7D32;
  background: rgba(46, 125, 50, 0.05);
}

.loan-type-option.active i {
  color: #2E7D32;
}

.loan-type-option.active span {
  color: #2E7D32;
}

/* Form Elements */
.form-group {
  margin-bottom: 24px;
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

textarea.form-control-custom {
  resize: vertical;
  padding-top: 12px;
  padding-bottom: 12px;
}

select.form-control-custom {
  cursor: pointer;
}

.range-hint {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.progress-bar-custom {
  margin-top: 8px;
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

/* Loan Calculator */
.loan-calculator {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 16px;
  border: 1px solid #e0e0e0;
}

.calculator-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a2e;
}

.calculator-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.calc-item.highlight {
  border-bottom: none;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #e0e0e0;
}

.calc-item span {
  color: #666;
}

.calc-item strong {
  color: #1a1a2e;
}

.text-success { color: #2E7D32 !important; }
.text-primary { color: #1565C0 !important; }

/* Info Banner */
.info-banner {
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  padding: 16px;
  border-radius: 12px;
  margin-top: 24px;
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #1565C0;
}

.info-banner i {
  font-size: 20px;
  flex-shrink: 0;
}

.info-banner ul {
  padding-left: 20px;
}

.info-banner li {
  margin-bottom: 4px;
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
}

.info-item i {
  font-size: 24px;
  color: #2E7D32;
}

.info-item p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
}

.important-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.important-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  color: #666;
}

.important-list li i {
  font-size: 16px;
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

.btn-primary-custom:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
}

.btn-primary-custom:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary-custom {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary-custom:hover {
  background: #e0e0e0;
}

.btn-outline-custom {
  background: transparent;
  border: 2px solid #2E7D32;
  color: #2E7D32;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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
  max-width: 450px;
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

.application-details {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 12px;
  margin-top: 16px;
}

.application-details p {
  margin-bottom: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .apply-loan-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .loan-type-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .card-body-custom {
    padding: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-primary-custom,
  .btn-secondary-custom {
    width: 100%;
    justify-content: center;
  }
}
</style>
<template>
  <div class="petty-cash-container container">
    <div class="header flex-between gap-4 flex-col-mobile">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Petty Cash Management</h1>
      <div class="header-actions flex gap-2 flex-col-mobile">
        <button v-if="userIsAdmin" @click="showCreateAccountModal = true" class="btn btn-secondary whitespace-nowrap">
          <i class="fas fa-plus"></i> <span class="hide-mobile">New Account</span><span class="show-mobile">Add</span>
        </button>
        <button @click="showClaimModal = true" class="btn btn-primary whitespace-nowrap">
          <i class="fas fa-hand-holding-usd"></i> <span class="hide-mobile">Submit Claim</span><span class="show-mobile">Claim</span>
        </button>
      </div>
    </div>

    <!-- Accounts Overview -->
    <div class="accounts-grid grid grid-auto-fit gap-4 margin-y-6">
      <div v-if="loading" class="loading-full">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="accounts.length === 0" class="empty-state col-span-full">
        <i class="fas fa-cash-register"></i>
        <p>No petty cash accounts set up for this Chama.</p>
      </div>

      <div v-for="account in accounts" :key="account.id" :class="['account-card', { active: selectedAccount?.id === account.id }]" @click="selectAccount(account)">
        <div class="account-header">
          <h3 class="text-base">{{ account.name }}</h3>
          <span class="account-type text-sm text-gray-600">{{ account.custodian?.name || account.manager_name }}</span>
        </div>
        <div class="account-balance margin-y-3">
          <span class="label text-sm">Available Balance</span>
          <span class="amount text-lg-desktop text-base-tablet">{{ formatCurrency(account.balance || account.current_balance) }}</span>
        </div>
        <div class="account-footer margin-y-3">
          <div class="progress-bar">
            <div class="progress" :style="{ width: getProgressWidth(account) + '%' }"></div>
          </div>
          <span class="limit-text text-xs text-gray-600">Float: {{ formatCurrency(account.float_amount || account.limit) }}</span>
        </div>
      </div>
    </div>

    <!-- Account Details & Claims -->
    <div v-if="selectedAccount" class="details-section margin-y-6">
      <div class="tabs flex gap-1 border-b">
        <button @click="activeTab = 'claims'" :class="['tab-btn', { active: activeTab === 'claims' }]">
          <i class="fas fa-check-square"></i> Claims
        </button>
        <button v-if="userIsAdmin" @click="activeTab = 'reconcile'" :class="['tab-btn', { active: activeTab === 'reconcile' }]">
          <i class="fas fa-balance-scale"></i> <span class="hide-mobile">Reconciliation</span>
        </button>
        <button @click="activeTab = 'history'" :class="['tab-btn', { active: activeTab === 'history' }]">
          <i class="fas fa-history"></i> <span class="hide-mobile">History</span>
        </button>
      </div>

      <div class="tab-content margin-y-4">
        <!-- Claims Tab -->
        <div v-if="activeTab === 'claims'" class="claims-tab">
          <div class="tab-header flex-between">
            <h3 class="text-lg-desktop text-base-tablet">Pending Claims</h3>
            <span class="badge">{{ pendingClaims.length }}</span>
          </div>

          <div v-if="pendingClaims.length === 0" class="empty-mini margin-y-4">
            <p>No pending claims for this account.</p>
          </div>

          <div v-for="claim in pendingClaims" :key="claim.id" class="claim-card margin-y-3">
            <div class="claim-info">
              <div class="claim-main flex-between">
                <span class="claimant text-base font-medium">{{ claim.user?.name || claim.member_name }}</span>
                <span class="claim-date text-sm text-gray-600">{{ formatDate(claim.created_at) }}</span>
              </div>
              <p class="claim-desc text-sm margin-y-2">{{ claim.description }}</p>
              <div class="claim-meta flex-between">
                <span class="claim-amount text-base font-semibold">{{ formatCurrency(claim.amount) }}</span>
                <span :class="['status-pill', claim.status]">{{ claim.status }}</span>
              </div>
            </div>
            <div v-if="userIsAdmin" class="claim-actions flex gap-2 margin-y-2">
              <button v-if="claim.status === 'submitted' || claim.status === 'pending'" @click="approveClaim(claim)" class="btn-action success" title="Approve"><i class="fas fa-check"></i></button>
              <button v-if="claim.status === 'approved'" @click="payClaim(claim)" class="btn btn-sm btn-success">Pay Now</button>
              <button @click="rejectClaim(claim)" class="btn-action danger" title="Reject"><i class="fas fa-times"></i></button>
            </div>
          </div>
        </div>

        <!-- Reconcile Tab -->
        <div v-if="activeTab === 'reconcile'" class="reconcile-tab margin-y-4">
          <div class="reconcile-form">
            <h3 class="text-lg-desktop text-base-tablet">Account Reconciliation</h3>
            <p class="help-text text-sm text-gray-600 margin-y-2">Verify physical cash against system balance.</p>
            
            <div class="form-group margin-y-3">
              <label class="text-sm font-medium">Actual Physical Cash *</label>
              <input v-model.number="reconcileForm.physical_count" type="number" class="form-control" step="0.01" />
            </div>
            
            <div v-if="reconcileForm.physical_count !== null" class="discrepancy-info margin-y-3">
              <div class="info-row flex-between text-sm">
                <span>System Balance:</span>
                <span>{{ formatCurrency(selectedAccount.balance || selectedAccount.current_balance) }}</span>
              </div>
              <div class="info-row flex-between text-sm">
                <span>Discrepancy:</span>
                <span :class="{ 'text-danger': discrepancy !== 0 }">{{ formatCurrency(discrepancy) }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Reconciliation Notes</label>
              <textarea v-model="reconcileForm.variance_explanation" class="form-control" rows="3" placeholder="Explain any discrepancies..."></textarea>
            </div>

            <button @click="submitReconciliation" class="btn btn-primary" :disabled="reconciling">
              {{ reconciling ? 'Processing...' : 'Submit Reconciliation' }}
            </button>
          </div>
        </div>

        <!-- History Tab -->
        <div v-if="activeTab === 'history'" class="history-tab">
          <div v-if="history.length === 0" class="empty-mini">
            <p>No history for this account.</p>
          </div>
          <div v-for="item in history" :key="item.id" class="history-item">
            <div class="history-icon"><i class="fas fa-exchange-alt"></i></div>
            <div class="history-details">
              <p class="history-title">{{ item.description }}</p>
              <p class="history-date">{{ formatDate(item.created_at) }}</p>
            </div>
            <div class="history-amount negative">-{{ formatCurrency(item.amount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Account Modal -->
    <div v-if="showCreateAccountModal" class="modal-overlay" @click="showCreateAccountModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Create Petty Cash Account</h2>
          <button @click="showCreateAccountModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAccount">
            <div class="form-group">
              <label>Account Name *</label>
              <input v-model="accountForm.name" type="text" class="form-control" placeholder="e.g., Office Petty Cash" required />
            </div>
            <div class="form-group">
              <label>Custodian *</label>
              <select v-model="accountForm.custodian_id" class="form-control" required>
                <option value="">Select a member</option>
                <option v-for="user in members" :key="user.id" :value="user.id">{{ user.name }}</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Float Amount *</label>
                <input v-model.number="accountForm.float_amount" type="number" class="form-control" step="0.01" min="0" required />
              </div>
              <div class="form-group">
                <label>Currency *</label>
                <select v-model="accountForm.currency_id" class="form-control" required>
                  <option v-for="curr in currencies" :key="curr.id" :value="curr.id">{{ curr.code }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="accountForm.description" class="form-control" rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showCreateAccountModal = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Creating...' : 'Create Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Submit Claim Modal -->
    <div v-if="showClaimModal" class="modal-overlay" @click="closeClaimModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Submit Petty Cash Claim</h2>
          <button @click="closeClaimModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitClaim">
            <div class="form-group">
              <label>Select Account *</label>
              <select v-model="claimForm.account_id" class="form-control" required>
                <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Amount *</label>
              <input v-model.number="claimForm.amount" type="number" class="form-control" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Purpose/Description *</label>
              <textarea v-model="claimForm.description" class="form-control" rows="3" required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeClaimModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Submit Claim</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { pettyCashApi } from '@/api/pettyCash'
import api from '@/api/axios'
import Swal from 'sweetalert2'

export default {
  name: 'PettyCash',
  setup() {
    const accounts = ref([])
    const selectedAccount = ref(null)
    const pendingClaims = ref([])
    const history = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const activeTab = ref('claims')
    const userIsAdmin = ref(false)
    
    const showClaimModal = ref(false)
    const showCreateAccountModal = ref(false)
    
    const members = ref([])
    const currencies = ref([])

    const accountForm = ref({
      name: '',
      custodian_id: '',
      float_amount: 1000,
      currency_id: 1,
      description: ''
    })

    const claimForm = ref({ account_id: '', amount: 0, description: '' })
    const reconcileForm = ref({ physical_count: null, variance_explanation: '', reconciliation_date: new Date().toISOString().split('T')[0] })
    const reconciling = ref(false)

    const currentChamaId = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.current_chama_id || 1
    })

    const discrepancy = computed(() => {
      if (!selectedAccount.value || reconcileForm.value.physical_count === null) return 0
      const currentBal = selectedAccount.value.balance || selectedAccount.value.current_balance
      return reconcileForm.value.physical_count - currentBal
    })

    const getProgressWidth = (account) => {
      const bal = account.balance || account.current_balance || 0
      const float = account.float_amount || account.limit || 1
      return Math.min(100, (bal / float) * 100)
    }

    const loadData = async () => {
      loading.value = true
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        userIsAdmin.value = user.roles?.includes('chama-admin') || user.roles?.includes('super-admin')
        
        const res = await pettyCashApi.getAll(currentChamaId.value)
        accounts.value = res.data || []
        if (accounts.value.length > 0 && !selectedAccount.value) selectAccount(accounts.value[0])

        if (userIsAdmin.value) {
          const [usersRes, currRes] = await Promise.all([
            api.get('/members'), // Assuming this returns chama members
            api.get('/currencies')
          ])
          members.value = usersRes.data.data || usersRes.data || []
          currencies.value = currRes.data.data || currRes.data || []
        }
      } catch (err) {
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const selectAccount = async (account) => {
      selectedAccount.value = account
      try {
        const [pendingRes, accountRes] = await Promise.all([
          pettyCashApi.getPendingClaims(currentChamaId.value, account.id),
          pettyCashApi.getById(currentChamaId.value, account.id)
        ])
        pendingClaims.value = pendingRes.data || []
        history.value = accountRes.data.recent_claims || []
      } catch (err) {
        pendingClaims.value = []
        history.value = []
      }
    }

    const saveAccount = async () => {
      saving.value = true
      try {
        await pettyCashApi.create(currentChamaId.value, accountForm.value)
        Swal.fire('Success', 'Petty cash account created', 'success')
        showCreateAccountModal.value = false
        loadData()
      } catch (err) {
        Swal.fire('Error', 'Failed to create account', 'error')
      } finally {
        saving.value = false
      }
    }

    const submitClaim = async () => {
      try {
        await pettyCashApi.submitClaim(currentChamaId.value, claimForm.value.account_id, {
            ...claimForm.value,
            currency_id: selectedAccount.value?.currency_id || 1
        })
        closeClaimModal()
        if (selectedAccount.value?.id === claimForm.value.account_id) selectAccount(selectedAccount.value)
        Swal.fire('Success', 'Claim submitted successfully', 'success')
      } catch (err) {
        Swal.fire('Error', 'Failed to submit claim', 'error')
      }
    }

    const approveClaim = async (claim) => {
      try {
        await pettyCashApi.approveClaim(currentChamaId.value, selectedAccount.value.id, claim.id)
        selectAccount(selectedAccount.value)
        Swal.fire('Approved', 'Claim has been approved', 'success')
      } catch (err) {
        Swal.fire('Error', 'Action failed', 'error')
      }
    }

    const rejectClaim = async (claim) => {
      const result = await Swal.fire({
        title: 'Reject Claim?',
        text: 'Are you sure you want to reject this claim?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, reject it'
      })

      if (result.isConfirmed) {
        try {
          await pettyCashApi.rejectClaim(currentChamaId.value, selectedAccount.value.id, claim.id)
          selectAccount(selectedAccount.value)
          Swal.fire('Rejected', 'Claim has been rejected', 'success')
        } catch (err) {
          Swal.fire('Error', 'Rejection failed', 'error')
        }
      }
    }

    const payClaim = async (claim) => {
      try {
        await pettyCashApi.payClaim(currentChamaId.value, selectedAccount.value.id, claim.id)
        selectAccount(selectedAccount.value)
        loadData() // Refresh balances
        Swal.fire('Paid', 'Claim has been paid', 'success')
      } catch (err) {
        Swal.fire('Error', 'Payment failed', 'error')
      }
    }

    const submitReconciliation = async () => {
      reconciling.value = true
      try {
        await pettyCashApi.reconcile(currentChamaId.value, selectedAccount.value.id, reconcileForm.value)
        reconcileForm.value = { physical_count: null, variance_explanation: '', reconciliation_date: new Date().toISOString().split('T')[0] }
        Swal.fire('Success', 'Reconciliation submitted', 'success')
        loadData()
      } catch (err) {
        Swal.fire('Error', 'Reconciliation failed', 'error')
      } finally {
        reconciling.value = false
      }
    }

    const closeClaimModal = () => {
      showClaimModal.value = false
      claimForm.value = { account_id: selectedAccount.value?.id || '', amount: 0, description: '' }
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(val || 0)
    const formatDate = (date) => new Date(date).toLocaleDateString()

    onMounted(loadData)

    return {
      accounts, selectedAccount, pendingClaims, history, loading, saving, activeTab, userIsAdmin,
      showClaimModal, showCreateAccountModal, accountForm, claimForm, reconcileForm, discrepancy, reconciling,
      members, currencies, getProgressWidth,
      selectAccount, saveAccount, submitClaim, approveClaim, payClaim, rejectClaim, submitReconciliation, closeClaimModal,
      formatCurrency, formatDate
    }
  }
}
</script>

<style scoped>
.petty-cash-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-actions { display: flex; gap: 1rem; }

.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.account-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
.account-card.active { border-color: #2c5aa0; background: #f0f7ff; }
.account-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.account-header h3 { margin: 0; font-size: 1.125rem; color: #2d3748; }
.account-type { font-size: 0.75rem; color: #718096; text-transform: uppercase; }
.account-balance { margin-bottom: 1.5rem; }
.account-balance .label { display: block; font-size: 0.875rem; color: #718096; margin-bottom: 0.25rem; }
.account-balance .amount { font-size: 1.5rem; font-weight: 700; color: #2c5aa0; }
.account-footer { border-top: 1px solid #edf2f7; padding-top: 1rem; }
.progress-bar { height: 8px; background: #edf2f7; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
.progress { height: 100%; background: #2c5aa0; border-radius: 4px; }
.limit-text { font-size: 0.75rem; color: #a0aec0; }

.details-section { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
.tabs { display: flex; background: #f7fafc; border-bottom: 1px solid #edf2f7; }
.tabs button { padding: 1rem 2rem; border: none; background: none; cursor: pointer; font-weight: 600; color: #718096; transition: all 0.2s; }
.tabs button.active { color: #2c5aa0; border-bottom: 2px solid #2c5aa0; background: white; }

.tab-content { padding: 2rem; }
.tab-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
.badge { background: #edf2f7; color: #4a5568; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.875rem; }

.claim-card { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border: 1px solid #edf2f7; border-radius: 10px; margin-bottom: 1rem; }
.claimant { font-weight: 700; color: #2d3748; margin-right: 0.75rem; }
.claim-date { font-size: 0.875rem; color: #a0aec0; }
.claim-desc { margin: 0.5rem 0; color: #4a5568; }
.claim-meta { display: flex; align-items: center; gap: 1rem; }
.claim-amount { font-weight: 700; color: #2c5aa0; }
.status-pill { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; background: #fefcbf; color: #744210; }
.status-pill.approved { background: #c6f6d5; color: #22543d; }
.status-pill.paid { background: #c6f6d5; color: #22543d; }
.status-pill.rejected { background: #fed7d7; color: #822727; }

.claim-actions { display: flex; gap: 0.5rem; }
.btn-action { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-action.success { background: #c6f6d5; color: #22543d; }
.btn-action.danger { background: #fed7d7; color: #822727; }

.reconcile-form { max-width: 400px; }
.discrepancy-info { background: #f7fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }

.history-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #edf2f7; }
.history-icon { width: 40px; height: 40px; background: #f7fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #718096; }
.history-details { flex: 1; }
.history-title { font-weight: 600; margin: 0; color: #2d3748; }
.history-date { font-size: 0.875rem; color: #a0aec0; margin: 0; }
.history-amount { font-weight: 700; }
.history-amount.negative { color: #e53e3e; }

/* Buttons & Utils */
.btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-primary { background: #2c5aa0; color: white; }
.btn-secondary { background: #edf2f7; color: #4a5568; }
.btn-success { background: #38a169; color: white; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.875rem; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; width: 90%; max-width: 500px; border-radius: 12px; padding: 2rem; overflow-y: auto; max-height: 90vh; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #4a5568; }
.form-control { width: 100%; padding: 0.625rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }

.loading-full { padding: 4rem; text-align: center; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2c5aa0; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>

<template>
  <div class="exit-management-container container">
    <div class="header margin-y-4">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Exit & Succession Management</h1>
    </div>

    <div class="main-grid grid grid-cols-1 grid-cols-3-desktop gap-6">
      <!-- Left Column: User Actions -->
      <div class="action-column grid grid-cols-1 gap-4 col-span-1 col-span-2-desktop">
        <!-- Next of Kin / Nominations -->
        <section class="card nominations-card">
          <div class="card-header flex-between">
            <h3 class="text-base-mobile text-lg-tablet"><i class="fas fa-user-shield"></i> Nominated Successors</h3>
            <button @click="showNominationModal = true" class="btn btn-sm btn-primary whitespace-nowrap">Add New</button>
          </div>
          <div class="card-body">
            <p class="help-text text-sm text-gray-600">Nominate individuals to manage your interest in case of exit or emergency.</p>
            
            <div v-if="nominations.length === 0" class="empty-mini margin-y-3">
              <p>No nominations added yet.</p>
            </div>
            
            <div v-for="nom in nominations" :key="nom.id" class="nomination-item margin-y-2 flex-between gap-3">
              <div class="nom-info flex-1">
                <p class="nom-name text-sm font-medium">{{ nom.name }} <span class="relation text-xs text-gray-600">({{ nom.relationship }})</span></p>
                <p class="nom-phone text-xs text-gray-600">{{ nom.phone }}</p>
                <p class="nom-share text-xs">Share: {{ nom.percentage }}%</p>
              </div>
              <button @click="removeNomination(nom.id)" class="btn-icon danger" title="Remove"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </section>

        <!-- Exit Request Form -->
        <section class="card exit-card">
          <div class="card-header">
            <h3 class="text-base-mobile text-lg-tablet"><i class="fas fa-door-open"></i> Request Membership Exit</h3>
          </div>
          <div class="card-body">
            <div v-if="hasActiveExitRequest" class="active-request-alert flex gap-3 padding-3 bg-info-light border border-info">
              <i class="fas fa-info-circle"></i>
              <div>
                <p class="text-sm font-medium"><strong>Exit Request Pending</strong></p>
                <p class="text-xs text-gray-600">Submitted on {{ formatDate(activeRequest.created_at) }}</p>
                <span :class="['status-badge', activeRequest.status]">{{ activeRequest.status }}</span>
              </div>
            </div>
            
            <form v-else @submit.prevent="submitExitRequest" class="space-y-4">
              <p class="warning-text text-sm text-orange-600 padding-2 bg-orange-50 border-left">Note: Exiting the Chama involves calculating your final share after all liabilities and fees.</p>
              <div class="form-group">
                <label class="text-sm font-medium">Reason for Exit *</label>
                <select v-model="exitForm.reason" class="form-control" required>
                  <option value="financial">Financial Constraints</option>
                  <option value="relocation">Relocation</option>
                  <option value="personal">Personal Reasons</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="text-sm font-medium">Additional Notes</label>
                <textarea v-model="exitForm.notes" class="form-control" rows="3"></textarea>
              </div>
              <div class="form-check flex gap-2">
                <input type="checkbox" id="confirm-exit" v-model="exitForm.confirmed" required />
                <label for="confirm-exit" class="text-sm">I understand that exit processing may take up to 30 days.</label>
              </div>
              <button type="submit" class="btn btn-danger btn-full" :disabled="submittingExit">
                {{ submittingExit ? 'Submitting...' : 'Submit Exit Request' }}
              </button>
            </form>
          </div>
        </section>
      </div>

      <!-- Right Column: Admin Tasks (Conditional) -->
      <div v-if="userIsAdmin" class="admin-column grid grid-cols-1 col-span-1">
        <section class="card admin-exit-card">
          <div class="card-header flex-between">
            <h3 class="text-base-mobile text-lg-tablet"><i class="fas fa-tasks"></i> Pending Exit Approvals</h3>
            <span class="badge">{{ pendingExitRequests.length }}</span>
          </div>
          <div class="card-body">
            <div v-if="pendingExitRequests.length === 0" class="empty-state">
              <p>No pending exit requests.</p>
            </div>
            
            <div v-for="req in pendingExitRequests" :key="req.id" class="request-item margin-y-3 padding-3 border rounded">
              <div class="req-user margin-y-2">
                <p class="req-name text-sm font-medium">{{ req.user_name }}</p>
                <p class="req-date text-xs text-gray-600">Joined: {{ formatDate(req.joined_at) }}</p>
              </div>
              <div class="req-financials grid grid-cols-2 gap-2 text-sm margin-y-2">
                <p>Savings: <span class="font-medium">{{ formatCurrency(req.total_savings) }}</span></p>
                <p class="text-danger">Loans: <span class="font-medium">{{ formatCurrency(req.outstanding_loans) }}</span></p>
              </div>
              <div class="req-actions">
                <button @click="openProcessModal(req)" class="btn btn-sm btn-primary btn-full">Process Exit</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Nomination Modal -->
    <div v-if="showNominationModal" class="modal-overlay" @click="showNominationModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Add Nominated Successor</h2>
          <button @click="showNominationModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveNomination">
            <div class="form-group">
              <label>Full Name *</label>
              <input v-model="nomForm.name" type="text" class="form-control" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Relationship *</label>
                <input v-model="nomForm.relationship" type="text" class="form-control" placeholder="e.g. Spouse, Child" required />
              </div>
              <div class="form-group">
                <label>ID Number</label>
                <input v-model="nomForm.id_number" type="text" class="form-control" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone Number *</label>
                <input v-model="nomForm.phone" type="tel" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Share Percentage (%) *</label>
                <input v-model.number="nomForm.percentage" type="number" class="form-control" min="1" max="100" required />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="showNominationModal = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Nomination</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Process Exit Modal (Admin) -->
    <div v-if="selectedRequest" class="modal-overlay" @click="selectedRequest = null">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Process Exit: {{ selectedRequest.user_name }}</h2>
          <button @click="selectedRequest = null" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="exit-summary-calc">
            <div class="calc-row"><span>Total Savings:</span> <span>{{ formatCurrency(selectedRequest.total_savings) }}</span></div>
            <div class="calc-row"><span>Accrued Dividends:</span> <span>{{ formatCurrency(selectedRequest.accrued_dividends) }}</span></div>
            <div class="calc-row text-danger"><span>Outstanding Loans:</span> <span>-{{ formatCurrency(selectedRequest.outstanding_loans) }}</span></div>
            <div class="calc-row text-danger"><span>Exit Fees:</span> <span>-{{ formatCurrency(selectedRequest.exit_fees) }}</span></div>
            <div class="calc-row total"><span>Net Refund:</span> <span>{{ formatCurrency(netRefund) }}</span></div>
          </div>
          
          <div class="form-group">
            <label>Decision *</label>
            <select v-model="processForm.action" class="form-control">
              <option value="approve">Approve & Refund</option>
              <option value="reject">Reject Request</option>
            </select>
          </div>
          <div class="form-group">
            <label>Admin Comments</label>
            <textarea v-model="processForm.comments" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button @click="processExit" class="btn btn-success btn-full">Confirm Processing</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { exitManagementApi } from '@/api/exitManagement'

export default {
  name: 'ExitManagement',
  setup() {
    const nominations = ref([])
    const exitRequests = ref([])
    const loading = ref(false)
    const userIsAdmin = ref(false)
    const showNominationModal = ref(false)
    const selectedRequest = ref(null)
    
    const nomForm = ref({ name: '', relationship: '', id_number: '', phone: '', percentage: 100 })
    const exitForm = ref({ reason: 'financial', notes: '', confirmed: false })
    const processForm = ref({ action: 'approve', comments: '' })
    const submittingExit = ref(false)

    const currentChamaId = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.current_chama_id || 1
    })

    const activeRequest = computed(() => exitRequests.value.find(r => r.is_mine && r.status === 'pending'))
    const hasActiveExitRequest = computed(() => !!activeRequest.value)
    const pendingExitRequests = computed(() => exitRequests.value.filter(r => r.status === 'pending' && !r.is_mine))
    
    const netRefund = computed(() => {
      if (!selectedRequest.value) return 0
      return selectedRequest.value.total_savings + 
             selectedRequest.value.accrued_dividends - 
             selectedRequest.value.outstanding_loans - 
             selectedRequest.value.exit_fees
    })

    const loadData = async () => {
      loading.value = true
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        userIsAdmin.value = user.roles?.includes('chama-admin') || user.roles?.includes('super-admin')
        
        const [nomsRes, exitsRes] = await Promise.all([
          exitManagementApi.getNominations(currentChamaId.value),
          exitManagementApi.getExitRequests(currentChamaId.value)
        ])
        nominations.value = nomsRes.data || []
        exitRequests.value = exitsRes.data || []
      } catch (err) {
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const saveNomination = async () => {
      try {
        await exitManagementApi.storeNomination(currentChamaId.value, nomForm.value)
        showNominationModal.value = false
        nomForm.value = { name: '', relationship: '', id_number: '', phone: '', percentage: 100 }
        loadData()
      } catch (err) {
        alert('Failed to save nomination')
      }
    }

    const removeNomination = async (id) => {
      if (!confirm('Remove this successor?')) return
      try {
        await exitManagementApi.deleteNomination(currentChamaId.value, id)
        loadData()
      } catch (err) {
        alert('Failed to remove nomination')
      }
    }

    const submitExitRequest = async () => {
      submittingExit.value = true
      try {
        await exitManagementApi.submitExitRequest(currentChamaId.value, exitForm.value)
        alert('Exit request submitted for processing.')
        loadData()
      } catch (err) {
        alert('Failed to submit request')
      } finally {
        submittingExit.value = false
      }
    }

    const openProcessModal = (req) => {
      selectedRequest.value = req
    }

    const processExit = async () => {
      try {
        await exitManagementApi.processExitRequest(currentChamaId.value, selectedRequest.value.id, processForm.value)
        selectedRequest.value = null
        alert('Request processed successfully')
        loadData()
      } catch (err) {
        alert('Processing failed')
      }
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(val || 0)
    const formatDate = (date) => new Date(date).toLocaleDateString()

    onMounted(loadData)

    return {
      nominations, exitRequests, loading, userIsAdmin, showNominationModal, selectedRequest,
      nomForm, exitForm, processForm, submittingExit, netRefund,
      activeRequest, hasActiveExitRequest, pendingExitRequests,
      saveNomination, removeNomination, submitExitRequest, openProcessModal, processExit,
      formatCurrency, formatDate
    }
  }
}
</script>

<style scoped>
.exit-management-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.header { margin-bottom: 2rem; }
.main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

.card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 2rem; overflow: hidden; }
.card-header { padding: 1.25rem; background: #f8fafc; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center; }
.card-header h3 { margin: 0; font-size: 1.1rem; color: #2d3748; display: flex; align-items: center; gap: 0.75rem; }
.card-body { padding: 1.5rem; }

.help-text { color: #718096; font-size: 0.875rem; margin-bottom: 1.5rem; }
.nomination-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #edf2f7; border-radius: 8px; margin-bottom: 0.75rem; }
.nom-name { font-weight: 700; margin: 0; color: #2d3748; }
.relation { font-weight: 400; color: #718096; font-size: 0.85rem; }
.nom-phone, .nom-share { margin: 0.25rem 0 0; font-size: 0.85rem; color: #4a5568; }

.active-request-alert { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 1rem; display: flex; gap: 1rem; color: #2c5282; }
.status-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-top: 0.5rem; }
.status-badge.pending { background: #feebc8; color: #744210; }

.warning-text { color: #9b2c2c; background: #fff5f5; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.5rem; border-left: 4px solid #f56565; }

.request-item { padding: 1rem; border: 1px solid #edf2f7; border-radius: 8px; margin-bottom: 1rem; }
.req-user { margin-bottom: 0.75rem; }
.req-name { font-weight: 700; margin: 0; }
.req-date { font-size: 0.8rem; color: #a0aec0; margin: 0; }
.req-financials { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 1rem; }

.exit-summary-calc { background: #f7fafc; padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; }
.calc-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
.calc-row.total { border-top: 2px solid #edf2f7; margin-top: 0.75rem; padding-top: 0.75rem; font-weight: 800; font-size: 1.1rem; color: #2c5aa0; }

/* Global components used */
.btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-primary { background: #2c5aa0; color: white; }
.btn-danger { background: #e53e3e; color: white; }
.btn-success { background: #38a169; color: white; }
.btn-secondary { background: #edf2f7; color: #4a5568; }
.btn-full { width: 100%; justify-content: center; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 4px; }
.btn-icon.danger { color: #e53e3e; }

.form-group { margin-bottom: 1.25rem; }
.form-control { width: 100%; padding: 0.625rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.form-check { display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1.5rem; font-size: 0.85rem; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; width: 90%; max-width: 500px; border-radius: 12px; padding: 2rem; }

@media (max-width: 768px) { .main-grid { grid-template-columns: 1fr; } }
</style>

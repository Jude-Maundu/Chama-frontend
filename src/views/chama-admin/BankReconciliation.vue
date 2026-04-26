<template>
  <div class="bank-reconciliation-container">
    <div class="header">
      <h1>Bank Reconciliation</h1>
      <button v-if="userIsAdmin" @click="showUploadModal = true" class="btn btn-primary">
        <i class="fas fa-upload"></i> Upload Statement
      </button>
    </div>

    <!-- Stats Summary -->
    <div class="summary-cards">
      <div class="summary-card">
        <h3>Last Reconciled</h3>
        <p class="value">{{ lastReconciledDate }}</p>
      </div>
      <div class="summary-card">
        <h3>Unmatched Transactions</h3>
        <p class="value warning">{{ unmatchedCount }}</p>
      </div>
    </div>

    <!-- History List -->
    <div class="history-section">
      <h3>Reconciliation History</h3>
      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="sessions.length === 0" class="empty-state">
        <i class="fas fa-history"></i>
        <p>No reconciliation history found.</p>
      </div>

      <div v-else class="table-container">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Period</th>
              <th>Bank Balance</th>
              <th>System Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in sessions" :key="session.id">
              <td>{{ formatDate(session.created_at) }}</td>
              <td>{{ formatDate(session.statement_date) }}</td>
              <td>{{ formatCurrency(session.statement_balance) }}</td>
              <td>{{ formatCurrency(session.system_balance) }}</td>
              <td><span :class="['status-badge', session.status]">{{ session.status }}</span></td>
              <td>
                <button @click="viewResults(session)" class="btn-link">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Results Modal -->
    <div v-if="selectedSession" class="modal-overlay" @click="selectedSession = null">
      <div class="modal x-large" @click.stop>
        <div class="modal-header">
          <h2>Reconciliation Results - {{ formatDate(selectedSession.statement_date) }}</h2>
          <button @click="selectedSession = null" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="results-grid">
            <div class="results-column">
              <h4>Summary</h4>
              <div class="bg-light p-3 rounded mb-4">
                <p><strong>Status:</strong> {{ selectedSession.status }}</p>
                <p><strong>Statement Balance:</strong> {{ formatCurrency(selectedSession.statement_balance) }}</p>
                <p><strong>System Balance:</strong> {{ formatCurrency(selectedSession.system_balance) }}</p>
                <p><strong>Variance:</strong> {{ formatCurrency(selectedSession.variance) }}</p>
              </div>
              
              <h4>Matches</h4>
              <div class="scroll-list">
                <div v-if="results.summary?.discrepancies?.length === 0" class="p-3 text-center">No discrepancies found</div>
                <div v-for="(tx, idx) in results.summary?.discrepancies" :key="idx" class="tx-item unmatched">
                  <div class="tx-info">
                    <p class="tx-desc">{{ tx.description }}</p>
                    <span class="source-tag">{{ tx.type }}</span>
                  </div>
                  <div class="tx-amount">{{ formatCurrency(tx.amount) }}</div>
                </div>
              </div>
            </div>
            <div class="results-column">
              <h4>Review Notes</h4>
              <textarea v-model="reviewNotes" class="form-control mb-3" rows="4" placeholder="Add notes for this reconciliation..."></textarea>
              
              <div class="modal-footer" v-if="selectedSession.status === 'uploaded' || selectedSession.status === 'pending'">
                <button @click="approveReconciliation(selectedSession.id)" class="btn btn-success">Approve & Mark Complete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="showUploadModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Upload Bank Statement</h2>
          <button @click="showUploadModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleUpload">
            <div class="form-group">
              <label>Statement File (CSV/Excel) *</label>
              <input type="file" @change="onFileChange" class="form-control" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Statement Date *</label>
                <input v-model="uploadForm.statement_date" type="date" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Closing Balance *</label>
                <input v-model.number="uploadForm.statement_balance" type="number" step="0.01" class="form-control" required />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="showUploadModal = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="uploading">
                {{ uploading ? 'Processing...' : 'Start Reconciliation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { bankReconciliationApi } from '@/api/bankReconciliation'
import Swal from 'sweetalert2'

export default {
  name: 'BankReconciliation',
  setup() {
    const sessions = ref([])
    const loading = ref(false)
    const showUploadModal = ref(false)
    const selectedSession = ref(null)
    const results = ref({ matched: [], unmatched: [], summary: {} })
    const uploading = ref(false)
    const userIsAdmin = ref(false)
    const reviewNotes = ref('')

    const uploadForm = ref({ 
      file: null, 
      statement_date: new Date().toISOString().split('T')[0],
      statement_balance: 0 
    })

    const currentChamaId = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.current_chama_id || 1
    })

    const lastReconciledDate = computed(() => {
      if (sessions.value.length === 0) return 'Never'
      return formatDate(sessions.value[0].statement_date)
    })

    const unmatchedCount = computed(() => results.value.summary?.discrepancies?.length || 0)

    const loadData = async () => {
      loading.value = true
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        userIsAdmin.value = user.roles?.includes('chama-admin') || user.roles?.includes('super-admin')
        
        const res = await bankReconciliationApi.getAll(currentChamaId.value)
        sessions.value = res.data.data || res.data || []
      } catch (err) {
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const onFileChange = (e) => { uploadForm.value.file = e.target.files[0] }

    const handleUpload = async () => {
      if (!uploadForm.value.file) return
      
      uploading.value = true
      const formData = new FormData()
      formData.append('file', uploadForm.value.file)
      formData.append('statement_date', uploadForm.value.statement_date)
      formData.append('statement_balance', uploadForm.value.statement_balance)

      try {
        await bankReconciliationApi.upload(currentChamaId.value, formData)
        showUploadModal.value = false
        Swal.fire('Success', 'Statement uploaded and processing started.', 'success')
        loadData()
      } catch (err) {
        Swal.fire('Error', 'Upload failed. Ensure file format is correct.', 'error')
      } finally {
        uploading.value = false
      }
    }

    const viewResults = async (session) => {
      selectedSession.value = session
      reviewNotes.value = session.review_notes || ''
      try {
        const res = await bankReconciliationApi.getResults(currentChamaId.value, session.id)
        results.value = res.data || { matched: [], unmatched: [], summary: {} }
      } catch (err) {
        Swal.fire('Error', 'Failed to load results', 'error')
      }
    }

    const approveReconciliation = async (id) => {
      try {
        await bankReconciliationApi.approve(currentChamaId.value, id, { review_notes: reviewNotes.value })
        Swal.fire('Approved', 'Reconciliation marked as complete!', 'success')
        selectedSession.value = null
        loadData()
      } catch (err) {
        Swal.fire('Error', 'Approval failed', 'error')
      }
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(val || 0)
    const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A'

    onMounted(loadData)

    return {
      sessions, loading, showUploadModal, selectedSession, results, uploading, userIsAdmin,
      uploadForm, lastReconciledDate, unmatchedCount, reviewNotes,
      onFileChange, handleUpload, viewResults, approveReconciliation, formatCurrency, formatDate
    }
  }
}
</script>

<style scoped>
.bank-reconciliation-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.summary-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.summary-card h3 { font-size: 0.875rem; color: #718096; margin: 0 0 0.5rem; text-transform: uppercase; }
.summary-card .value { font-size: 1.5rem; font-weight: 700; color: #2d3748; margin: 0; }
.value.warning { color: #e53e3e; }

.table-container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
.styled-table { width: 100%; border-collapse: collapse; text-align: left; }
.styled-table th { padding: 1rem; background: #f8fafc; border-bottom: 1px solid #edf2f7; color: #4a5568; }
.styled-table td { padding: 1rem; border-bottom: 1px solid #edf2f7; }

.status-badge { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-badge.uploaded { background: #ebf8ff; color: #3182ce; }
.status-badge.pending { background: #fefcbf; color: #744210; }
.status-badge.completed { background: #c6f6d5; color: #22543d; }

.modal.x-large { max-width: 1000px; width: 95%; }
.results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
.scroll-list { height: 400px; overflow-y: auto; border: 1px solid #edf2f7; border-radius: 8px; padding: 1rem; }

.tx-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; border: 1px solid transparent; }
.tx-item.matched { background: #f0fff4; border-color: #c6f6d5; }
.tx-item.unmatched { background: #fff5f5; border-color: #fed7d7; }

.tx-desc { font-size: 0.9rem; font-weight: 600; margin: 0; }
.tx-amount { font-weight: 700; }
.source-tag { font-size: 0.7rem; background: #edf2f7; padding: 0.1rem 0.4rem; border-radius: 4px; }

.modal-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #edf2f7; display: flex; justify-content: flex-end; }

.btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-primary { background: #2c5aa0; color: white; }
.btn-success { background: #38a169; color: white; }
.btn-secondary { background: #edf2f7; color: #4a5568; }
.btn-link { color: #2c5aa0; background: none; border: none; cursor: pointer; font-weight: 600; padding: 0; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-control { width: 100%; padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 8px; }
</style>

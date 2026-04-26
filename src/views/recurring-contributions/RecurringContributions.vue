<template>
  <div class="recurring-contributions-container container">
    <div class="header flex-between gap-4 flex-col-mobile">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Recurring Contributions</h1>
      <button @click="showCreateModal = true" class="btn btn-primary whitespace-nowrap">
        <i class="fas fa-plus"></i> <span class="hide-mobile">Set Up Recurring Payment</span><span class="show-mobile">Add</span>
      </button>
    </div>

    <!-- Active Schedules -->
    <div class="schedules-section margin-y-6">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading schedules...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="schedules.length === 0" class="empty-state">
        <i class="fas fa-clock"></i>
        <p>You don't have any recurring contribution schedules set up.</p>
        <p class="sub-text text-sm text-gray-600">Automate your payments to never miss a deadline!</p>
      </div>

      <div v-else class="schedules-grid grid grid-auto-fit gap-4">
        <div v-for="schedule in schedules" :key="schedule.id" class="schedule-card">
          <div class="schedule-header flex-between">
            <h3 class="text-base">{{ schedule.chama_name }}</h3>
            <span :class="['status-badge', schedule.status]">
              {{ formatStatus(schedule.status) }}
            </span>
          </div>

          <div class="schedule-details grid grid-cols-3 gap-2 margin-y-3 text-sm">
            <div class="detail">
              <span class="label text-xs text-gray-600">Amount</span>
              <span class="value">{{ formatCurrency(schedule.amount) }}</span>
            </div>
            <div class="detail">
              <span class="label text-xs text-gray-600">Frequency</span>
              <span class="value">{{ formatFrequency(schedule.frequency) }}</span>
            </div>
            <div class="detail">
              <span class="label text-xs text-gray-600">Next Payment</span>
              <span class="value">{{ formatDate(schedule.next_payment_date) }}</span>
            </div>
          </div>

          <div class="schedule-actions flex flex-wrap gap-2">
            <button v-if="schedule.status === 'active'" @click="pauseSchedule(schedule)" class="btn btn-sm btn-warning">
              <i class="fas fa-pause"></i> Pause
            </button>
            <button v-if="schedule.status === 'paused'" @click="resumeSchedule(schedule)" class="btn btn-sm btn-success">
              <i class="fas fa-play"></i> Resume
            </button>
            <button @click="editSchedule(schedule)" class="btn btn-sm btn-secondary">
              <i class="fas fa-edit"></i> <span class="hide-mobile">Edit</span>
            </button>
            <button @click="cancelSchedule(schedule)" class="btn btn-sm btn-danger">
              <i class="fas fa-times"></i> <span class="hide-mobile">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Recurring Payments -->
    <div v-if="recentPayments.length > 0" class="payments-section margin-y-6">
      <h2 class="text-xl-desktop text-lg-tablet margin-y-4">Recent Recurring Payments</h2>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th class="text-sm">Date</th>
              <th class="text-sm hide-mobile">Chama</th>
              <th class="text-sm">Amount</th>
              <th class="text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in recentPayments" :key="payment.id">
              <td class="text-sm">{{ formatDate(payment.payment_date) }}</td>
              <td class="text-sm hide-mobile">{{ payment.chama_name }}</td>
              <td class="text-sm">{{ formatCurrency(payment.amount) }}</td>
              <td>
                <span class="status-badge success">Completed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="text-lg-desktop text-base-tablet">{{ editingSchedule ? 'Edit Schedule' : 'Set Up Recurring Payment' }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveSchedule">
            <div class="form-group">
              <label>Select Chama *</label>
              <select v-model="form.chama_id" class="form-control" required :disabled="editingSchedule">
                <option value="">Select a Chama</option>
                <option v-for="chama in myChamas" :key="chama.id" :value="chama.id">
                  {{ chama.name }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Amount *</label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  class="form-control"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div class="form-group">
                <label>Frequency *</label>
                <select v-model="form.frequency" class="form-control" required>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Start Date *</label>
              <input
                v-model="form.start_date"
                type="date"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label>Payment Method *</label>
              <select v-model="form.payment_method" class="form-control" required>
                <option value="mpesa">M-Pesa (Auto-STK)</option>
                <option value="wallet">Internal Wallet</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : (editingSchedule ? 'Update Schedule' : 'Create Schedule') }}
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
import { recurringContributionsApi } from '@/api/recurringContributions'
import api from '@/api/axios'

export default {
  name: 'RecurringContributions',
  setup() {
    const schedules = ref([])
    const myChamas = ref([])
    const recentPayments = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const error = ref('')
    const showCreateModal = ref(false)
    const editingSchedule = ref(null)

    const form = ref({
      chama_id: '',
      amount: 0,
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      payment_method: 'mpesa'
    })

    const loadData = async () => {
      loading.value = true
      error.value = ''
      try {
        const [schedulesRes, chamasRes] = await Promise.all([
          recurringContributionsApi.getUserContributions(),
          api.get('/chamas/my-chamas')
        ])
        schedules.value = schedulesRes.data || []
        myChamas.value = chamasRes.data || []
      } catch (err) {
        error.value = 'Failed to load recurring contributions'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const saveSchedule = async () => {
      saving.value = true
      try {
        if (editingSchedule.value) {
          await recurringContributionsApi.update(
            form.value.chama_id,
            editingSchedule.value.id,
            form.value
          )
        } else {
          await recurringContributionsApi.create(form.value.chama_id, form.value)
        }
        closeModal()
        loadData()
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to save schedule')
      } finally {
        saving.value = false
      }
    }

    const pauseSchedule = async (schedule) => {
      if (!confirm('Are you sure you want to pause this schedule?')) return
      try {
        await recurringContributionsApi.pause(schedule.chama_id, schedule.id)
        loadData()
      } catch (err) {
        alert('Failed to pause schedule')
      }
    }

    const resumeSchedule = async (schedule) => {
      try {
        await recurringContributionsApi.resume(schedule.chama_id, schedule.id)
        loadData()
      } catch (err) {
        alert('Failed to resume schedule')
      }
    }

    const cancelSchedule = async (schedule) => {
      if (!confirm('Are you sure you want to cancel this recurring payment permanently?')) return
      try {
        await recurringContributionsApi.cancel(schedule.chama_id, schedule.id)
        loadData()
      } catch (err) {
        alert('Failed to cancel schedule')
      }
    }

    const editSchedule = (schedule) => {
      editingSchedule.value = schedule
      form.value = {
        chama_id: schedule.chama_id,
        amount: schedule.amount,
        frequency: schedule.frequency,
        start_date: schedule.start_date,
        payment_method: schedule.payment_method || 'mpesa'
      }
      showCreateModal.value = true
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingSchedule.value = null
      form.value = {
        chama_id: '',
        amount: 0,
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        payment_method: 'mpesa'
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
      }).format(amount || 0)
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatFrequency = (freq) => {
      const freqs = {
        weekly: 'Every Week',
        'bi-weekly': 'Every 2 Weeks',
        monthly: 'Every Month',
        quarterly: 'Every 3 Months'
      }
      return freqs[freq] || freq
    }

    const formatStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }

    onMounted(() => {
      loadData()
    })

    return {
      schedules,
      myChamas,
      recentPayments,
      loading,
      saving,
      error,
      showCreateModal,
      editingSchedule,
      form,
      saveSchedule,
      pauseSchedule,
      resumeSchedule,
      cancelSchedule,
      editSchedule,
      closeModal,
      formatCurrency,
      formatDate,
      formatFrequency,
      formatStatus
    }
  }
}
</script>

<style scoped>
.recurring-contributions-container {
  padding: 2rem;
  max-width: 1000px;
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

.schedules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.schedule-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.schedule-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2d3748;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active { background: #c6f6d5; color: #22543d; }
.status-badge.paused { background: #feebc8; color: #744210; }
.status-badge.cancelled { background: #fed7d7; color: #822727; }

.schedule-details {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.detail .label { color: #718096; }
.detail .value { font-weight: 600; color: #2d3748; }

.schedule-actions {
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #edf2f7;
  padding-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  color: #718096;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e0;
}

.sub-text { font-size: 0.9rem; margin-top: 0.5rem; }

/* Buttons & Forms - Standardized */
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary { background: #2c5aa0; color: white; }
.btn-primary:hover { background: #1e4277; }
.btn-secondary { background: #edf2f7; color: #4a5568; }
.btn-warning { background: #feebc8; color: #744210; }
.btn-danger { background: #fed7d7; color: #822727; }
.btn-success { background: #c6f6d5; color: #22543d; }

.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }

/* Modal Styles - Standardized */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  width: 90%; max-width: 500px;
  border-radius: 12px;
  padding: 2rem;
}

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
.form-control {
  width: 100%; padding: 0.75rem;
  border: 1px solid #cbd5e0; border-radius: 8px;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }

.loading { text-align: center; padding: 2rem; }
.spinner {
  width: 40px; height: 40px; border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db; border-radius: 50%;
  animation: spin 2s linear infinite; margin: 0 auto 1rem;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .schedule-actions { flex-wrap: wrap; }
}
</style>

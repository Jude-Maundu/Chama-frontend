<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div>
        <h1 class="page-title">Treasurer Dashboard</h1>
        <p class="page-subtitle">Financial oversight and management for {{ chamaName }}</p>
      </div>
      <div class="date-badge">
        <i class="bi bi-calendar3"></i>
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon bg-success">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="stat-info">
            <h3>KES {{ formatMoney(stats.today_collections) }}</h3>
            <p>Today's Collections</p>
            <span class="trend up">
              <i class="bi bi-arrow-up"></i> Week: KES {{ formatMoney(stats.week_collections) }}
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-warning">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.pending_contributions || 0 }}</h3>
            <p>Pending Contributions</p>
            <span class="trend">
              <i class="bi bi-exclamation-circle"></i> Needs Review
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-info">
            <i class="bi bi-wallet2"></i>
          </div>
          <div class="stat-info">
            <h3>KES {{ formatMoney(stats.mpesa_balance) }}</h3>
            <p>M-Pesa Balance</p>
            <span class="trend">
              <i class="bi bi-bank"></i> Cash: KES {{ formatMoney(stats.cash_balance) }}
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-primary">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.overdue_loans || 0 }}</h3>
            <p>Overdue Loans</p>
            <span class="trend down">
              <i class="bi bi-arrow-down"></i> Collection Required
            </span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="row g-4">
        <!-- Quick Actions -->
        <div class="col-lg-4">
          <div class="glass-card h-100">
            <div class="card-header-custom">
              <div class="header-icon">
                <i class="bi bi-lightning-charge"></i>
              </div>
              <h5 class="mb-0">Financial Actions</h5>
            </div>
            <div class="card-body-custom">
              <div class="actions-grid-vertical">
                <button class="action-btn-horizontal" @click="$router.push('/chama-admin/finances/record')">
                  <div class="action-icon-small"><i class="bi bi-plus-circle"></i></div>
                  <div class="action-text">
                    <span>Record Contribution</span>
                    <small>Manual cash/cheque entry</small>
                  </div>
                </button>
                <button class="action-btn-horizontal" @click="$router.push('/chama-admin/loans')">
                  <div class="action-icon-small"><i class="bi bi-check2-all"></i></div>
                  <div class="action-text">
                    <span>Approve Loans</span>
                    <small>Review pending requests</small>
                  </div>
                </button>
                <button class="action-btn-horizontal" @click="$router.push('/chama-admin/finances/reconcile')">
                  <div class="action-icon-small"><i class="bi bi-arrow-repeat"></i></div>
                  <div class="action-text">
                    <span>Reconcile M-Pesa</span>
                    <small>Sync with statements</small>
                  </div>
                </button>
                <button class="action-btn-horizontal" @click="$router.push('/chama-admin/reports')">
                  <div class="action-icon-small"><i class="bi bi-file-earmark-pdf"></i></div>
                  <div class="action-text">
                    <span>Financial Reports</span>
                    <small>Monthly/Annual summaries</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="col-lg-8">
          <div class="glass-card h-100">
            <div class="card-header-custom">
              <div class="header-icon" style="background: linear-gradient(135deg, #6A1B9A, #4A148C);">
                <i class="bi bi-activity"></i>
              </div>
              <h5 class="mb-0">Recent Transactions</h5>
              <router-link to="/chama-admin/finances" class="link-small">View All</router-link>
            </div>
            <div class="card-body-custom p-0">
              <div class="table-responsive">
                <table class="table custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Member</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tx in recentTransactions" :key="tx.id">
                      <td>{{ formatDate(tx.created_at, 'MMM DD, HH:mm') }}</td>
                      <td>{{ tx.user?.name || 'N/A' }}</td>
                      <td>
                        <span class="text-capitalize">{{ tx.type }}</span>
                      </td>
                      <td :class="tx.direction === 'credit' ? 'text-success' : 'text-danger'">
                        {{ tx.direction === 'credit' ? '+' : '-' }} {{ formatMoney(tx.amount) }}
                      </td>
                      <td>
                        <span class="badge" :class="tx.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'">
                          {{ tx.status }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="recentTransactions.length === 0">
                      <td colspan="5" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-2"></i>
                        <p class="mt-2">No transactions recorded yet</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

const chamaName = ref('Your Chama')
const loading = ref(false)
const currentDate = ref('')

const stats = ref({
  today_collections: 0,
  week_collections: 0,
  pending_contributions: 0,
  overdue_loans: 0,
  mpesa_balance: 0,
  cash_balance: 0
})

const recentTransactions = ref([])

const loadDashboardData = async () => {
  loading.value = true
  try {
    const response = await api.get('/dashboard/treasurer')
    stats.value = response.data.stats
    recentTransactions.value = response.data.recentTransactions
  } catch (error) {
    console.error('Failed to load treasurer dashboard data:', error)
    Swal.fire('Error', 'Failed to load dashboard data', 'error')
  } finally {
    loading.value = false
  }
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return 'N/A'
  return dayjs(date).format(format)
}

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user && user.current_chama) {
    chamaName.value = user.current_chama.name
  }
  
  currentDate.value = dayjs().format('dddd, MMMM D, YYYY')
  await loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
}

.welcome-section {
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
  color: var(--text-primary);
}

.page-subtitle {
  color: var(--text-secondary);
  margin-bottom: 0;
}

.date-badge {
  background-color: var(--card-bg);
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 14px;
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-color);
}

.date-badge i {
  color: var(--primary-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
}

.bg-success { background: linear-gradient(135deg, #2E7D32, #1B5E20); }
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
.bg-info { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.bg-primary { background: linear-gradient(135deg, #6A1B9A, #4A148C); }

.stat-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.stat-info p {
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 14px;
}

.trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: var(--bg-tertiary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.glass-card {
  background-color: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.card-header-custom {
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--bg-secondary), var(--card-bg));
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.card-body-custom {
  padding: 24px;
}

.actions-grid-vertical {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn-horizontal {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  cursor: pointer;
}

.action-btn-horizontal:hover {
  border-color: var(--primary-color);
  background-color: var(--card-bg);
  transform: translateX(5px);
}

.action-icon-small {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: var(--card-bg);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: var(--shadow-sm);
}

.action-text span {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
}

.action-text small {
  color: var(--text-muted);
  font-size: 12px;
}

.custom-table {
  margin-bottom: 0;
}

.custom-table th {
  border-top: none;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 13px;
  padding: 12px 16px;
}

.custom-table td {
  padding: 16px;
  vertical-align: middle;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.bg-success-soft {
  background-color: rgba(46, 125, 50, 0.1);
}

.bg-warning-soft {
  background-color: rgba(255, 143, 0, 0.1);
}

.link-small {
  margin-left: auto;
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
}

@media (max-width: 768px) {
  .dashboard { padding: 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>

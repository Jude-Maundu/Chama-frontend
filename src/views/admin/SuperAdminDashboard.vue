<template>
  <div class="super-admin-dashboard">
    <div class="page-header">
      <div>
        <h1 class="page-title">Platform Overview</h1>
        <p class="page-subtitle">Monitor and manage all Chamas across the platform</p>
      </div>
      <div class="header-actions">
        <div class="system-health" :class="getHealthClass(stats.system_health)">
          <i class="bi bi-shield-check"></i>
          <span>System Health: {{ stats.system_health || 100 }}%</span>
        </div>
        <button class="btn-outline-custom" @click="refreshData">
          <i class="bi bi-arrow-repeat me-2"></i>Refresh
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-people-fill"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.total_users || 0 }}</h3>
          <p>Total Platform Users</p>
          <span class="trend up">
            <i class="bi bi-person-check"></i> Active: {{ stats.active_users || 0 }}
          </span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-diagram-3"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.total_chamas || 0 }}</h3>
          <p>Global Chamas</p>
          <span class="trend up">
            <i class="bi bi-check-circle"></i> Active: {{ stats.active_chamas || 0 }}
          </span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-warning">
          <i class="bi bi-graph-up"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(stats.platform_revenue) }}</h3>
          <p>Platform Revenue</p>
          <span class="trend">From 1% Service Fee</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-info">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatMoney(stats.total_platform_contributions) }}</h3>
          <p>Global Contributions</p>
          <span class="trend">
            <i class="bi bi-bank"></i> Loans: KES {{ formatMoney(stats.total_loans_disbursed) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon">
              <i class="bi bi-bar-chart-steps"></i>
            </div>
            <h5 class="mb-0">Monthly Revenue Growth</h5>
          </div>
          <div class="card-body-custom">
            <div class="chart-container">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon" style="background: linear-gradient(135deg, #FF8F00, #E65100);">
              <i class="bi bi-bell-fill"></i>
            </div>
            <h5 class="mb-0">System Alerts</h5>
          </div>
          <div class="card-body-custom p-0">
            <div class="alerts-list">
              <div v-for="alert in systemAlerts" :key="alert.id" class="alert-item" :class="alert.type">
                <div class="alert-icon">
                  <i :class="alert.type === 'warning' ? 'bi bi-exclamation-triangle-fill' : 'bi bi-info-circle-fill'"></i>
                </div>
                <div class="alert-content">
                  <p class="alert-message">{{ alert.message }}</p>
                  <span class="alert-time">{{ formatTime(alert.created_at) }}</span>
                </div>
              </div>
              <div v-if="systemAlerts.length === 0" class="empty-alerts">
                <i class="bi bi-check-circle-fill text-success"></i>
                <p>All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="row g-4 mt-2">
      <div class="col-lg-6">
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon" style="background: linear-gradient(135deg, #1565C0, #0D47A1);">
              <i class="bi bi-building"></i>
            </div>
            <h5 class="mb-0">New Chamas</h5>
            <router-link to="/admin/chamas" class="link-small ms-auto">View All</router-link>
          </div>
          <div class="card-body-custom p-0">
            <div class="table-responsive">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Chama Name</th>
                    <th>Members</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="chama in recentChamas" :key="chama.id">
                    <td class="fw-semibold">{{ chama.name }}</td>
                    <td>{{ chama.members_count || 0 }}</td>
                    <td>{{ formatDate(chama.created_at) }}</td>
                    <td>
                      <span :class="['status-badge', chama.status === 'active' ? 'active' : 'inactive']">
                        <i :class="chama.status === 'active' ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                        {{ chama.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="recentChamas.length === 0">
                    <td colspan="4" class="text-center py-4 text-muted">No Chamas created yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon" style="background: linear-gradient(135deg, #00897B, #00695C);">
              <i class="bi bi-activity"></i>
            </div>
            <h5 class="mb-0">Recent Transactions</h5>
            <button class="link-small ms-auto" @click="monitorTransactions">Monitor</button>
          </div>
          <div class="card-body-custom p-0">
            <div class="table-responsive">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Chama</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tx in recentTransactions" :key="tx.id">
                    <td>
                      <div class="member-info">
                        <div class="member-avatar">{{ tx.user?.name?.charAt(0) || 'U' }}</div>
                        <span>{{ tx.user?.name || 'Unknown' }}</span>
                      </div>
                    </td>
                    <td>{{ tx.chama?.name || 'N/A' }}</td>
                    <td class="text-success fw-bold">KES {{ formatMoney(tx.total_amount) }}</td>
                    <td>{{ formatDate(tx.payment_date, 'MMM DD, HH:mm') }}</td>
                  </tr>
                  <tr v-if="recentTransactions.length === 0">
                    <td colspan="4" class="text-center py-4 text-muted">No transactions yet</td>
                  </tr>
                </tbody>
              </table>
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
import Chart from 'chart.js/auto'

const stats = ref({})
const recentChamas = ref([])
const recentTransactions = ref([])
const systemAlerts = ref([])
let revenueChart = null

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return 'N/A'
  return dayjs(date).format(format)
}

const formatTime = (date) => {
  if (!date) return 'N/A'
  return dayjs(date).format('HH:mm')
}

const getHealthClass = (health) => {
  if (health >= 95) return 'status-good'
  if (health >= 80) return 'status-warning'
  return 'status-danger'
}

const fetchDashboardData = async () => {
  try {
    const response = await api.get('/admin/dashboard-stats')
    stats.value = response.data.stats || {}
    recentChamas.value = response.data.recent_chamas || []
    recentTransactions.value = response.data.recent_transactions || []
    systemAlerts.value = response.data.system_alerts || []
    
    await initializeCharts(response.data.revenue_chart)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

const initializeCharts = async (chartData) => {
  await new Promise(resolve => setTimeout(resolve, 100))
  const ctx = document.getElementById('revenueChart')
  if (!ctx) return

  if (revenueChart) revenueChart.destroy()

  revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData?.map(d => d.month) || [],
      datasets: [{
        label: 'Platform Revenue (KES)',
        data: chartData?.map(d => d.revenue) || [],
        backgroundColor: '#2E7D32',
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'KES ' + context.raw.toLocaleString()
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'KES ' + value.toLocaleString()
            }
          }
        }
      }
    }
  })
}

const refreshData = () => {
  fetchDashboardData()
}

const monitorTransactions = () => {
  // Implement transaction monitoring
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.super-admin-dashboard {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.system-health {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
}

.status-good {
  background: #E8F5E9;
  color: #2E7D32;
}

.status-warning {
  background: #FFF3E0;
  color: #FF8F00;
}

.status-danger {
  background: #FFEBEE;
  color: #E53935;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
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
.bg-primary { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
.bg-info { background: linear-gradient(135deg, #00897B, #00695C); }

.stat-info h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-info p {
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  background: #f5f5f5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.trend.up { color: #2E7D32; background: #E8F5E9; }

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
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.card-body-custom {
  padding: 20px;
}

.link-small {
  font-size: 13px;
  color: #2E7D32;
  text-decoration: none;
  cursor: pointer;
}

/* Chart */
.chart-container {
  height: 300px;
  width: 100%;
}

/* Alerts */
.alerts-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.alert-item:hover {
  background: #f8f9fa;
}

.alert-item.info .alert-icon i { color: #1565C0; }
.alert-item.warning .alert-icon i { color: #FF8F00; }

.alert-icon {
  flex-shrink: 0;
}

.alert-icon i {
  font-size: 20px;
}

.alert-content {
  flex: 1;
}

.alert-message {
  font-size: 13px;
  margin-bottom: 4px;
  color: #1a1a2e;
}

.alert-time {
  font-size: 11px;
  color: #999;
}

.empty-alerts {
  text-align: center;
  padding: 40px 20px;
}

.empty-alerts i {
  font-size: 48px;
  color: #2E7D32;
  margin-bottom: 12px;
  display: block;
}

.empty-alerts p {
  color: #666;
  margin: 0;
}

/* Tables */
.table-custom {
  width: 100%;
  border-collapse: collapse;
}

.table-custom thead {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.table-custom th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 13px;
}

.table-custom td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.table-custom tbody tr:hover {
  background: #f8f9fa;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.active {
  background: #E8F5E9;
  color: #2E7D32;
}

.status-badge.inactive {
  background: #FFEBEE;
  color: #E53935;
}

/* Buttons */
.btn-outline-custom {
  background: transparent;
  border: 2px solid #2E7D32;
  color: #2E7D32;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.btn-outline-custom:hover {
  background: #2E7D32;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .super-admin-dashboard {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .table-custom th,
  .table-custom td {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>
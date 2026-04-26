<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Financial Reports</h1>
        <p class="page-subtitle">Comprehensive financial overview and analysis</p>
      </div>
      <div class="header-actions">
        <button class="btn-outline-custom" @click="exportReport('pdf')">
          <i class="bi bi-file-earmark-pdf me-2"></i>Export PDF
        </button>
        <button class="btn-primary-custom" @click="exportReport('excel')">
          <i class="bi bi-file-earmark-excel me-2"></i>Export Excel
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="glass-card filter-card">
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <div class="input-icon-wrapper">
              <i class="bi bi-calendar3"></i>
              <input type="date" v-model="filters.start_date" class="form-control-custom" @change="loadReports">
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <label class="form-label">End Date</label>
            <div class="input-icon-wrapper">
              <i class="bi bi-calendar3"></i>
              <input type="date" v-model="filters.end_date" class="form-control-custom" @change="loadReports">
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <label class="form-label">Report Type</label>
            <div class="input-icon-wrapper">
              <i class="bi bi-bar-chart"></i>
              <select v-model="activeTab" class="form-control-custom" @change="loadReports">
                <option value="financial">Financial Summary</option>
                <option value="contributions">Contributions Report</option>
                <option value="loans">Loans Portfolio</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Financial Summary Tab -->
    <div v-else-if="activeTab === 'financial'">
      <!-- KPI Cards -->
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon bg-success">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="stat-info">
            <h3>KES {{ formatMoney(financialData.total_income) }}</h3>
            <p>Total Income</p>
            <span class="trend up">
              <i class="bi bi-arrow-up"></i> +12%
            </span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon bg-danger">
            <i class="bi bi-receipt"></i>
          </div>
          <div class="stat-info">
            <h3>KES {{ formatMoney(financialData.total_expenses) }}</h3>
            <p>Total Expenses</p>
            <span class="trend down">
              <i class="bi bi-arrow-down"></i> -5%
            </span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon" :class="financialData.net_profit >= 0 ? 'bg-warning' : 'bg-danger'">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="stat-info">
            <h3 :class="financialData.net_profit >= 0 ? 'text-success' : 'text-danger'">
              KES {{ formatMoney(financialData.net_profit) }}
            </h3>
            <p>Net Profit</p>
            <span class="trend">YTD</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon bg-info">
            <i class="bi bi-arrow-repeat"></i>
          </div>
          <div class="stat-info">
            <h3>{{ profitMargin.toFixed(1) }}%</h3>
            <p>Profit Margin</p>
            <span class="trend">Net profit ratio</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="glass-card">
            <div class="card-header-custom">
              <div class="header-icon">
                <i class="bi bi-graph-up"></i>
              </div>
              <h5 class="mb-0">Income vs Expenses</h5>
            </div>
            <div class="card-body-custom">
              <canvas ref="incomeExpenseChartRef"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="glass-card">
            <div class="card-header-custom">
              <div class="header-icon" style="background: linear-gradient(135deg, #FF8F00, #E65100);">
                <i class="bi bi-pie-chart"></i>
              </div>
              <h5 class="mb-0">Income Distribution</h5>
            </div>
            <div class="card-body-custom">
              <canvas ref="incomePieChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Breakdown Row -->
      <div class="row g-4 mt-2">
        <div class="col-md-6">
          <div class="glass-card">
            <div class="card-header-custom">
              <div class="header-icon">
                <i class="bi bi-cash"></i>
              </div>
              <h5 class="mb-0">Income Breakdown</h5>
            </div>
            <div class="card-body-custom p-0">
              <div class="breakdown-list">
                <div v-for="(amount, source) in financialData.income" :key="source" class="breakdown-item">
                  <div class="breakdown-info">
                    <i :class="getIncomeIcon(source)"></i>
                    <span>{{ formatLabel(source) }}</span>
                  </div>
                  <div class="breakdown-amount text-success">KES {{ formatMoney(amount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="glass-card">
            <div class="card-header-custom">
              <div class="header-icon" style="background: linear-gradient(135deg, #E53935, #C62828);">
                <i class="bi bi-receipt"></i>
              </div>
              <h5 class="mb-0">Expense Breakdown</h5>
            </div>
            <div class="card-body-custom p-0">
              <div class="breakdown-list">
                <div v-for="(amount, category) in financialData.expenses" :key="category" class="breakdown-item">
                  <div class="breakdown-info">
                    <i :class="getExpenseIcon(category)"></i>
                    <span>{{ formatLabel(category) }}</span>
                  </div>
                  <div class="breakdown-amount text-danger">KES {{ formatMoney(amount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contributions Report Tab -->
    <div v-else-if="activeTab === 'contributions'" class="glass-card">
      <div class="card-header-custom">
        <div class="header-icon" style="background: linear-gradient(135deg, #2E7D32, #1B5E20);">
          <i class="bi bi-cash-stack"></i>
        </div>
        <h5 class="mb-0">Contributions Report</h5>
        <div class="ms-auto">
          <span class="report-period">{{ formatDate(filters.start_date) }} - {{ formatDate(filters.end_date) }}</span>
        </div>
      </div>
      <div class="card-body-custom">
        <!-- Summary Cards -->
        <div class="stats-grid mb-4">
          <div class="stat-card glass-card">
            <div class="stat-icon bg-success">
              <i class="bi bi-cash"></i>
            </div>
            <div class="stat-info">
              <h3>KES {{ formatMoney(contributionsData.summary.total) }}</h3>
              <p>Total Contributions</p>
            </div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon bg-info">
              <i class="bi bi-percent"></i>
            </div>
            <div class="stat-info">
              <h3>{{ contributionsData.summary.collection_rate.toFixed(1) }}%</h3>
              <p>Collection Rate</p>
            </div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-people"></i>
            </div>
            <div class="stat-info">
              <h3>{{ contributionsData.summary.active_members || 0 }}</h3>
              <p>Active Members</p>
            </div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon bg-primary">
              <i class="bi bi-calendar"></i>
            </div>
            <div class="stat-info">
              <h3>{{ contributionsData.contributions.length || 0 }}</h3>
              <p>Transactions</p>
            </div>
          </div>
        </div>

        <!-- Contributions Table -->
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contribution in contributionsData.contributions" :key="contribution.id">
                <td>
                  <div class="member-info">
                    <div class="member-avatar">{{ contribution.user?.name?.charAt(0) || 'U' }}</div>
                    <span>{{ contribution.user?.name || 'Unknown' }}</span>
                  </div>
                </td>
                <td class="text-success fw-bold">KES {{ formatMoney(contribution.total_amount) }}</td>
                <td>
                  <span class="method-badge" :class="contribution.payment_method">
                    <i :class="getMethodIcon(contribution.payment_method)"></i>
                    {{ formatLabel(contribution.payment_method) }}
                  </span>
                </td>
                <td>{{ formatDate(contribution.payment_date) }}</td>
                <td>
                  <button class="action-btn" @click="downloadReceipt(contribution)">
                    <i class="bi bi-download"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="contributionsData.contributions.length === 0">
                <td colspan="5" class="text-center py-4">No contributions found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Loans Report Tab -->
    <div v-else-if="activeTab === 'loans'" class="glass-card">
      <div class="card-header-custom">
        <div class="header-icon" style="background: linear-gradient(135deg, #1565C0, #0D47A1);">
          <i class="bi bi-bank"></i>
        </div>
        <h5 class="mb-0">Loans Portfolio</h5>
      </div>
      <div class="card-body-custom">
        <!-- Portfolio Summary -->
        <div class="stats-grid mb-4">
          <div class="stat-card glass-card">
            <div class="stat-icon bg-success">
              <i class="bi bi-cash-stack"></i>
            </div>
            <div class="stat-info">
              <h3>KES {{ formatMoney(loansData.portfolio.total_disbursed) }}</h3>
              <p>Total Disbursed</p>
            </div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-bank"></i>
            </div>
            <div class="stat-info">
              <h3>KES {{ formatMoney(loansData.portfolio.outstanding) }}</h3>
              <p>Outstanding Balance</p>
            </div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon bg-danger">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="stat-info">
              <h3>{{ loansData.portfolio.default_rate.toFixed(1) }}%</h3>
              <p>Default Rate</p>
            </div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon bg-info">
              <i class="bi bi-people"></i>
            </div>
            <div class="stat-info">
              <h3>{{ loansData.portfolio.active_loans || 0 }}</h3>
              <p>Active Loans</p>
            </div>
          </div>
        </div>

        <!-- Loans Table -->
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Member</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Disbursement Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in loansData.loans" :key="loan.id">
                <td>
                  <div class="member-info">
                    <div class="member-avatar">{{ loan.user?.name?.charAt(0) || 'U' }}</div>
                    <span>{{ loan.user?.name || 'Unknown' }}</span>
                  </div>
                </td>
                <td>
                  <span class="loan-type-badge" :class="loan.loan_type">
                    <i :class="getLoanTypeIcon(loan.loan_type)"></i>
                    {{ formatLabel(loan.loan_type) }}
                  </span>
                </td>
                <td class="fw-bold">KES {{ formatMoney(loan.amount) }}</td>
                <td class="text-warning fw-bold">KES {{ formatMoney(loan.balance) }}</td>
                <td>
                  <span :class="['status-badge', loan.status]">
                    <i :class="getStatusIcon(loan.status)"></i>
                    {{ formatLabel(loan.status) }}
                  </span>
                </td>
                <td>{{ formatDate(loan.disbursement_date) || 'Pending' }}</td>
              </tr>
              <tr v-if="loansData.loans.length === 0">
                <td colspan="6" class="text-center py-4">No loans found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { reportApi } from '@/api/reports'
import Chart from 'chart.js/auto'
import Swal from 'sweetalert2'

const activeTab = ref('financial')
const loading = ref(false)

const filters = ref({
  start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0]
})

const financialData = ref({
  income: {},
  expenses: {},
  total_income: 0,
  total_expenses: 0,
  net_profit: 0
})

const contributionsData = ref({
  contributions: [],
  summary: {
    total: 0,
    collection_rate: 0,
    active_members: 0
  }
})

const loansData = ref({
  loans: [],
  portfolio: {
    total_disbursed: 0,
    outstanding: 0,
    default_rate: 0,
    active_loans: 0
  }
})

const profitMargin = computed(() => {
  if (financialData.value.total_income === 0) return 0
  return (financialData.value.net_profit / financialData.value.total_income) * 100
})

let incomeExpenseChart = null
let incomePieChart = null
const incomeExpenseChartRef = ref(null)
const incomePieChartRef = ref(null)

const loadReports = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'financial') {
      const response = await reportApi.getFinancial(filters.value)
      financialData.value = response.data
      await nextTick()
      renderCharts()
    } else if (activeTab.value === 'contributions') {
      const response = await reportApi.getContributions(filters.value)
      contributionsData.value = response.data
    } else if (activeTab.value === 'loans') {
      const response = await reportApi.getLoans(filters.value)
      loansData.value = response.data
    }
  } catch (error) {
    console.error('Failed to load reports:', error)
    Swal.fire('Error', 'Failed to load reports', 'error')
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  // Income vs Expenses Bar Chart
  const ctx1 = incomeExpenseChartRef.value
  if (ctx1) {
    if (incomeExpenseChart) incomeExpenseChart.destroy()
    incomeExpenseChart = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          label: 'Amount (KES)',
          data: [financialData.value.total_income, financialData.value.total_expenses],
          backgroundColor: ['#2E7D32', '#E53935'],
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
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

  // Income Pie Chart
  const ctx2 = incomePieChartRef.value
  if (ctx2 && Object.keys(financialData.value.income).length > 0) {
    if (incomePieChart) incomePieChart.destroy()
    const labels = Object.keys(financialData.value.income).map(k => formatLabel(k))
    const data = Object.values(financialData.value.income)
    incomePieChart = new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#2E7D32', '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.raw || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: KES ${value.toLocaleString()} (${percentage}%)`
              }
            }
          }
        }
      }
    })
  }
}

const exportReport = async (format) => {
  try {
    const response = await reportApi.export(activeTab.value, format, filters.value)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${activeTab.value}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    Swal.fire('Success', `Report exported as ${format.toUpperCase()}`, 'success')
  } catch (error) {
    Swal.fire('Error', 'Failed to export report', 'error')
  }
}

const downloadReceipt = (contribution) => {
  Swal.fire('Download', `Downloading receipt for contribution #${contribution.id}`, 'info')
}

const getIncomeIcon = (source) => {
  const icons = {
    contributions: 'bi bi-cash-stack',
    interest: 'bi bi-percent',
    dividends: 'bi bi-gift',
    other: 'bi bi-plus-circle'
  }
  return icons[source] || 'bi bi-currency-dollar'
}

const getExpenseIcon = (category) => {
  const icons = {
    loan_disbursements: 'bi bi-bank',
    operational: 'bi bi-gear',
    salaries: 'bi bi-person-badge',
    other: 'bi bi-dash-circle'
  }
  return icons[category] || 'bi bi-receipt'
}

const getMethodIcon = (method) => {
  const icons = {
    mpesa: 'bi bi-phone',
    cash: 'bi bi-cash',
    bank: 'bi bi-bank'
  }
  return icons[method] || 'bi bi-credit-card'
}

const getLoanTypeIcon = (type) => {
  const icons = {
    emergency: 'bi bi-exclamation-triangle',
    development: 'bi bi-building',
    education: 'bi bi-book',
    welfare: 'bi bi-heart'
  }
  return icons[type] || 'bi bi-bank'
}

const getStatusIcon = (status) => {
  const icons = {
    disbursed: 'bi bi-check-circle',
    approved: 'bi bi-clock-history',
    pending: 'bi bi-hourglass-split',
    rejected: 'bi bi-x-circle',
    completed: 'bi bi-check-circle-fill'
  }
  return icons[status] || 'bi bi-question-circle'
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatLabel = (str) => {
  if (!str) return ''
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

watch(activeTab, () => {
  loadReports()
})

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.reports-page {
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
  gap: 12px;
}

/* Glass Card */
.glass-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  margin-bottom: 24px;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.filter-card {
  padding: 20px;
}

/* Card Header */
.card-header-custom {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

.report-period {
  font-size: 12px;
  color: #999;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
}

.bg-success { background: linear-gradient(135deg, #2E7D32, #1B5E20); }
.bg-danger { background: linear-gradient(135deg, #E53935, #C62828); }
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
.bg-info { background: linear-gradient(135deg, #1565C0, #0D47A1); }

.stat-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stat-info p {
  color: #666;
  margin-bottom: 6px;
  font-size: 12px;
}

.trend {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f5f5f5;
  display: inline-block;
}

.trend.up { color: #2E7D32; background: #E8F5E9; }
.trend.down { color: #E53935; background: #FFEBEE; }

.text-success { color: #2E7D32 !important; }
.text-danger { color: #E53935 !important; }

/* Breakdown List */
.breakdown-list {
  display: flex;
  flex-direction: column;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.breakdown-info i {
  width: 28px;
  color: #2E7D32;
  font-size: 18px;
}

.breakdown-amount {
  font-weight: 600;
}

/* Table Styles */
.table-custom {
  width: 100%;
  border-collapse: collapse;
}

.table-custom thead {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.table-custom th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 13px;
}

.table-custom td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
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

.method-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.method-badge.mpesa { background: #E3F2FD; color: #1565C0; }
.method-badge.cash { background: #E8F5E9; color: #2E7D32; }
.method-badge.bank { background: #FFF3E0; color: #FF8F00; }

.loan-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.loan-type-badge.emergency { background: #FFEBEE; color: #E53935; }
.loan-type-badge.development { background: #E3F2FD; color: #1565C0; }
.loan-type-badge.education { background: #E8F5E9; color: #2E7D32; }
.loan-type-badge.welfare { background: #FFF3E0; color: #FF8F00; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.disbursed { background: #E8F5E9; color: #2E7D32; }
.status-badge.approved { background: #E3F2FD; color: #1565C0; }
.status-badge.pending { background: #FFF3E0; color: #FF8F00; }
.status-badge.rejected { background: #FFEBEE; color: #E53935; }

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #666;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
  color: #2E7D32;
}

/* Form Elements */
.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 13px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-wrapper i:first-child {
  position: absolute;
  left: 12px;
  color: #2E7D32;
  z-index: 1;
}

.form-control-custom {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control-custom:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

/* Buttons */
.btn-primary-custom {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.btn-primary-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
}

.btn-outline-custom {
  background: transparent;
  border: 2px solid #2E7D32;
  color: #2E7D32;
  padding: 8px 20px;
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
  .reports-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-outline-custom,
  .btn-primary-custom {
    flex: 1;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .breakdown-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .table-custom th,
  .table-custom td {
    padding: 10px 12px;
    font-size: 12px;
  }
}
</style>
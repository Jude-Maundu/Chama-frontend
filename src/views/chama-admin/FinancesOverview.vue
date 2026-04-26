<template>
  <div class="admin-content">
    <div class="admin-header">
      <h1 class="admin-header-title">Financial Overview</h1>
      <div class="admin-header-actions">
        <button class="btn btn-primary btn-sm" @click="exportReport('pdf')">
          <i class="bi bi-file-pdf"></i> Export PDF
        </button>
        <button class="btn btn-outline-primary btn-sm" @click="exportReport('csv')">
          <i class="bi bi-file-earmark-excel"></i> Export CSV
        </button>
      </div>
    </div>

    <!-- Financial Summary Cards -->
    <div class="admin-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Total Asset Value</h6>
            <div class="stat-card-value">KES {{ formatCurrency(financials.total_contributions || 0) }}</div>
          </div>
          <div class="stat-card-icon">
            <i class="bi bi-bank"></i>
          </div>
        </div>
        <div class="stat-card-change positive">
          <i class="bi bi-shield-check"></i> Health: {{ financials.financial_health || 'Stable' }}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Outstanding Loans</h6>
            <div class="stat-card-value">KES {{ formatCurrency(financials.total_loans_disbursed || 0) }}</div>
          </div>
          <div class="stat-card-icon">
            <i class="bi bi-cash-stack"></i>
          </div>
        </div>
        <div class="stat-card-change">
          <i class="bi bi-info-circle"></i> Active Loans: {{ financials.loan_count || 0 }}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Dividends Distributed</h6>
            <div class="stat-card-value">KES {{ formatCurrency(financials.total_dividends || 0) }}</div>
          </div>
          <div class="stat-card-icon">
            <i class="bi bi-pie-chart"></i>
          </div>
        </div>
        <div class="stat-card-change">
          <i class="bi bi-person-check"></i> Per Member: KES {{ formatCurrency(financials.avg_dividend_per_member || 0) }}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Reserve Fund</h6>
            <div class="stat-card-value">KES {{ formatCurrency(financials.reserve_fund || 0) }}</div>
          </div>
          <div class="stat-card-icon">
            <i class="bi bi-safe"></i>
          </div>
        </div>
        <div class="stat-card-change positive">
          <i class="bi bi-graph-up"></i> 10% of total assets
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="admin-row">
      <div class="admin-col">
        <div class="admin-chart-container">
          <h5 class="admin-chart-title">Income vs Expenses</h5>
          <div style="height: 300px; position: relative;">
            <canvas id="incomeExpenseChart"></canvas>
          </div>
        </div>
      </div>
      <div class="admin-col">
        <div class="admin-chart-container">
          <h5 class="admin-chart-title">Income Sources</h5>
          <div style="height: 300px; position: relative;">
            <canvas id="incomeSourcesChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="admin-table-container mt-3">
      <div class="admin-table-header">
        <h5>Recent Financial Transactions</h5>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Member/Entity</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>{{ formatDate(tx.created_at) }}</td>
              <td>
                <span class="badge" :class="tx.type === 'contribution' ? 'badge-success' : 'badge-danger'">
                  {{ tx.type }}
                </span>
              </td>
              <td class="fw-semibold">{{ tx.member_name }}</td>
              <td>{{ tx.description }}</td>
              <td :class="tx.type === 'contribution' ? 'text-success' : 'text-danger'">
                {{ tx.type === 'contribution' ? '+' : '-' }}KES {{ formatCurrency(tx.amount) }}
              </td>
              <td>KES {{ formatCurrency(tx.balance) }}</td>
            </tr>
            <tr v-if="transactions.length === 0">
              <td colspan="6" class="text-center p-3 text-muted">No transactions found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import api from '@/api/axios'

const financials = ref({})
const transactions = ref([])
const loading = ref(false)
let incomeExpenseChart = null
let incomeSourcesChart = null

const formatCurrency = (amount) => {
  return Number(amount).toLocaleString()
}

const formatDate = (date) => {
  return dayjs(date).format('MMM DD, YYYY HH:mm')
}

const fetchFinancialData = async () => {
  loading.value = true
  try {
    const response = await api.get('/chama-admin/finances')
    financials.value = response.data.financials || {}
    transactions.value = response.data.transactions || []

    await initializeCharts()
  } catch (error) {
    console.error('Error fetching financial data:', error)
    Swal.fire('Error', 'Failed to fetch financial data', 'error')
  } finally {
    loading.value = false
  }
}

const initializeCharts = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))

  const ieCtx = document.getElementById('incomeExpenseChart')
  const isCtx = document.getElementById('incomeSourcesChart')

  if (ieCtx) {
    if (incomeExpenseChart) incomeExpenseChart.destroy()
    incomeExpenseChart = new Chart(ieCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Income',
            data: financials.value.monthly_revenue || [],
            backgroundColor: '#2E7D32'
          },
          {
            label: 'Expenses',
            data: financials.value.monthly_expenses || [],
            backgroundColor: '#D32F2F'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }

  if (isCtx) {
    if (incomeSourcesChart) incomeSourcesChart.destroy()
    incomeSourcesChart = new Chart(isCtx, {
      type: 'doughnut',
      data: {
        labels: financials.value.income_sources?.map(s => s.name) || [],
        datasets: [{
          data: financials.value.income_sources?.map(s => s.amount) || [],
          backgroundColor: ['#2E7D32', '#1976D2', '#FFA000', '#7B1FA2']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    })
  }
}

const exportReport = (format) => {
  const token = localStorage.getItem('token')
  const url = `http://localhost:8000/api/reports/export/financial/${format}?token=${token}`
  
  Swal.fire({
    title: 'Exporting...',
    text: 'Your report is being generated',
    icon: 'info',
    showConfirmButton: false,
    timer: 2000,
    didOpen: () => {
      window.location.href = url
    }
  })
}

onMounted(() => {
  fetchFinancialData()
})
</script>

<style scoped>
.mt-3 {
  margin-top: 1.5rem;
}

.text-success {
  color: #388E3C;
}

.text-danger {
  color: #D32F2F;
}
</style>

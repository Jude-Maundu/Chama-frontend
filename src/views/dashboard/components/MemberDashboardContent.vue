<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ userName }}! 👋</p>
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
            <h3>KES {{ formatMoney(stats.total_contributions) }}</h3>
            <p>Total Contributions</p>
            <span class="trend up">
              <i class="bi bi-arrow-up"></i> +{{ stats.contributions_growth || 12 }}%
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-warning">
            <i class="bi bi-bank"></i>
          </div>
          <div class="stat-info">
            <h3>KES {{ formatMoney(stats.outstanding_loans) }}</h3>
            <p>Outstanding Loans</p>
            <span class="trend down">
              <i class="bi bi-arrow-down"></i> -{{ stats.loans_reduction || 5 }}%
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-info">
            <i class="bi bi-calendar-check"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.next_payment_due || 'No due payments' }}</h3>
            <p>Next Payment Due</p>
            <span class="trend">
              <i class="bi bi-clock"></i> {{ daysUntilDue }} days left
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-primary">
            <i class="bi bi-people"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.attendance_rate || 0 }}%</h3>
            <p>Meeting Attendance</p>
            <span class="trend up">
              <i class="bi bi-arrow-up"></i> Excellent
            </span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="row g-4">
        <!-- Quick Actions -->
        <div class="col-lg-6">
          <div class="glass-card">
            <div class="card-header-custom">
              <div class="header-icon">
                <i class="bi bi-lightning-charge"></i>
              </div>
              <h5 class="mb-0">Quick Actions</h5>
            </div>
            <div class="card-body-custom">
              <div class="actions-grid">
                <button class="action-btn" @click="$router.push('/app/contributions')">
                  <i class="bi bi-cash-stack"></i>
                  <span>Make Payment</span>
                  <small class="text-muted">Pay your contribution</small>
                </button>
                <button class="action-btn" @click="$router.push('/app/loans/apply')">
                  <i class="bi bi-bank"></i>
                  <span>Apply Loan</span>
                  <small class="text-muted">Get instant approval</small>
                </button>
                <button class="action-btn" @click="$router.push('/app/meetings')">
                  <i class="bi bi-calendar"></i>
                  <span>View Meetings</span>
                  <small class="text-muted">Check schedule</small>
                </button>
                <button class="action-btn" @click="$router.push('/app/reports')">
                  <i class="bi bi-file-text"></i>
                  <span>Get Statement</span>
                  <small class="text-muted">Download report</small>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-lg-6">
          <div class="glass-card">
            <div class="card-header-custom">
              <div class="header-icon" style="background: linear-gradient(135deg, #FF8F00, #E65100);">
                <i class="bi bi-activity"></i>
              </div>
              <h5 class="mb-0">Recent Activity</h5>
              <router-link to="/app/contributions/history" class="link-small">View All</router-link>
            </div>
            <div class="card-body-custom p-0">
              <div class="activity-list">
                <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                  <div :class="['activity-icon', activity.type]">
                    <i :class="activity.icon"></i>
                  </div>
                  <div class="activity-details">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                  <div class="activity-amount" :class="activity.amountClass">
                    {{ activity.amount }}
                  </div>
                </div>
                <div v-if="recentActivities.length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-4"></i>
                  <p class="mb-0 mt-2">No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Meetings Section -->
      <div class="glass-card mt-4">
        <div class="card-header-custom">
          <div class="header-icon" style="background: linear-gradient(135deg, #00897B, #00695C);">
            <i class="bi bi-calendar-event"></i>
          </div>
          <h5 class="mb-0">Upcoming Meetings</h5>
          <router-link to="/app/meetings" class="link-small">Schedule Meeting</router-link>
        </div>
        <div class="card-body-custom">
          <div class="row g-3">
            <div v-for="meeting in upcomingMeetings" :key="meeting.id" class="col-md-4">
              <div class="meeting-card-mini">
                <div class="meeting-date-mini">
                  <div class="date-day">{{ formatDate(meeting.meeting_date, 'DD') }}</div>
                  <div class="date-month">{{ formatDate(meeting.meeting_date, 'MMM') }}</div>
                </div>
                <div class="meeting-info-mini">
                  <h6>{{ meeting.title }}</h6>
                  <small>{{ meeting.venue }}</small>
                </div>
              </div>
            </div>
            <div v-if="upcomingMeetings.length === 0" class="col-12 text-center py-3 text-muted">
              No upcoming meetings scheduled
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import dayjs from 'dayjs'

const userName = ref('Member')
const loading = ref(false)
const currentDate = ref('')
const daysUntilDue = ref(0)

const stats = ref({
  total_contributions: 0,
  outstanding_loans: 0,
  next_payment_due: null,
  attendance_rate: 0,
  contributions_growth: 12,
  loans_reduction: 5
})

const recentActivities = ref([])
const upcomingMeetings = ref([])

const loadDashboardStats = async () => {
  loading.value = true
  try {
    const response = await api.get('/dashboard/member')
    stats.value = { ...stats.value, ...response.data }
    
    if (stats.value.next_payment_due) {
      const dueDate = dayjs(stats.value.next_payment_due)
      daysUntilDue.value = dueDate.diff(dayjs(), 'day')
    }
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

const loadRecentActivity = async () => {
  try {
    const response = await api.get('/contributions/history')
    const contributions = response.data.data || []
    
    recentActivities.value = contributions.map(c => ({
      id: c.id,
      type: 'contribution',
      icon: 'bi bi-cash-stack',
      title: 'Contribution Made',
      time: dayjs(c.payment_date).format('MMM DD, YYYY'),
      amount: `+ KES ${formatMoney(c.total_amount)}`,
      amountClass: 'positive'
    })).slice(0, 5)
  } catch (error) {
    console.error('Failed to load recent activity:', error)
  }
}

const loadUpcomingMeetings = async () => {
  try {
    const response = await api.get('/meetings')
    const allMeetings = response.data.data || []
    upcomingMeetings.value = allMeetings.filter(m => dayjs(m.meeting_date).isAfter(dayjs())).slice(0, 3)
  } catch (error) {
    console.error('Failed to load upcoming meetings:', error)
  }
}

const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return 'N/A'
  return dayjs(date).format(format)
}

const formatMoney = (amount) => {
  return (amount || 0).toLocaleString()
}

onMounted(async () => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userName.value = userData.name
  }
  
  currentDate.value = dayjs().format('dddd, MMMM D, YYYY')
  
  await Promise.all([
    loadDashboardStats(),
    loadRecentActivity(),
    loadUpcomingMeetings()
  ])
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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
  font-size: 24px;
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

.trend.up { color: #2E7D32; background-color: rgba(46, 125, 50, 0.1); }
.trend.down { color: #E53935; background-color: rgba(229, 57, 53, 0.1); }

/* Glass Card */
.glass-card {
  background-color: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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

.link-small {
  margin-left: auto;
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
}

/* Quick Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.action-btn {
  padding: 20px;
  background-color: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn i { 
  font-size: 32px; 
  color: var(--primary-color);
  transition: all 0.3s;
}

.action-btn span { 
  font-weight: 600;
  color: var(--text-primary);
}

.action-btn small {
  font-size: 11px;
  color: var(--text-muted);
}

.action-btn:hover {
  transform: translateY(-4px);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.action-btn:hover i {
  transform: scale(1.1);
}

/* Activity List */
.activity-list {
  max-height: 350px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.activity-item:hover {
  background-color: var(--bg-secondary);
}

.activity-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.activity-icon.contribution { background-color: rgba(46, 125, 50, 0.1); color: #2E7D32; }
.activity-icon.loan { background-color: rgba(255, 143, 0, 0.1); color: #FF8F00; }
.activity-icon.meeting { background-color: rgba(21, 101, 192, 0.1); color: #1565C0; }

.activity-details {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
}

.activity-amount {
  font-weight: 600;
}

.activity-amount.positive { color: #2E7D32; }
.activity-amount.negative { color: #E53935; }
.activity-amount.neutral { color: var(--text-secondary); }

/* Meeting Cards Mini */
.meeting-card-mini {
  background-color: var(--bg-tertiary);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 16px;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}

.meeting-card-mini:hover {
  background-color: var(--bg-secondary);
  transform: translateX(4px);
}

.meeting-date-mini {
  text-align: center;
  min-width: 50px;
}

.date-day {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.date-month {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.meeting-info-mini h6 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.meeting-info-mini small {
  font-size: 11px;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }

  .card-header-custom {
    padding: 16px 20px;
  }

  .card-body-custom {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .activity-item {
    padding: 12px 16px;
  }

  .meeting-card-mini {
    flex-direction: column;
    text-align: center;
  }

  .meeting-date-mini {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
}
</style>

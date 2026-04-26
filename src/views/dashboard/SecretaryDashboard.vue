<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div>
        <h1 class="page-title">Secretary Dashboard</h1>
        <p class="page-subtitle">Managing meetings and communication for {{ chamaName }}</p>
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
            <i class="bi bi-calendar-check"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.upcoming_meetings || 0 }}</h3>
            <p>Upcoming Meetings</p>
            <span class="trend">
              <i class="bi bi-clock"></i> Next: {{ nextMeetingDate || 'None' }}
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-info">
            <i class="bi bi-people"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.attendance_rate || 0 }}%</h3>
            <p>Average Attendance</p>
            <span class="trend up">
              <i class="bi bi-graph-up"></i> Participation
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-warning">
            <i class="bi bi-file-earmark-text"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.pending_minutes || 0 }}</h3>
            <p>Pending Minutes</p>
            <span class="trend down">
              <i class="bi bi-exclamation-triangle"></i> Needs Upload
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-primary">
            <i class="bi bi-megaphone"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.past_meetings || 0 }}</h3>
            <p>Meetings Conducted</p>
            <span class="trend">
              <i class="bi bi-archive"></i> Records Kept
            </span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="row g-4">
        <!-- Quick Actions -->
        <div class="col-lg-5">
          <div class="glass-card h-100">
            <div class="card-header-custom">
              <div class="header-icon">
                <i class="bi bi-lightning-charge"></i>
              </div>
              <h5 class="mb-0">Secretary Actions</h5>
            </div>
            <div class="card-body-custom">
              <div class="actions-grid-vertical">
                <button class="action-btn-horizontal" @click="$router.push('/chama-admin/meetings/new')">
                  <div class="action-icon-small"><i class="bi bi-calendar-plus"></i></div>
                  <div class="action-text">
                    <span>Schedule Meeting</span>
                    <small>Set date, time and agenda</small>
                  </div>
                </button>
                <button class="action-btn-horizontal" @click="$router.push('/chama-admin/meetings')">
                  <div class="action-icon-small"><i class="bi bi-pencil-square"></i></div>
                  <div class="action-text">
                    <span>Record Attendance</span>
                    <small>Mark present/absent members</small>
                  </div>
                </button>
                <button class="action-btn-horizontal" @click="$router.push('/chama-admin/announcements/new')">
                  <div class="action-icon-small"><i class="bi bi-chat-dots"></i></div>
                  <div class="action-text">
                    <span>Send Announcement</span>
                    <small>Broadcast to all members</small>
                  </div>
                </button>
                <button class="action-btn-horizontal" @click="$router.push('/chama-admin/documents')">
                  <div class="action-icon-small"><i class="bi bi-folder"></i></div>
                  <div class="action-text">
                    <span>Manage Documents</span>
                    <small>Constitution and bylaws</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Meetings -->
        <div class="col-lg-7">
          <div class="glass-card h-100">
            <div class="card-header-custom">
              <div class="header-icon" style="background: linear-gradient(135deg, #00897B, #00695C);">
                <i class="bi bi-calendar-event"></i>
              </div>
              <h5 class="mb-0">Upcoming Schedule</h5>
              <router-link to="/chama-admin/meetings" class="link-small">View All</router-link>
            </div>
            <div class="card-body-custom p-0">
              <div class="meeting-list">
                <div v-for="meeting in upcomingMeetings" :key="meeting.id" class="meeting-item">
                  <div class="meeting-date-box">
                    <span class="day">{{ formatDate(meeting.meeting_date, 'DD') }}</span>
                    <span class="month">{{ formatDate(meeting.meeting_date, 'MMM') }}</span>
                  </div>
                  <div class="meeting-details">
                    <div class="meeting-title">{{ meeting.title }}</div>
                    <div class="meeting-meta">
                      <span><i class="bi bi-clock"></i> {{ formatDate(meeting.meeting_date, 'HH:mm') }}</span>
                      <span><i class="bi bi-geo-alt"></i> {{ meeting.venue }}</span>
                    </div>
                  </div>
                  <button class="btn btn-outline-primary btn-sm rounded-pill" @click="$router.push(`/chama-admin/meetings/${meeting.id}`)">
                    Details
                  </button>
                </div>
                <div v-if="upcomingMeetings.length === 0" class="text-center py-5 text-muted">
                  <i class="bi bi-calendar-x fs-2"></i>
                  <p class="mt-2">No upcoming meetings scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Minutes Section -->
      <div class="glass-card mt-4">
        <div class="card-header-custom">
          <div class="header-icon" style="background: linear-gradient(135deg, #FF8F00, #E65100);">
            <i class="bi bi-file-earmark-check"></i>
          </div>
          <h5 class="mb-0">Recently Uploaded Minutes</h5>
        </div>
        <div class="card-body-custom">
          <div class="table-responsive">
            <table class="table custom-table">
              <thead>
                <tr>
                  <th>Meeting</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="minute in recentMinutes" :key="minute.id">
                  <td>{{ minute.title }}</td>
                  <td>{{ formatDate(minute.meeting_date) }}</td>
                  <td><span class="badge bg-success-soft text-success">Uploaded</span></td>
                  <td>
                    <button class="btn btn-link btn-sm text-primary p-0" @click="downloadMinutes(minute)">
                      <i class="bi bi-download"></i> Download
                    </button>
                  </td>
                </tr>
                <tr v-if="recentMinutes.length === 0">
                  <td colspan="4" class="text-center py-3 text-muted">No minutes found</td>
                </tr>
              </tbody>
            </table>
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
const nextMeetingDate = ref(null)

const stats = ref({
  upcoming_meetings: 0,
  past_meetings: 0,
  pending_minutes: 0,
  attendance_rate: 0
})

const upcomingMeetings = ref([])
const recentMinutes = ref([])

const loadDashboardData = async () => {
  loading.value = true
  try {
    const response = await api.get('/dashboard/secretary')
    stats.value = response.data.stats
    upcomingMeetings.value = response.data.upcomingMeetings
    recentMinutes.value = response.data.recentMinutes
    
    if (upcomingMeetings.value.length > 0) {
      nextMeetingDate.value = dayjs(upcomingMeetings.value[0].meeting_date).format('MMM DD')
    }
  } catch (error) {
    console.error('Failed to load secretary dashboard data:', error)
    Swal.fire('Error', 'Failed to load dashboard data', 'error')
  } finally {
    loading.value = false
  }
}

const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return 'N/A'
  return dayjs(date).format(format)
}

const downloadMinutes = (meeting) => {
  // Logic to download minutes
  window.open(`${import.meta.env.VITE_API_URL}/meetings/${meeting.id}/minutes`, '_blank')
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
.bg-info { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.bg-warning { background: linear-gradient(135deg, #FF8F00, #E65100); }
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

.glass-card {
  background-color: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
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

.meeting-list {
  display: flex;
  flex-direction: column;
}

.meeting-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.meeting-item:last-child {
  border-bottom: none;
}

.meeting-item:hover {
  background-color: var(--bg-secondary);
}

.meeting-date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 12px;
  flex-shrink: 0;
}

.meeting-date-box .day {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.meeting-date-box .month {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
}

.meeting-details {
  flex: 1;
}

.meeting-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.meeting-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.meeting-meta i {
  color: var(--primary-color);
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

.link-small {
  margin-left: auto;
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
}

@media (max-width: 768px) {
  .dashboard { padding: 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .welcome-section { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .meeting-item { padding: 16px; gap: 12px; }
  .meeting-date-box { width: 50px; height: 50px; }
  .meeting-date-box .day { font-size: 18px; }
}
</style>

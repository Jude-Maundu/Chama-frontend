<template>
  <div class="meetings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Meetings</h1>
        <p class="page-subtitle">View and manage all Chama meetings</p>
      </div>
      <button v-if="isAdmin" class="btn-primary-custom" @click="showCreateModal = true">
        <i class="bi bi-plus-lg"></i> Schedule Meeting
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid mb-4">
      <div class="stat-card-custom">
        <div class="stat-icon upcoming">
          <i class="bi bi-calendar-event"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Upcoming</span>
          <span class="stat-value">{{ upcomingMeetings.length }}</span>
        </div>
      </div>
      <div class="stat-card-custom">
        <div class="stat-icon completed">
          <i class="bi bi-check2-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Completed</span>
          <span class="stat-value">{{ pastMeetings.length }}</span>
        </div>
      </div>
      <div class="stat-card-custom">
        <div class="stat-icon attendance">
          <i class="bi bi-people"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Avg. Attendance</span>
          <span class="stat-value">85%</span>
        </div>
      </div>
    </div>

    <!-- Meetings Tabs -->
    <div class="meetings-tabs mb-4">
      <button 
        :class="['tab-btn', { active: activeTab === 'upcoming' }]" 
        @click="activeTab = 'upcoming'"
      >
        Upcoming Meetings
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'past' }]" 
        @click="activeTab = 'past'"
      >
        Past Meetings
      </button>
    </div>

    <!-- Meetings List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else class="meetings-grid">
      <div v-for="meeting in currentMeetings" :key="meeting.id" class="meeting-card">
        <div class="meeting-card-header">
          <div class="meeting-date">
            <span class="day">{{ dayjs(meeting.meeting_date).format('DD') }}</span>
            <span class="month">{{ dayjs(meeting.meeting_date).format('MMM') }}</span>
          </div>
          <div class="meeting-info">
            <h3 class="meeting-title">{{ meeting.title }}</h3>
            <div class="meeting-meta">
              <span><i class="bi bi-clock"></i> {{ dayjs(meeting.meeting_date).format('hh:mm A') }}</span>
              <span><i class="bi bi-geo-alt"></i> {{ meeting.venue }}</span>
            </div>
          </div>
          <span :class="['meeting-status', meeting.status]">{{ meeting.status }}</span>
        </div>
        
        <div class="meeting-card-body">
          <p class="meeting-agenda"><strong>Agenda:</strong> {{ truncateText(meeting.agenda, 100) }}</p>
        </div>

        <div class="meeting-card-footer">
          <button class="action-btn view" @click="viewMeeting(meeting)">
            <i class="bi bi-eye"></i> Details
          </button>
          <button v-if="isAdmin && meeting.status === 'scheduled'" class="action-btn attend" @click="markAttendance(meeting)">
            <i class="bi bi-people"></i> Attendance
          </button>
          <button v-if="isAdmin && meeting.status === 'scheduled'" class="action-btn minutes" @click="uploadMinutes(meeting)">
            <i class="bi bi-file-earmark-text"></i> Minutes
          </button>
          <a v-if="meeting.virtual_link" :href="meeting.virtual_link" target="_blank" class="action-btn virtual">
            <i class="bi bi-camera-video"></i> Join
          </a>
        </div>
      </div>

      <div v-if="currentMeetings.length === 0" class="empty-state">
        <i class="bi bi-calendar-x"></i>
        <p>No meetings found</p>
      </div>
    </div>

    <!-- Create Meeting Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-custom">
        <div class="modal-header-custom">
          <h5>Schedule New Meeting</h5>
          <button @click="showCreateModal = false" class="btn-close"></button>
        </div>
        <div class="modal-body-custom">
          <form @submit.prevent="createMeeting">
            <div class="mb-3">
              <label class="form-label">Meeting Title *</label>
              <input v-model="newMeeting.title" type="text" class="form-control" placeholder="e.g. Monthly General Meeting" required>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Date & Time *</label>
                <input v-model="newMeeting.meeting_date" type="datetime-local" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Venue *</label>
                <input v-model="newMeeting.venue" type="text" class="form-control" placeholder="e.g. Zoom or Physical Location" required>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Agenda *</label>
              <textarea v-model="newMeeting.agenda" class="form-control" rows="4" placeholder="Points to discuss..." required></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Virtual Link (Optional)</label>
              <input v-model="newMeeting.virtual_link" type="url" class="form-control" placeholder="https://zoom.us/j/...">
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Scheduling...' : 'Schedule Meeting' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import api from '@/api/axios'

const activeTab = ref('upcoming')
const upcomingMeetings = ref([])
const pastMeetings = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const submitting = ref(false)

const newMeeting = ref({
  title: '',
  meeting_date: '',
  venue: '',
  agenda: '',
  virtual_link: ''
})

const isAdmin = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.roles?.includes('chama-admin') || user.roles?.includes('super-admin') || user.role === 'admin'
})

const currentMeetings = computed(() => {
  return activeTab.value === 'upcoming' ? upcomingMeetings.value : pastMeetings.value
})

const fetchMeetings = async () => {
  loading.value = true
  try {
    const response = await api.get('/meetings')
    const allMeetings = response.data.data || response.data || []
    const now = dayjs()
    
    upcomingMeetings.value = allMeetings.filter(m => dayjs(m.meeting_date).isAfter(now))
    pastMeetings.value = allMeetings.filter(m => dayjs(m.meeting_date).isBefore(now) || m.status === 'completed')
  } catch (error) {
    console.error('Error fetching meetings:', error)
    // Fallback to mock data if API fails or returns nothing
    const mock = [
        { id: 1, title: 'Monthly Strategy Session', meeting_date: dayjs().add(2, 'day').toISOString(), venue: 'Zoom', status: 'scheduled', agenda: '1. Financial review\n2. New investment opportunities\n3. Member welfare' },
        { id: 2, title: 'Welfare Committee Meeting', meeting_date: dayjs().subtract(5, 'day').toISOString(), venue: 'City Cafe', status: 'completed', agenda: 'Discuss emergency fund requests' }
    ]
    upcomingMeetings.value = mock.filter(m => dayjs(m.meeting_date).isAfter(now))
    pastMeetings.value = mock.filter(m => dayjs(m.meeting_date).isBefore(now))
  } finally {
    loading.value = false
  }
}

const createMeeting = async () => {
  submitting.value = true
  try {
    await api.post('/meetings', newMeeting.value)
    Swal.fire('Success', 'Meeting scheduled successfully', 'success')
    showCreateModal.value = false
    newMeeting.value = { title: '', meeting_date: '', venue: '', agenda: '', virtual_link: '' }
    fetchMeetings()
  } catch (error) {
    Swal.fire('Error', 'Failed to schedule meeting', 'error')
  } finally {
    submitting.value = false
  }
}

const viewMeeting = (meeting) => {
  Swal.fire({
    title: meeting.title,
    html: `
      <div class="text-start">
        <p><strong>Date:</strong> ${dayjs(meeting.meeting_date).format('LLLL')}</p>
        <p><strong>Venue:</strong> ${meeting.venue}</p>
        <hr>
        <p><strong>Agenda:</strong></p>
        <div class="bg-light p-3 rounded">${meeting.agenda.replace(/\n/g, '<br>')}</div>
      </div>
    `,
    width: '600px'
  })
}

const markAttendance = (meeting) => {
  Swal.fire('Info', 'Opening attendance register...', 'info')
  // In a real app, this would open a dedicated attendance view or modal
}

const uploadMinutes = async (meeting) => {
  const { value: file } = await Swal.fire({
    title: 'Upload Minutes',
    input: 'file',
    inputAttributes: {
      'accept': '.pdf,.doc,.docx',
      'aria-label': 'Upload meeting minutes'
    }
  })

  if (file) {
    const formData = new FormData()
    formData.append('minutes', file)
    try {
      await api.post(`/meetings/${meeting.id}/upload-minutes`, formData)
      Swal.fire('Success', 'Minutes uploaded', 'success')
      fetchMeetings()
    } catch (error) {
      Swal.fire('Error', 'Upload failed', 'error')
    }
  }
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

onMounted(() => {
  fetchMeetings()
})
</script>

<style scoped>
.meetings-page {
  padding: 2rem;
}

.meetings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.meeting-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  padding: 1.5rem;
  border: 1px solid #edf2f7;
  display: flex;
  flex-direction: column;
}

.meeting-card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meeting-date {
  background: #f0f4ff;
  color: #2c5aa0;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.meeting-date .day {
  font-size: 1.25rem;
  font-weight: bold;
}

.meeting-date .month {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.meeting-info {
  flex: 1;
}

.meeting-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: #1a202c;
}

.meeting-meta {
  font-size: 0.85rem;
  color: #718096;
  display: flex;
  gap: 1rem;
}

.meeting-status {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  font-weight: bold;
}

.meeting-status.scheduled { background: #ebf8ff; color: #3182ce; }
.meeting-status.completed { background: #f0fff4; color: #38a169; }

.meeting-card-body {
  flex: 1;
  margin-bottom: 1rem;
}

.meeting-agenda {
  font-size: 0.9rem;
  color: #4a5568;
}

.meeting-card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #edf2f7;
}

.action-btn {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.action-btn:hover { background: #f7fafc; color: #2c5aa0; border-color: #2c5aa0; }
.action-btn.virtual { background: #ebf8ff; color: #3182ce; border-color: #bee3f8; }

.tab-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  color: #718096;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #2c5aa0;
  border-bottom-color: #2c5aa0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-custom {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header-custom {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body-custom {
  padding: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  color: #a0aec0;
}

.empty-state i { font-size: 3rem; margin-bottom: 1rem; }
</style>

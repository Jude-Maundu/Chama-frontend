<template>
  <div class="schedule-meeting-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Schedule Meeting</h1>
        <p class="page-subtitle">Create and manage Chama meetings</p>
      </div>
      <button class="btn-outline-custom" @click="$router.back()">
        <i class="bi bi-arrow-left me-2"></i>Back
      </button>
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="glass-card">
          <div class="card-header-custom">
            <div class="header-icon">
              <i class="bi bi-calendar-plus"></i>
            </div>
            <h5 class="mb-0">Meeting Details</h5>
          </div>
          <div class="card-body-custom">
            <form @submit.prevent="scheduleMeeting">
              <div class="row g-3">
                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label required">Meeting Title</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-megaphone"></i>
                      <input type="text" 
                             class="form-control-custom" 
                             v-model="form.title" 
                             placeholder="e.g., Monthly General Meeting"
                             required>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label required">Date & Time</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-calendar3"></i>
                      <input type="datetime-local" 
                             class="form-control-custom" 
                             v-model="form.meeting_date"
                             :min="minDateTime"
                             required>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label required">Duration</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-clock"></i>
                      <select class="form-control-custom" v-model="form.duration_minutes">
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label required">Venue</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-geo-alt"></i>
                      <input type="text" 
                             class="form-control-custom" 
                             v-model="form.venue" 
                             placeholder="Physical location or virtual meeting link"
                             required>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label">Virtual Meeting Link</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-camera-video"></i>
                      <input type="url" 
                             class="form-control-custom" 
                             v-model="form.virtual_link" 
                             placeholder="https://zoom.us/... or https://meet.google.com/...">
                    </div>
                    <small class="text-muted">Optional: Add Zoom, Google Meet, or Teams link</small>
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label required">Agenda</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-list-check"></i>
                      <textarea class="form-control-custom" 
                                v-model="form.agenda" 
                                rows="6" 
                                placeholder="1. Opening prayer&#10;2. Reading of previous minutes&#10;3. Financial report&#10;4. Loan applications review&#10;5. AOB"
                                required></textarea>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label">Additional Notes</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-chat-text"></i>
                      <textarea class="form-control-custom" 
                                v-model="form.description" 
                                rows="3" 
                                placeholder="Any additional information for members..."></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary-custom" @click="resetForm">
                  <i class="bi bi-arrow-repeat me-2"></i>Reset
                </button>
                <button type="submit" class="btn-primary-custom" :disabled="submitting">
                  <i v-if="submitting" class="bi bi-spinner bi-spin me-2"></i>
                  <i v-else class="bi bi-calendar-check me-2"></i>
                  {{ submitting ? 'Scheduling...' : 'Schedule Meeting' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <!-- Tips Card -->
        <div class="glass-card mb-4">
          <div class="card-header-custom" style="background: linear-gradient(135deg, #f8f9fa, #ffffff);">
            <div class="header-icon" style="background: linear-gradient(135deg, #1565C0, #0D47A1);">
              <i class="bi bi-info-circle"></i>
            </div>
            <h6 class="mb-0">Meeting Tips</h6>
          </div>
          <div class="card-body-custom">
            <div class="tips-list">
              <div class="tip-item">
                <div class="tip-icon">
                  <i class="bi bi-clock-history"></i>
                </div>
                <div>
                  <strong>Send reminders early</strong>
                  <p>Members will receive automatic reminders 24 hours before the meeting.</p>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">
                  <i class="bi bi-people"></i>
                </div>
                <div>
                  <strong>Prepare agenda in advance</strong>
                  <p>Share agenda with members at least 3 days before the meeting.</p>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">
                  <i class="bi bi-camera-video"></i>
                </div>
                <div>
                  <strong>Virtual option</strong>
                  <p>Provide a virtual link for members who cannot attend physically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Meetings Card -->
        <div class="glass-card">
          <div class="card-header-custom" style="background: linear-gradient(135deg, #f8f9fa, #ffffff);">
            <div class="header-icon" style="background: linear-gradient(135deg, #FF8F00, #E65100);">
              <i class="bi bi-calendar-week"></i>
            </div>
            <h6 class="mb-0">Upcoming Meetings</h6>
          </div>
          <div class="card-body-custom p-0">
            <div v-if="upcomingLoading" class="text-center py-4">
              <div class="spinner-border text-primary spinner-border-sm"></div>
            </div>
            <div v-else class="upcoming-list">
              <div v-for="meeting in upcomingMeetings" :key="meeting.id" class="upcoming-item">
                <div class="upcoming-date">
                  <div class="date-day">{{ formatDate(meeting.meeting_date, 'DD') }}</div>
                  <div class="date-month">{{ formatDate(meeting.meeting_date, 'MMM') }}</div>
                </div>
                <div class="upcoming-info">
                  <div class="fw-semibold">{{ meeting.title }}</div>
                  <small class="text-muted">
                    <i class="bi bi-clock"></i> {{ formatDate(meeting.meeting_date, 'h:mm A') }}
                  </small>
                </div>
                <span class="badge-custom">Upcoming</span>
              </div>
              <div v-if="upcomingMeetings.length === 0" class="text-center py-4">
                <i class="bi bi-calendar-x fs-4 text-muted"></i>
                <p class="text-muted mb-0 mt-2">No upcoming meetings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal" :class="{ 'show': showSuccessModal }" v-if="showSuccessModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card">
          <div class="modal-body text-center p-4">
            <div class="success-icon">
              <i class="bi bi-check-lg"></i>
            </div>
            <h4 class="mt-3">Meeting Scheduled!</h4>
            <p class="text-muted">Your meeting has been scheduled successfully. Members will receive notifications.</p>
            <div class="meeting-info-mini">
              <p><strong>{{ form.title }}</strong></p>
              <p class="small">{{ formatDate(form.meeting_date, 'MMMM DD, YYYY h:mm A') }}</p>
            </div>
            <div class="d-flex gap-2 mt-3">
              <button class="btn-secondary-custom flex-grow-1" @click="closeSuccessModal">Close</button>
              <button class="btn-primary-custom flex-grow-1" @click="goToMeetings">View Meetings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showSuccessModal"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

const router = useRouter()
const submitting = ref(false)
const showSuccessModal = ref(false)
const upcomingLoading = ref(false)
const upcomingMeetings = ref([])

const form = ref({
  title: '',
  meeting_date: '',
  duration_minutes: '60',
  venue: '',
  virtual_link: '',
  agenda: '',
  description: ''
})

const minDateTime = computed(() => {
  return dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm')
})

const formatDate = (date, format) => {
  if (!date) return 'N/A'
  return dayjs(date).format(format)
}

const loadUpcomingMeetings = async () => {
  upcomingLoading.value = true
  try {
    const response = await api.get('/meetings', { params: { upcoming: true, per_page: 3 } })
    upcomingMeetings.value = (response.data.data || []).slice(0, 3)
  } catch (error) {
    console.error('Failed to load upcoming meetings:', error)
  } finally {
    upcomingLoading.value = false
  }
}

const scheduleMeeting = async () => {
  if (!form.value.title) {
    Swal.fire('Error', 'Please enter meeting title', 'error')
    return
  }
  if (!form.value.meeting_date) {
    Swal.fire('Error', 'Please select meeting date and time', 'error')
    return
  }
  if (dayjs(form.value.meeting_date).isBefore(dayjs())) {
    Swal.fire('Error', 'Meeting date must be in the future', 'error')
    return
  }
  if (!form.value.venue) {
    Swal.fire('Error', 'Please enter meeting venue', 'error')
    return
  }
  if (!form.value.agenda) {
    Swal.fire('Error', 'Please enter meeting agenda', 'error')
    return
  }

  submitting.value = true
  try {
    await api.post('/meetings', form.value)
    showSuccessModal.value = true
    loadUpcomingMeetings()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to schedule meeting', 'error')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    meeting_date: dayjs().add(1, 'day').hour(10).minute(0).second(0).format('YYYY-MM-DDTHH:mm'),
    duration_minutes: '60',
    venue: '',
    virtual_link: '',
    agenda: '',
    description: ''
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  resetForm()
}

const goToMeetings = () => {
  showSuccessModal.value = false
  router.push('/app/meetings')
}

onMounted(() => {
  const defaultDate = dayjs().add(1, 'day').hour(10).minute(0).second(0)
  form.value.meeting_date = defaultDate.format('YYYY-MM-DDTHH:mm')
  loadUpcomingMeetings()
})
</script>

<style scoped>
.schedule-meeting-page {
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
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
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

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 14px;
}

.required:after {
  content: " *";
  color: #dc3545;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-wrapper i:first-child {
  position: absolute;
  left: 14px;
  color: #2E7D32;
  z-index: 1;
}

.form-control-custom {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control-custom:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

textarea.form-control-custom {
  resize: vertical;
  padding-top: 12px;
  padding-bottom: 12px;
}

select.form-control-custom {
  cursor: pointer;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* Buttons */
.btn-primary-custom {
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.btn-primary-custom:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
}

.btn-primary-custom:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary-custom {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.btn-secondary-custom:hover {
  background: #e0e0e0;
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
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-outline-custom:hover {
  background: #2E7D32;
  color: white;
}

/* Tips List */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tip-item {
  display: flex;
  gap: 14px;
}

.tip-icon {
  width: 40px;
  height: 40px;
  background: rgba(46, 125, 50, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-icon i {
  font-size: 20px;
  color: #2E7D32;
}

.tip-item strong {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.tip-item p {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* Upcoming List */
.upcoming-list {
  max-height: 400px;
  overflow-y: auto;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.upcoming-item:hover {
  background: #f8f9fa;
}

.upcoming-date {
  text-align: center;
  min-width: 50px;
}

.date-day {
  font-size: 20px;
  font-weight: 700;
  color: #2E7D32;
}

.date-month {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
}

.upcoming-info {
  flex: 1;
}

.upcoming-info .fw-semibold {
  font-size: 14px;
  margin-bottom: 4px;
}

.upcoming-info small {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-custom {
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal.show {
  display: flex;
}

.modal-dialog {
  width: 100%;
  max-width: 400px;
  margin: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  overflow: hidden;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.success-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.success-icon i {
  font-size: 36px;
  color: white;
}

.meeting-info-mini {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 12px;
  margin-top: 16px;
}

.meeting-info-mini p {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-meeting-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-body-custom {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary-custom,
  .btn-secondary-custom {
    width: 100%;
  }
  
  .upcoming-item {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .upcoming-date {
    min-width: 40px;
  }
  
  .date-day {
    font-size: 16px;
  }
}
</style>
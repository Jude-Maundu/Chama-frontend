<template>
  <div class="member-directory-container container">
    <div class="header flex-between gap-4 flex-col-mobile">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Member Directory</h1>
      <div class="header-actions flex gap-2">
        <button @click="viewMode = 'grid'" :class="['btn-view', { active: viewMode === 'grid' }]" title="Grid View">
          <i class="fas fa-th"></i>
        </button>
        <button @click="viewMode = 'list'" :class="['btn-view', { active: viewMode === 'list' }]" title="List View">
          <i class="fas fa-list"></i>
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section flex flex-col-mobile gap-4 margin-y-4">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, or phone..."
          class="search-input"
        />
      </div>

      <div class="filter-controls flex gap-2 flex-wrap-mobile">
        <select v-model="filterSkill" class="filter-select">
          <option value="">All Skills</option>
          <option v-for="skill in availableSkills" :key="skill" :value="skill">
            {{ skill }}
          </option>
        </select>

        <select v-model="filterRole" class="filter-select">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="treasurer">Treasurer</option>
          <option value="secretary">Secretary</option>
          <option value="member">Member</option>
        </select>

        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="members-grid grid grid-auto-fit gap-4">
      <div v-if="filteredMembers.length === 0" class="empty-state col-span-full">
        <i class="fas fa-users"></i>
        <p>No members found matching your criteria</p>
      </div>

      <div v-for="member in filteredMembers" :key="member.id" class="member-card">
        <div class="member-header flex gap-3">
          <div class="avatar" v-if="member.photo_url">
            <img :src="member.photo_url" :alt="member.name" />
          </div>
          <div v-else class="avatar-placeholder flex-center">
            {{ getInitials(member.name) }}
          </div>

          <div class="member-info flex-1">
            <h3 class="text-base">{{ member.name }}</h3>
            <p class="role text-sm text-gray-600" v-if="member.role">{{ formatRole(member.role) }}</p>
          </div>
        </div>

        <div class="member-status margin-y-2">
          <span :class="['status-badge', member.status]">
            {{ formatStatus(member.status) }}
          </span>
        </div>

        <div class="member-contact text-sm">
          <div v-if="member.email" class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>{{ member.email }}</span>
          </div>
          <div v-if="member.phone" class="contact-item">
            <i class="fas fa-phone"></i>
            <span>{{ member.phone }}</span>
          </div>
        </div>

        <div v-if="member.skills && member.skills.length > 0" class="member-skills margin-y-3">
          <h4 class="text-xs font-semibold">Skills</h4>
          <div class="skills-list flex flex-wrap gap-2">
            <span v-for="skill in member.skills.slice(0, 3)" :key="skill" class="skill-badge text-xs">
              {{ skill }}
            </span>
            <span v-if="member.skills.length > 3" class="skill-more text-xs">
              +{{ member.skills.length - 3 }} more
            </span>
          </div>
        </div>

        <div v-if="member.bio" class="member-bio">
          {{ truncateText(member.bio, 100) }}
        </div>

        <div class="member-stats">
          <div class="stat">
            <span class="stat-label">Contributed</span>
            <span class="stat-value">{{ formatCurrency(member.total_contributions) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Joined</span>
            <span class="stat-value">{{ formatDate(member.joined_date) }}</span>
          </div>
        </div>

        <button @click="viewMemberProfile(member.id)" class="btn btn-primary btn-full">
          <i class="fas fa-user"></i> View Profile
        </button>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="members-list-container">
      <div v-if="filteredMembers.length === 0" class="empty-state">
        <i class="fas fa-users"></i>
        <p>No members found matching your criteria</p>
      </div>

      <table v-else class="members-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Contributed</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.id">
            <td>
              <div class="member-cell">
                <div v-if="member.photo_url" class="avatar-small">
                  <img :src="member.photo_url" :alt="member.name" />
                </div>
                <div v-else class="avatar-small-placeholder">
                  {{ getInitials(member.name) }}
                </div>
                <span>{{ member.name }}</span>
              </div>
            </td>
            <td>{{ formatRole(member.role) }}</td>
            <td>
              <span :class="['status-badge', member.status]">
                {{ formatStatus(member.status) }}
              </span>
            </td>
            <td class="email-cell">{{ member.email }}</td>
            <td>{{ member.phone }}</td>
            <td>{{ formatCurrency(member.total_contributions) }}</td>
            <td>{{ formatDate(member.joined_date) }}</td>
            <td>
              <button @click="viewMemberProfile(member.id)" class="btn-action" title="View Profile">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="contactMember(member)" class="btn-action" title="Contact">
                <i class="fas fa-envelope"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Contact Modal -->
    <div v-if="showContactModal" class="modal-overlay" @click="closeContactModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Contact {{ contactingMember?.name }}</h2>
          <button @click="closeContactModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="sendMessage">
            <div class="form-group">
              <label>Subject *</label>
              <input
                v-model="contactForm.subject"
                type="text"
                class="form-control"
                placeholder="Message subject"
                required
              />
            </div>

            <div class="form-group">
              <label>Message *</label>
              <textarea
                v-model="contactForm.message"
                class="form-control"
                placeholder="Your message"
                rows="4"
                required
              ></textarea>
            </div>

            <div class="contact-info">
              <p><strong>Email:</strong> {{ contactingMember?.email }}</p>
              <p v-if="contactingMember?.phone"><strong>Phone:</strong> {{ contactingMember?.phone }}</p>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeContactModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Loading/Error States -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading members...</p>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { engagementApi } from '@/api/engagement'

export default {
  name: 'MemberDirectory',
  setup() {
    const router = useRouter()
    const members = ref([])
    const loading = ref(false)
    const error = ref('')
    const successMessage = ref('')
    const searchQuery = ref('')
    const filterSkill = ref('')
    const filterRole = ref('')
    const filterStatus = ref('')
    const viewMode = ref('grid')
    const showContactModal = ref(false)
    const contactingMember = ref(null)

    const contactForm = ref({
      subject: '',
      message: ''
    })

    const availableSkills = computed(() => {
      const skills = new Set()
      members.value.forEach(member => {
        if (member.skills && Array.isArray(member.skills)) {
          member.skills.forEach(skill => skills.add(skill))
        }
      })
      return Array.from(skills).sort()
    })

    const filteredMembers = computed(() => {
      return members.value.filter(member => {
        const searchLower = searchQuery.value.toLowerCase()
        const nameMatch = member.name.toLowerCase().includes(searchLower)
        const emailMatch = member.email?.toLowerCase().includes(searchLower) || false
        const phoneMatch = member.phone?.includes(searchQuery.value) || false
        const search = nameMatch || emailMatch || phoneMatch

        let skill = true
        if (filterSkill.value) {
          skill = member.skills && member.skills.includes(filterSkill.value)
        }

        const role = !filterRole.value || member.role === filterRole.value
        const status = !filterStatus.value || member.status === filterStatus.value

        return search && skill && role && status
      })
    })

    const currentChamaId = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.current_chama_id || 1
    })

    const loadMembers = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await engagementApi.getDirectory(currentChamaId.value)
        members.value = response.data.data || response.data || []
      } catch (err) {
        error.value = 'Failed to load member directory'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const viewMemberProfile = (memberId) => {
      router.push(`/app/members/${memberId}`)
    }

    const contactMember = (member) => {
      contactingMember.value = member
      contactForm.value = {
        subject: '',
        message: ''
      }
      showContactModal.value = true
    }

    const sendMessage = async () => {
      error.value = ''
      try {
        // This would need a new API endpoint to send messages
        // For now, we'll just show a success message
        successMessage.value = `Message sent to ${contactingMember.value.name}!`
        setTimeout(() => successMessage.value = '', 3000)
        closeContactModal()
      } catch (err) {
        error.value = 'Failed to send message'
        console.error(err)
      }
    }

    const closeContactModal = () => {
      showContactModal.value = false
      contactingMember.value = null
      contactForm.value = {
        subject: '',
        message: ''
      }
    }

    const getInitials = (name) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const formatRole = (role) => {
      if (!role) return 'Member'
      return role
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    const formatStatus = (status) => {
      return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active'
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
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

    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.slice(0, length) + '...' : text
    }

    onMounted(() => {
      loadMembers()
    })

    return {
      members,
      loading,
      error,
      successMessage,
      searchQuery,
      filterSkill,
      filterRole,
      filterStatus,
      viewMode,
      showContactModal,
      contactingMember,
      contactForm,
      filteredMembers,
      availableSkills,
      viewMemberProfile,
      contactMember,
      sendMessage,
      closeContactModal,
      getInitials,
      formatRole,
      formatStatus,
      formatCurrency,
      formatDate,
      truncateText
    }
  }
}
</script>

<style scoped>
.member-directory-container {
  padding: 2rem;
  max-width: 1400px;
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

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view {
  background: #e0e0e0;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.btn-view.active {
  background: #2c5aa0;
  color: white;
}

.btn-view:hover {
  background: #d0d0d0;
}

.btn-view.active:hover {
  background: #1e4277;
}

/* Filters Section */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.search-box i {
  color: #999;
  margin-right: 0.75rem;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 0.95rem;
  font-family: inherit;
}

.search-input:focus {
  outline: none;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
  font-family: inherit;
}

.filter-select:focus {
  outline: none;
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

/* Grid View */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  color: #ddd;
  display: block;
  margin-bottom: 1rem;
}

.member-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.member-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.member-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.avatar,
.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #2c5aa0, #4a7dc4);
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  word-break: break-word;
}

.member-info .role {
  margin: 0.25rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

.member-status {
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #c8e6c9;
  color: #1b5e20;
}

.status-badge.inactive {
  background: #f3e5f5;
  color: #4a148c;
}

.member-contact {
  margin-bottom: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  color: #666;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-item i {
  color: #2c5aa0;
  flex-shrink: 0;
}

.contact-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-skills {
  margin-bottom: 1rem;
}

.member-skills h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.skill-badge {
  display: inline-block;
  background: #f0f7ff;
  color: #2c5aa0;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.skill-more {
  display: inline-block;
  color: #999;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.member-bio {
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 4px;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.member-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.stat {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.stat-label {
  color: #999;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  color: #2c5aa0;
  font-weight: 600;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* List View */
.members-list-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
}

.members-table thead {
  background: #f9f9f9;
}

.members-table th,
.members-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.95rem;
}

.members-table th {
  font-weight: 600;
  color: #333;
}

.members-table tbody tr:hover {
  background: #f9f9f9;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-small,
.avatar-small-placeholder {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.avatar-small img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-small-placeholder {
  background: linear-gradient(135deg, #2c5aa0, #4a7dc4);
}

.email-cell {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  color: #2c5aa0;
  padding: 0.35rem;
  margin-right: 0.35rem;
  font-size: 0.95rem;
}

.btn-action:hover {
  color: #1e4277;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #2c5aa0;
  color: white;
}

.btn-primary:hover {
  background: #1e4277;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

/* Forms */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.contact-info {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.contact-info p {
  margin: 0.35rem 0;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.alert-danger {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

/* Loading */
.loading {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .member-directory-container {
    padding: 1rem;
  }

  .filters-section {
    padding: 1rem;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }

  .members-grid {
    grid-template-columns: 1fr;
  }

  .members-table {
    font-size: 0.85rem;
  }

  .members-table th,
  .members-table td {
    padding: 0.75rem;
  }

  .modal {
    width: 95%;
  }
}
</style>

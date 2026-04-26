<template>
  <div class="admin-content">
    <div class="admin-header">
      <h1 class="admin-header-title">Members Management</h1>
      <div class="admin-header-actions">
        <input 
          v-model="searchQuery"
          type="text" 
          class="form-control form-control-sm" 
          placeholder="Search members..."
          style="width: 250px;"
        >
        <button class="btn btn-primary btn-sm" @click="showAddMemberModal = true">
          <i class="bi bi-person-plus"></i> Add Member
        </button>
      </div>
    </div>

    <!-- Members Table -->
    <div class="admin-table-container mt-3">
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>ID Number</th>
              <th>Total Contributions</th>
              <th>Active Loans</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in filteredMembers" :key="member.id">
              <td>
                <div class="d-flex align-items-center">
                  <div class="avatar-sm me-2">{{ member.name.charAt(0) }}</div>
                  <span class="fw-semibold">{{ member.name }}</span>
                </div>
              </td>
              <td>{{ member.email }}</td>
              <td>{{ member.phone_number }}</td>
              <td>{{ member.id_number }}</td>
              <td>KES {{ formatCurrency(member.total_contributions) }}</td>
              <td>{{ member.total_loans }}</td>
              <td>
                <span class="status-indicator" :class="member.is_active ? 'online' : 'offline'">
                  {{ member.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <button class="admin-table-action-btn edit" @click="viewStatement(member)">
                    Statement
                  </button>
                  <button class="admin-table-action-btn delete" @click="removeMember(member)">
                    Remove
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredMembers.length === 0">
              <td colspan="8" class="text-center p-3 text-muted">No members found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invitation Code Section -->
    <div class="admin-table-container mt-4 p-4">
      <h5 class="mb-3">Chama Join Link & Code</h5>
      <div class="d-flex align-items-center gap-3 bg-light p-3 rounded">
        <div class="flex-grow-1">
          <label class="text-muted small mb-1">Invitation Code</label>
          <div class="h4 mb-0 fw-bold font-monospace">{{ inviteCode }}</div>
        </div>
        <div class="flex-grow-1">
          <label class="text-muted small mb-1">Shareable Link</label>
          <div class="text-truncate text-primary" style="max-width: 300px;">{{ joinLink }}</div>
        </div>
        <div>
          <button class="btn btn-outline-primary btn-sm me-2" @click="copyLink">
            <i class="bi bi-clipboard"></i> Copy Link
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="regenerateCode">
            <i class="bi bi-arrow-clockwise"></i> Regenerate
          </button>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddMemberModal" class="modal-overlay">
      <div class="modal-custom">
        <div class="modal-header-custom">
          <h5>Add New Member</h5>
          <button @click="showAddMemberModal = false" class="btn-close"></button>
        </div>
        <div class="modal-body-custom">
          <form @submit.prevent="addMember">
            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input v-model="newMember.name" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Email Address</label>
              <input v-model="newMember.email" type="email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Phone Number</label>
              <input v-model="newMember.phone" type="text" class="form-control" placeholder="e.g. 0712345678" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Initial Password (Optional)</label>
              <input v-model="newMember.password" type="password" class="form-control" placeholder="Default: password">
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-secondary" @click="showAddMemberModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Adding...' : 'Add Member' }}
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
import Swal from 'sweetalert2'
import api from '@/api/axios'

const members = ref([])
const searchQuery = ref('')
const inviteCode = ref('LOADING...')
const joinLink = ref('')
const showAddMemberModal = ref(false)
const loading = ref(false)

const newMember = ref({
  name: '',
  email: '',
  phone: '',
  password: ''
})

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString()
}

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const q = searchQuery.value.toLowerCase()
  return members.value.filter(m => 
    m.name.toLowerCase().includes(q) || 
    m.email.toLowerCase().includes(q) || 
    m.phone_number?.includes(q)
  )
})

const fetchMembers = async () => {
  try {
    const response = await api.get('/chama-admin/members')
    members.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching members:', error)
  }
}

const fetchInviteCode = async () => {
  try {
    const response = await api.get('/chama-admin/invite-code')
    inviteCode.value = response.data.data.join_code
    joinLink.value = `${window.location.origin}/join/${response.data.data.slug}?code=${inviteCode.value}`
  } catch (error) {
    console.error('Error fetching invite code:', error)
  }
}

const addMember = async () => {
  loading.value = true
  try {
    await api.post('/chama-admin/members', newMember.value)
    Swal.fire('Success', 'Member added successfully', 'success')
    showAddMemberModal.value = false
    newMember.value = { name: '', email: '', phone: '', password: '' }
    fetchMembers()
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to add member'
    Swal.fire('Error', msg, 'error')
  } finally {
    loading.value = false
  }
}

const removeMember = async (member) => {
  const result = await Swal.fire({
    title: 'Remove Member?',
    text: `Are you sure you want to remove ${member.name} from this Chama?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, remove'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/chama-admin/members/${member.id}`)
      Swal.fire('Removed', 'Member has been removed.', 'success')
      fetchMembers()
    } catch (error) {
      Swal.fire('Error', 'Failed to remove member', 'error')
    }
  }
}

const viewStatement = (member) => {
  // Redirect to member statement report or show modal
  Swal.fire('Info', `Generating statement for ${member.name}...`, 'info')
  window.open(`http://localhost:8000/api/members/${member.id}/statement?export=pdf&token=${localStorage.getItem('token')}`, '_blank')
}

const regenerateCode = async () => {
  try {
    const response = await api.post('/chama-admin/invite-code/regenerate')
    inviteCode.value = response.data.data.join_code
    Swal.fire('Success', 'Invite code regenerated', 'success')
  } catch (error) {
    Swal.fire('Error', 'Failed to regenerate code', 'error')
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(joinLink.value)
  Swal.fire('Copied', 'Join link copied to clipboard', 'success')
}

onMounted(() => {
  fetchMembers()
  fetchInviteCode()
})
</script>

<style scoped>
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
  max-width: 500px;
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

.avatar-sm {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>

<template>
  <div class="webhook-manager">
    <div class="header-section mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Webhook Manager</h1>
        <p class="text-gray-600">Connect your Chama to external systems with real-time events.</p>
      </div>
      <button @click="showAddModal = true" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
        Add Webhook
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider font-bold">
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">URL</th>
            <th class="px-6 py-4">Event Type</th>
            <th class="px-6 py-4">Created</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="webhook in webhooks" :key="webhook.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <span :class="['w-2 h-2 rounded-full inline-block mr-2', webhook.is_active ? 'bg-green-500' : 'bg-gray-300']"></span>
              <span class="text-sm font-medium">{{ webhook.is_active ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-bold text-gray-900 truncate max-w-xs">{{ webhook.url }}</div>
              <div class="text-[10px] text-gray-400 font-mono">Secret: {{ webhook.secret_redacted || '••••••••••••' }}</div>
            </td>
            <td class="px-6 py-4">
              <span class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{{ webhook.event_type }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ formatDate(webhook.created_at) }}
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="deleteWebhook(webhook.id)" class="text-red-400 hover:text-red-600 p-2 transition-colors">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="webhooks.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
              No webhooks configured. Integrate with external apps!
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Webhook Logs -->
    <div class="mt-8">
      <h2 class="text-lg font-bold mb-4">Recent Deliveries</h2>
      <div class="space-y-2">
        <div v-for="log in deliveryLogs" :key="log.id" class="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center text-sm">
          <div class="flex items-center gap-4">
            <span :class="['px-2 py-0.5 rounded font-bold', log.status === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
              {{ log.status }} {{ log.status === 200 ? 'OK' : 'Error' }}
            </span>
            <span class="font-medium text-gray-900">{{ log.event }}</span>
          </div>
          <span class="text-gray-400 text-xs">{{ formatTimeAgo(log.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Add Webhook Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Add New Webhook</h2>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="form-group">
            <label class="block text-sm font-bold text-gray-700 mb-1">Target URL *</label>
            <input v-model="form.url" type="url" class="w-full px-4 py-2 border rounded-xl" placeholder="https://api.myapp.com/webhook" required>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-bold text-gray-700 mb-1">Event Type *</label>
            <select v-model="form.event_type" class="w-full px-4 py-2 border rounded-xl" required>
              <option value="contribution.received">Contribution Received</option>
              <option value="loan.approved">Loan Approved</option>
              <option value="member.joined">Member Joined</option>
              <option value="meeting.scheduled">Meeting Scheduled</option>
              <option value="*">All Events (*)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="block text-sm font-bold text-gray-700 mb-1">Secret Token (Optional)</label>
            <input v-model="form.secret" type="password" class="w-full px-4 py-2 border rounded-xl" placeholder="Leave blank to auto-generate">
            <p class="text-[10px] text-gray-400 mt-1">Used to sign payloads for security verification.</p>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input type="checkbox" v-model="form.is_active" id="is_active">
            <label for="is_active" class="text-sm font-medium text-gray-700">Enable this webhook immediately</label>
          </div>

          <div class="flex justify-end gap-3 pt-6">
            <button type="button" @click="showAddModal = false" class="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Create Webhook' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { adminExtraApi } from '@/api/adminExtra';

const webhooks = ref([]);
const deliveryLogs = ref([
  { id: 1, status: 200, event: 'contribution.received', created_at: new Date(Date.now() - 120000) },
  { id: 2, status: 200, event: 'loan.approved', created_at: new Date(Date.now() - 600000) },
  { id: 3, status: 500, event: 'member.joined', created_at: new Date(Date.now() - 3600000) }
]);

const showAddModal = ref(false);
const submitting = ref(false);

const form = reactive({
  url: '',
  event_type: 'contribution.received',
  secret: '',
  is_active: true
});

const currentChamaId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.current_chama_id || 1;
});

const fetchData = async () => {
  try {
    const res = await adminExtraApi.getWebhooks(currentChamaId.value);
    webhooks.value = res.data.data || [];
  } catch (err) {
    console.error('Failed to fetch webhooks', err);
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    await adminExtraApi.storeWebhook(currentChamaId.value, form);
    showAddModal.value = false;
    // Reset form
    form.url = '';
    form.secret = '';
    fetchData();
  } catch (err) {
    alert('Failed to save webhook');
  } finally {
    submitting.value = false;
  }
};

const deleteWebhook = async (id) => {
  if (!confirm('Are you sure you want to delete this webhook?')) return;
  try {
    await adminExtraApi.deleteWebhook(currentChamaId.value, id);
    fetchData();
  } catch (err) {
    alert('Failed to delete');
  }
};

const formatDate = (date) => new Date(date).toLocaleDateString();

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(date);
};

onMounted(fetchData);
</script>

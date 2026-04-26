<template>
  <div class="compliance-center">
    <div class="header-section mb-6">
      <h1 class="text-2xl font-bold">Compliance & Security</h1>
      <p class="text-gray-600">Ensure your Chama meets all regulatory and internal requirements.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Checklist Section -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <i class="fas fa-clipboard-check text-indigo-600"></i>
          Compliance Checklist
        </h2>
        <div class="space-y-4">
          <div v-for="item in checklist" :key="item.id" class="flex items-start gap-4 p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
            <button 
              @click="toggleCompliance(item)"
              :class="['mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', item.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white']"
            >
              <i v-if="item.is_completed" class="fas fa-check text-[10px]"></i>
            </button>
            <div class="flex-grow">
              <h3 class="font-bold text-gray-900" :class="{'line-through text-gray-400': item.is_completed}">{{ item.task }}</h3>
              <p class="text-sm text-gray-500">{{ item.description }}</p>
              <div v-if="item.due_date" class="mt-2 text-[10px] font-bold uppercase tracking-wider" :class="isOverdue(item.due_date) ? 'text-red-500' : 'text-gray-400'">
                Due: {{ formatDate(item.due_date) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fraud Alerts -->
      <div class="space-y-8">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
            <i class="fas fa-shield-alt text-red-600"></i>
            Security & Fraud Alerts
          </h2>
          <div class="space-y-4">
            <div v-for="(alert, index) in fraudAlerts" :key="index" class="p-4 rounded-xl border-l-4" :class="alert.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'">
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-gray-900 capitalize">{{ alert.type.replace('_', ' ') }}</span>
                <span class="text-[10px] font-bold uppercase" :class="alert.severity === 'high' ? 'text-red-600' : 'text-orange-600'">{{ alert.severity }}</span>
              </div>
              <p class="text-sm text-gray-700 mb-2">{{ alert.description }}</p>
              <span class="text-[10px] text-gray-400">{{ formatDate(alert.detected_at) }}</span>
            </div>
          </div>
        </div>

        <!-- GDPR Export -->
        <div class="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
          <div class="relative z-10">
            <h3 class="font-bold text-lg mb-2">Data Privacy (GDPR)</h3>
            <p class="text-indigo-200 text-sm mb-4">Export all your personal data including contributions, loans, and transaction history.</p>
            <button @click="exportData" class="bg-white text-indigo-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Export Personal Data
            </button>
          </div>
          <i class="fas fa-database absolute -bottom-4 -right-4 text-8xl text-white opacity-10"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';

const api = useApi();
const checklist = ref([]);
const fraudAlerts = ref([]);

const currentChamaId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.current_chama_id || 1;
});

const fetchData = async () => {
  try {
    const chamaId = currentChamaId.value;
    const [cRes, fRes] = await Promise.all([
      api.get(`/chamas/${chamaId}/security/compliance`),
      api.get(`/chamas/${chamaId}/security/fraud-alerts`)
    ]);

    checklist.value = cRes.data.data;
    fraudAlerts.value = fRes.data.data;
  } catch (err) {
    console.error('Failed to fetch security data', err);
  }
};

const toggleCompliance = async (item) => {
  try {
    const chamaId = currentChamaId.value;
    const res = await api.post(`/chamas/${chamaId}/security/compliance/${item.id}`, { is_completed: !item.is_completed });
    item.is_completed = res.data.data.is_completed;
  } catch (err) {
    alert('Failed to update task');
  }
};

const exportData = async () => {
  window.location.href = `${api.defaults.baseURL}/gdpr/export`;
};

const isOverdue = (date) => new Date(date) < new Date();
const formatDate = (date) => new Date(date).toLocaleDateString();

onMounted(fetchData);
</script>

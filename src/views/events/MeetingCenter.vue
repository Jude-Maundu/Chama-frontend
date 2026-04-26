<template>
  <div class="meeting-center">
    <div class="header-section mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Meeting Center</h1>
        <p class="text-gray-600">Manage templates, track decisions, and participate in polls.</p>
      </div>
      <button @click="activeTab = 'templates'" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
        Meeting Templates
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Active Polls Section -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-4">Active Digital Polls</h2>
          <div v-if="polls.length > 0" class="space-y-6">
            <div v-for="poll in polls" :key="poll.id" class="p-5 border border-indigo-50 rounded-2xl bg-indigo-50/30">
              <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-gray-900">{{ poll.question }}</h3>
                <span class="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold uppercase">
                  {{ poll.is_weighted ? 'Weighted' : 'Standard' }}
                </span>
              </div>
              <div class="space-y-3">
                <div v-for="(option, index) in poll.options" :key="index" class="relative">
                  <button 
                    @click="vote(poll.id, index)"
                    :disabled="poll.user_voted"
                    class="w-full text-left p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 transition-all relative z-10 overflow-hidden"
                  >
                    <span class="relative z-20 flex justify-between">
                      <span>{{ option }}</span>
                      <span v-if="poll.user_voted" class="font-bold">{{ getVotePercentage(poll, index) }}%</span>
                    </span>
                    <div 
                      v-if="poll.user_voted"
                      class="absolute top-0 left-0 h-full bg-indigo-100 z-0 transition-all duration-1000"
                      :style="{ width: getVotePercentage(poll, index) + '%' }"
                    ></div>
                  </button>
                </div>
              </div>
              <p v-if="poll.user_voted" class="mt-4 text-xs text-green-600 font-medium flex items-center gap-1">
                <i class="fas fa-check-circle"></i> Your vote has been recorded
              </p>
            </div>
          </div>
          <div v-else class="py-12 text-center text-gray-500 italic">
            No active polls at the moment.
          </div>
        </div>

        <!-- Meeting Decisions -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-4">Pending Decisions & Actions</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-gray-400 text-sm border-b">
                  <th class="pb-3 font-medium">Decision/Action</th>
                  <th class="pb-3 font-medium">Responsible</th>
                  <th class="pb-3 font-medium">Due Date</th>
                  <th class="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="decision in decisions" :key="decision.id" class="text-sm">
                  <td class="py-4 font-medium text-gray-900">{{ decision.decision_text }}</td>
                  <td class="py-4 text-gray-600">{{ decision.responsible_person?.name || 'Unassigned' }}</td>
                  <td class="py-4 text-gray-600">{{ formatDate(decision.due_date) }}</td>
                  <td class="py-4">
                    <span :class="['px-2 py-1 rounded-full text-xs font-bold uppercase', getStatusClass(decision.status)]">
                      {{ decision.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sidebar: Templates -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 class="text-lg font-bold mb-4">Meeting Templates</h3>
        <div class="space-y-3">
          <div v-for="temp in templates" :key="temp.id" class="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
            <h4 class="font-bold text-gray-900 group-hover:text-indigo-600">{{ temp.name }}</h4>
            <p class="text-xs text-gray-500 mb-2">{{ temp.default_type }}</p>
            <div class="flex flex-wrap gap-1">
              <span v-for="item in temp.default_agenda.slice(0, 2)" :key="item" class="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                {{ item }}
              </span>
              <span v-if="temp.default_agenda.length > 2" class="text-[10px] text-gray-400">+{{ temp.default_agenda.length - 2 }} more</span>
            </div>
          </div>
          <button class="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all">
            + Create New Template
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';

const api = useApi();
const polls = ref([]);
const decisions = ref([]);
const templates = ref([]);
const activeTab = ref('polls');

const currentChamaId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.current_chama_id || 1;
});

const fetchData = async () => {
  try {
    const chamaId = currentChamaId.value;
    const meetingId = 1; // Example active meeting
    const [pRes, dRes, tRes] = await Promise.all([
      api.get(`/chamas/${chamaId}/meetings/${meetingId}/polls`),
      api.get(`/chamas/${chamaId}/meetings/${meetingId}/decisions`),
      api.get(`/chamas/${chamaId}/meeting-templates`)
    ]);

    polls.value = pRes.data.data;
    decisions.value = dRes.data.data;
    templates.value = tRes.data.data;
  } catch (err) {
    console.error('Failed to fetch meeting data', err);
  }
};

const vote = async (pollId, optionIndex) => {
  try {
    const chamaId = currentChamaId.value;
    await api.post(`/chamas/${chamaId}/polls/${pollId}/vote`, { option_index: optionIndex });
    fetchData(); // Refresh to show results
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to vote');
  }
};

const getVotePercentage = (poll, index) => {
  if (!poll.votes || poll.votes.length === 0) return 0;
  const count = poll.votes.filter(v => v.option_index === index).length;
  return Math.round((count / poll.votes.length) * 100);
};

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';

onMounted(fetchData);
</script>

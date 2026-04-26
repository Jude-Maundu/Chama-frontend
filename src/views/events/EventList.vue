<template>
  <div class="event-list">
    <div class="header-section mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Social Events</h1>
        <p class="text-gray-600">Parties, team building, and community gatherings.</p>
      </div>
      <button @click="showModal = true" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
        Plan New Event
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="event in events" :key="event.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
        <div class="h-40 bg-indigo-600 relative flex items-center justify-center overflow-hidden">
          <i class="fas fa-calendar-star text-white text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500"></i>
          <div class="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold">
            {{ event.event_type }}
          </div>
        </div>
        <div class="p-6">
          <h3 class="font-bold text-xl mb-1 text-gray-900">{{ event.name }}</h3>
          <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ event.description }}</p>
          
          <div class="space-y-2 mb-6">
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <i class="fas fa-clock w-4 text-indigo-500"></i>
              {{ formatDate(event.start_date) }}
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <i class="fas fa-map-marker-alt w-4 text-indigo-500"></i>
              {{ event.location }}
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <i class="fas fa-ticket-alt w-4 text-indigo-500"></i>
              KES {{ formatAmount(event.ticket_price || 0) }}
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex -space-x-2">
              <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                U{{i}}
              </div>
              <div class="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                +{{ event.attendees_count }}
              </div>
            </div>
            <button @click="rsvp(event)" class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">
              RSVP Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';

const api = useApi();
const events = ref([]);
const showModal = ref(false);

const currentChamaId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.current_chama_id || 1;
});

const fetchData = async () => {
  try {
    const chamaId = currentChamaId.value;
    const res = await api.get(`/chamas/${chamaId}/events`);
    events.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch events', err);
  }
};

const rsvp = async (event) => {
  try {
    const chamaId = currentChamaId.value;
    await api.post(`/chamas/${chamaId}/events/${event.id}/rsvp`, { status: 'going' });
    alert('RSVP successful!');
    fetchData();
  } catch (err) {
    alert('Failed to RSVP');
  }
};

const formatDate = (date) => new Date(date).toLocaleString();
const formatAmount = (val) => new Intl.NumberFormat().format(val);

onMounted(fetchData);
</script>

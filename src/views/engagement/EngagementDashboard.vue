<template>
  <div class="engagement-dashboard">
    <div class="header-section mb-6">
      <h1 class="text-2xl font-bold">Member Engagement & Rewards</h1>
      <p class="text-gray-600">Track your milestones, referrals, and compete with fellow members.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content: Challenges & Referrals -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Loyalty & Badges Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg">
            <h3 class="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">Loyalty Points</h3>
            <div class="text-4xl font-black mb-4">{{ loyaltyPoints }} <span class="text-lg font-normal opacity-75">pts</span></div>
            <div class="flex justify-between items-end">
              <span class="text-xs text-indigo-200">Level 4: Active Contributor</span>
              <button class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-1 rounded-lg text-sm font-medium transition-colors">
                Redeem
              </button>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">Earned Badges</h3>
            <div class="flex flex-wrap gap-3">
              <div v-for="badge in badges" :key="badge.id" class="group relative" :title="badge.name">
                <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 transition-transform group-hover:scale-110 cursor-help">
                  <i :class="['fas', badge.icon || 'fa-award']"></i>
                </div>
                <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-10">
                  {{ badge.name }}
                </div>
              </div>
              <div v-if="badges.length === 0" class="text-gray-300 text-xs italic py-2">
                No badges earned yet. Complete challenges!
              </div>
            </div>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">Chama Leaderboard</h2>
            <span class="text-xs text-gray-400 font-medium">RANKING BY POINTS</span>
          </div>
          <div class="space-y-4">
            <div v-for="(rank, index) in leaderboard" :key="rank.id" :class="['flex items-center p-3 rounded-xl transition-colors', index === 0 ? 'bg-yellow-50 border border-yellow-100' : 'hover:bg-gray-50']">
              <div class="w-8 font-black text-lg" :class="index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-300'">
                {{ index + 1 }}
              </div>
              <div class="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex-shrink-0 mr-3 flex items-center justify-center font-bold text-gray-500">
                {{ rank.user_name?.charAt(0) }}
              </div>
              <div class="flex-grow">
                <p class="font-bold text-gray-900">{{ rank.user_name }}</p>
                <p class="text-xs text-gray-500">{{ rank.level || 'Member' }}</p>
              </div>
              <div class="text-right">
                <p class="font-black text-indigo-600">{{ rank.points }}</p>
                <p class="text-[10px] text-gray-400 uppercase font-bold">Points</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Referrals Section -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-4">Referral Program</h2>
          <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
            <div class="flex-grow">
              <p class="text-indigo-900 font-medium mb-2">Invite your friends and earn 50 pts each!</p>
              <div class="flex items-center bg-white p-2 rounded-lg border border-indigo-200">
                <code class="flex-grow text-indigo-700 font-bold px-2">{{ referralData.referral_code || 'CHAMA-USER' }}</code>
                <button @click="copyCode" class="bg-indigo-600 text-white px-4 py-1 rounded-md text-sm hover:bg-indigo-700 transition-colors">Copy</button>
              </div>
            </div>
            <div class="text-center bg-white p-4 rounded-xl shadow-sm border border-indigo-100 min-w-[120px]">
              <div class="text-3xl font-black text-indigo-600">{{ referralData.conversions?.length || 0 }}</div>
              <div class="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">Conversions</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: Challenges & Milestones -->
      <div class="space-y-8">
        <!-- Challenges -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold mb-4">Active Challenges</h2>
          <div class="space-y-6">
            <div v-for="challenge in challenges" :key="challenge.id" class="group">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-sm group-hover:text-indigo-600 transition-colors">{{ challenge.name }}</h3>
                <span class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{{ challenge.points_reward }} PTS</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-full" :style="{ width: (challenge.user_progress || 0) + '%' }"></div>
              </div>
              <p class="text-[10px] text-gray-400 mt-1">{{ challenge.description }}</p>
            </div>
            <div v-if="challenges.length === 0" class="text-center py-4 text-gray-400 text-sm">
              No active challenges.
            </div>
          </div>
        </div>

        <!-- Recent Milestones -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold mb-4">Your Milestones</h3>
          <div class="space-y-6">
            <div v-for="ms in milestones" :key="ms.id" class="flex gap-4">
              <div class="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-trophy"></i>
              </div>
              <div>
                <h4 class="font-bold text-gray-900 leading-tight text-sm">{{ ms.milestone_name }}</h4>
                <p class="text-[10px] text-gray-400 uppercase font-bold">{{ formatDate(ms.milestone_date) }}</p>
              </div>
            </div>
            <div v-if="milestones.length === 0" class="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-50 rounded-xl">
              No milestones yet.<br>Start contributing!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { gamificationApi } from '@/api/gamification';
import api from '@/api/axios';

const referralData = ref({});
const loyaltyPoints = ref(0);
const milestones = ref([]);
const challenges = ref([]);
const leaderboard = ref([]);
const badges = ref([]);

const currentChamaId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.current_chama_id || 1;
});

const fetchData = async () => {
  try {
    const chamaId = currentChamaId.value;
    const [rRes, pRes, mRes, cRes, lRes, bRes] = await Promise.all([
      api.get(`/chamas/${chamaId}/referrals`),
      gamificationApi.getLoyaltyPoints(chamaId),
      api.get(`/chamas/${chamaId}/milestones`),
      api.get(`/chamas/${chamaId}/challenges`),
      gamificationApi.getLeaderboard(chamaId),
      gamificationApi.getBadges(chamaId)
    ]);

    referralData.value = rRes.data.data || {};
    loyaltyPoints.value = pRes.data.points || 0;
    milestones.value = mRes.data.data || [];
    challenges.value = cRes.data.data || [];
    leaderboard.value = (lRes.data.data || []).slice(0, 10);
    badges.value = bRes.data.data || [];
  } catch (err) {
    console.error('Failed to fetch engagement data', err);
  }
};

const copyCode = () => {
  const code = referralData.value.referral_code || 'CHAMA-USER';
  navigator.clipboard.writeText(code);
  alert('Referral code copied!');
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(fetchData);
</script>

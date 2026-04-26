import api from './axios'

export const gamificationApi = {
  getLeaderboard: (chamaId) => api.get(`/chamas/${chamaId}/gamification/leaderboard`),
  getLoyaltyPoints: (chamaId) => api.get(`/chamas/${chamaId}/gamification/loyalty-points`),
  getBadges: (chamaId) => api.get(`/chamas/${chamaId}/gamification/badges`),
  lotteryDraw: (chamaId) => api.post(`/chamas/${chamaId}/gamification/lottery-draw`)
}

import { defineStore } from "pinia";

interface MonthlyTransactionStats {
  year: number;
  monthly: number[];
  total: number;
}

export const useTransactionStatsStore = defineStore("TransactionStats", {
  state: () => ({
    monthlyStats: {
      year: new Date().getFullYear(),
      monthly: new Array(12).fill(0),
      total: 0,
    } as MonthlyTransactionStats,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchMonthlyStats() {
      this.loading = true;
      this.error = null;

      try {
        const response = await $fetch<any>("/api/stats/transaction", {
          method: "GET",
          credentials: "include",
        });

        if (response.statusCode === 200) {
          this.monthlyStats = response.data;
        } else {
          this.error = response.message || "Error fetching monthly transaction stats";
        }
      } catch (error: any) {
        console.error("Error in fetchMonthlyStats:", error);
        this.error = error.message || "Unknown error occurred";
      } finally {
        this.loading = false;
      }
    },
  },

  getters: {
    averagePerMonth: (state) => {
      const total = state.monthlyStats.total;
      return total > 0 ? Math.round(total / 12 * 100) / 100 : 0;
    },
    
    highestMonth: (state) => {
      const maxValue = Math.max(...state.monthlyStats.monthly);
      const monthIndex = state.monthlyStats.monthly.indexOf(maxValue);
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return {
        month: months[monthIndex],
        value: maxValue,
        index: monthIndex
      };
    },
  },
});
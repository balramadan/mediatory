import { defineStore } from "pinia";

interface EquipmentStats {
  _sum: {
    quantity: number;
  };
  active: number;
  overdue: number;
  maintenance: number;
}

export const useEquipmentStatsStore = defineStore("EquipmentStats", {
  state: () => ({
    stats: {
      _sum: {
        quantity: 0,
      },
      active: 0,
      overdue: 0,
      maintenance: 0,
    } as EquipmentStats,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchStats() {
      this.loading = true;
      this.error = null;

      try {
        const response = await $fetch<any>("/api/stats/equipment", {
          method: "GET",
          credentials: "include",
        });

        if (response.statusCode === 200) {
          this.stats = response.data;
        } else {
          this.error = response.message || "Error fetching equipment stats";
        }
      } catch (error: any) {
        console.error("Error in fetchStats:", error);
        this.error = error.message || "Unknown error occurred";
      } finally {
        this.loading = false;
      }
    },
  },

  getters: {
    availableEquipment: (state) => {
      return state.stats._sum.quantity - state.stats.active - state.stats.maintenance;
    },
  },
});

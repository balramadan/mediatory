import { defineStore } from "pinia";

export const useEquipmentStore = defineStore("equipment", {
  state: () => ({
    equipment: [
      {
        equipment_id: "",
        name: "",
        quantity: 0,
        available_quantity: 0,
        status: "",
        createdAt: "",
        category: {
          category_id: 0,
          category_name: "",
          description: null as string | null,
        },
        transactions: [] as any[],
        equipment_returns: [] as any[],
        maintenance: [] as any[],
      },
    ],
  }),
  actions: {
    async getEquipment() {
      const { data } = await $fetch("/api/equipment", {
        method: "get",
      });

      if (data && Array.isArray(data)) {
        // Clear the equipment array before filling it with new data
        this.equipment = [];

        // Iterate through the equipment data and add it to the state
        data.forEach((item) => {
          this.equipment.push({
            equipment_id: item.equipment_id.toString(),
            name: item.name,
            quantity: item.quantity,
            available_quantity: item.available_quantity,
            status: item.status,
            createdAt: item.createdAt,
            category: item.category,
            transactions: item.transactions,
            equipment_returns: item.equipment_returns,
            maintenance: item.maintenance,
          });
        });
      }
    },
  },
});

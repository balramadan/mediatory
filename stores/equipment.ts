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
        imgUrl: "",
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
      await $fetch("/api/equipment", {
        method: "GET",
        credentials: "include",
      })
        .then((res: any) => {
          if (res.data && Array.isArray(res.data)) {
            // Clear the equipment array before filling it with new data
            this.equipment = [];

            // Iterate through the equipment data and add it to the state
            res.data.forEach((item: any) => {
              this.equipment.push({
                equipment_id: item.equipment_id.toString(),
                name: item.name,
                quantity: item.quantity,
                available_quantity: item.available_quantity,
                status: item.status,
                imgUrl: item.imgUrl,
                createdAt: item.createdAt,
                category: item.category,
                transactions: item.transactions,
                equipment_returns: item.equipment_returns,
                maintenance: item.maintenance,
              });
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching equipment:", err);
          this.equipment = []; // Reset equipment to an empty array on error
        });
    },
  },
});

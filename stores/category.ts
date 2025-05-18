import { defineStore } from "pinia";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    category: [
      {
        id: "",
        name: "",
        description: "",
        equipment: [] as {
          id: string;
          name: string;
          quantity: number;
          available: number;
          status: string;
          createdAt: string;
        }[],
      },
    ],
  }),
  actions: {
    async getCategory() {
      const { data } = await $fetch("/api/category", {
        method: "get",
      });

      if (data) {
        // Bersihkan category array sebelum mengisi data baru
        this.category = [];

        // Iterasi melalui data kategori dan tambahkan ke dalam state
        data.forEach((category) => {
          this.category.push({
            id: category.category_id.toString(),
            name: category.category_name,
            description: category.description || "",
            equipment: category.equipment.map((item) => ({
              id: item.equipment_id.toString(),
              name: item.name,
              quantity: item.quantity,
              available: item.available_quantity,
              status: item.status,
              createdAt: item.createdAt,
            })),
          });
        });
      }
    },
  },
});

import { defineStore } from "pinia";
import type { Equipment } from "~/types/equipment";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cart: [] as Array<{
      equipment_id: string;
      name: string;
      quantity: number;
      available_quantity: number;
      status: string;
      imgUrl: string;
      createdAt: string;
      category: {
        category_id: number;
        category_name: string;
        description: string | null;
      };
      transactions: any[];
      equipment_returns: any[];
      maintenance: any[];
    }>,
  }),
  actions: {
    addToCart(item: Equipment) {
      const existingItem = this.cart.find(
        (cartItem) => cartItem.equipment_id === item.equipment_id
      );
      if (existingItem) {
        // Hitung total quantity setelah penambahan
        const newQuantity = existingItem.quantity + item.quantity;

        // Cek apakah melebihi jumlah tersedia
        if (newQuantity <= item.available_quantity) {
          existingItem.quantity = newQuantity;
        } else {
          // Jika melebihi, tetapkan ke jumlah maksimum tersedia
          existingItem.quantity = item.available_quantity;
          // Berikan feedback ke pengguna (bisa diganti dengan toast notification)
          console.warn(
            `Quantity adjusted to maximum available (${item.available_quantity})`
          );
        }
      } else {
        // Untuk item baru, pastikan quantity tidak melebihi available_quantity
        if (item.quantity <= item.available_quantity) {
          this.cart.push(item);
        } else {
          // Jika melebihi, tambahkan dengan jumlah maksimum
          const adjustedItem = { ...item, quantity: item.available_quantity };
          this.cart.push(adjustedItem);
          // Berikan feedback
          console.warn(
            `Quantity adjusted to maximum available (${item.available_quantity})`
          );
        }
      }
    },
    removeFromCart(itemId: string) {
      this.cart = this.cart.filter((item) => item.equipment_id !== itemId);
    },
    clearCart() {
      this.cart = [];
    },
    increaseQuantity(itemId: string) {
      const item = this.cart.find((item) => item.equipment_id === itemId);
      if (item) {
        if (item.available_quantity > item.quantity) {
          item.quantity += 1;
        } else {
          console.error("Cannot increment quantity beyond available stock");
        }
      }
    },
    decreaseQuantity(itemId: string) {
      const item = this.cart.find((item) => item.equipment_id === itemId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          this.removeFromCart(itemId);
        }
      }
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
});

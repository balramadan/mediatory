import { defineStore } from "pinia";
import type { adminData } from "~/types/auth";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    isLoggedIn: false,
    admin: {
      id: "",
      name: "",
      email: "",
      role: "",
    },
  }),
  actions: {
    login(adminData: adminData) {
      this.isLoggedIn = true;
      this.admin = {
        id: adminData.admin_id,
        name: adminData.full_name ?? "",
        email: adminData.email ?? "",
        role: adminData.role ?? "",
      };
    },
    logout() {
      this.isLoggedIn = false;
      this.admin = {
        id: "",
        name: "",
        email: "",
        role: "",
      };

      const cookies = useCookie("admin");
      cookies.value = null;
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.cookies({
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    }),
  },
});

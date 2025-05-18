import { defineStore } from "pinia";
import type { userData } from "~/types/auth";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    user: {
      id: "",
      name: "",
      email: "",
      phone: "",
      status: "",
      createdAt: "",
    },
  }),
  actions: {
    login(userData: userData) {
      this.isLoggedIn = true;
      this.user = {
        id: userData.user_id,
        name: userData.full_name ?? "",
        email: userData.email ?? "",
        phone: userData.phone ?? "",
        status: userData.status ?? "",
        createdAt: userData.createdAt ?? "",
      };
    },
    logout() {
      this.isLoggedIn = false;
      this.user = {
        id: "",
        name: "",
        email: "",
        phone: "",
        status: "",
        createdAt: "",
      };

      const cookies = useCookie("user");
      cookies.value = null;
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.cookies({
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
      expires: new Date(
        new Date().getTime() + 60 * 60 * 24 * 1000
      ) /* 1 hari */,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    }),
  },
});

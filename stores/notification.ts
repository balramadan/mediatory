import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [] as Array<{
      notification_id: string;
      title: string;
      message: string;
      is_read: boolean;
      type: string;
      createdAt: string;
      transaction_id: number;
      transaction: Array<any>;
    }>,
  }),
  actions: {
    async getNotification() {
      await $fetch("/api/notification", {
        method: "GET",
        credentials: "include",
      })
        .then((res: any) => {
          if (res.statusCode === 200) {
            this.notifications = res.data;
          }
        })
        .catch((err) => {
          console.error(err);
          this.notifications = [];
        });
    },
    async markAsRead(notificationId: string) {
      await $fetch(`/api/notification/${notificationId}?markAsRead=true`, {
        method: "PUT",
        credentials: "include",
      })
        .then(() => {
          const index = this.notifications.findIndex(
            (n) => n.notification_id === notificationId
          );
          if (index !== -1) {
            this.notifications[index].is_read = true;
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    async deleteNotif(notificationId: string) {
      await $fetch(`/api/notification/delete?id=${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then(async (res: any) => {
          await this.getNotification();
          return res;
        })
        .catch((err) => {
          return err;
        });
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
});

import { defineStore } from "pinia";

export const useTransactionStore = defineStore("transaction", {
  state: () => ({
    transaction: [] as Array<{
      transaction_id: number;
      project: string;
      purpose: string;
      urgent: boolean;
      status: string;
      borrow_date: Date;
      return_date: Date;
      user_id: string;
      return_status: string;
      return_notes: string;
      admin_id: string;
      verified_at: Date;
      admin: Array<any>;
      return_admin_id: string;
      return_verified_at: Date;
      return_admin: Array<any>;
      equipments: Array<any>;
      equipment_returns: Array<any>;
      notifications: Array<any>;
      user: Array<any>;
      createdAt: Date;
    }>,
  }),

  getters: {
    // Getter untuk mendapatkan transaksi yang sudah diurutkan
    sortedTransactions: (state) => {
      return [...state.transaction].sort((a, b) => {
        // Jika salah satu urgent dan yang lain tidak, prioritaskan yang urgent
        if (a.urgent !== b.urgent) {
          return a.urgent ? -1 : 1;
        }
        // Jika keduanya sama (urgent atau tidak urgent), urutkan berdasarkan createdAt (FIFO)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }
  },
  
  actions: {
    async getAllTransaction() {
      await $fetch("/api/transaction", {
        method: "GET",
        credentials: "include",
      })
        .then((res: any) => {
          if (res.statusCode === 200) {
            this.transaction = res.data;
          }
        })
        .catch((err) => {
          console.error(err);
          this.transaction = [];
        });
    },
    getTransaction(id: number) {
      return this.transaction.find(
        (transaction) => transaction.transaction_id === id
      );
    },
    getTransactionUncompleted(id: number) {
      return this.transaction
        .filter(
          (tr) =>
            tr.status !== "cancelled" &&
            tr.return_status === "returned_complete"
        )
        .find((tr) => tr.transaction_id === id);
    },
    async approveTransaction(id: number, adminId: string, notes: string) {
      await $fetch(`/api/transaction/${id}`, {
        method: "PUT",
        credentials: "include",
        body: {
          status: "approved",
          verified_notes: notes,
          adminId,
        },
      })
        .then((res: any) => {
          if (res.statusCode === 200) {
            return "success";
          }
        })
        .catch((err) => {
          return `${err}`;
        });
    },
    async rejectTransaction(id: number, adminId: string, notes: string) {
      await $fetch(`/api/transaction/${id}`, {
        method: "PUT",
        credentials: "include",
        body: {
          status: "rejected",
          verifed_notes: notes,
          adminId,
        },
      })
        .then((res: any) => {
          if (res.statusCode === 200) {
            return "success";
          }
        })
        .catch((err) => {
          return `${err}`;
        });
    },
    async cancelledTransaction(id: number) {
      await $fetch(`/api/transaction/${id}`, {
        method: "PUT",
        credentials: "include",
        body: {
          transaction_id: id,
          status: "cancelled",
        },
      })
        .then((res: any) => {
          if (res.statusCode === 200) {
            return "success";
          }
        })
        .catch((err) => {
          return `${err}`;
        });
    },
    async returnTransaction(id: number) {
      await $fetch(`/api/transaction/returned`, {
        method: "PUT",
        credentials: "include",
        body: {
          transaction_id: id,
          return_status: "pending_check",
        },
      })
        .then((res: any) => {
          if (res.statusCode === 200) {
            return "success";
          }
        })
        .catch((err) => {
          return `${err}`;
        });
    },
  },
});

import { defineStore } from "pinia";

export const useTransactionStore = defineStore("transaction", {
  state: () => ({
    transaction: [] as Array<{
      transaction_id: number;
      project: string;
      purpose: string;
      status: string;
      borrow_date: Date;
      return_date: Date;
      user_id: string;
      return_status: string;
      return_notes: string;
      verified_by: string;
      verified_at: Date;
      admin: Array<any>;
      return_verified_by: string;
      return_verified_at: Date;
      return_admin: Array<any>;
      equipments: Array<any>;
      equipment_returns: Array<any>;
      notifications: Array<any>;
      user: Array<any>;
      createdAt: Date;
    }>,
  }),
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
          transaction_id: id,
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
          transaction_id: id,
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

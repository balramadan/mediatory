import { defineStore } from "pinia";

interface Transaction {
  transaction_id: number;
  project: string;
  purpose: string;
  status: string;
  return_status: string;
  borrow_date: string;
  return_date: string;
  createdAt: string;
  return_notes?: string;
  verified_notes?: string;
  equipments: any[];
  equipment_returns: any[];
  admin?: any;
  return_admin?: any;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

interface HistoryResponse {
  transactions: Transaction[];
  pagination: PaginationData;
}

export const useHistoryStore = defineStore("history", {
  state: () => ({
    transactions: [] as Transaction[],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      limit: 10,
    } as PaginationData,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchHistory(
      params: {
        status?: string;
        return_status?: string;
        search?: string;
        page?: number;
        limit?: number;
      } = {}
    ) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.append("status", params.status);
        if (params.return_status)
          queryParams.append("return_status", params.return_status);
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const response = await $fetch<any>(
          `/api/user/history?${queryParams.toString()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.statusCode === 200) {
          this.transactions = response.data.transactions.sort(
            (a: Transaction, b: Transaction) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          this.pagination = response.data.pagination;
        } else {
          this.error = response.message || "Error fetching history";
        }
      } catch (error: any) {
        console.error("Error in fetchHistory:", error);
        this.error = error.message || "Unknown error occurred";
        this.transactions = [];
      } finally {
        this.loading = false;
      }
    },

    clearHistory() {
      this.transactions = [];
      this.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 10,
      };
      this.error = null;
    },
  },
});

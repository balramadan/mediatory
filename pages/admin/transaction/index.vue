<template>
  <div>
    <Toolbar class="mb-5 items-center">
      <template #start>
        <!-- Filter Bulan dan Tahun -->
        <div class="flex gap-4 items-center">
          <label class="font-medium">Filter Periode:</label>

          <!-- Filter Tahun -->
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Tahun</label>
            <Select
              v-model="selectedYear"
              :options="yearOptions"
              option-label="label"
              option-value="value"
              placeholder="Pilih Tahun"
              show-clear
              @change="onFilterChange"
              class="w-32"
            />
          </div>

          <!-- Filter Bulan -->
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Bulan</label>
            <Select
              v-model="selectedMonth"
              :options="monthOptions"
              option-label="label"
              option-value="value"
              placeholder="Pilih Bulan"
              show-clear
              @change="onFilterChange"
              class="w-40"
            />
          </div>

          <!-- Reset Filter Button -->
          <Button
            v-if="selectedYear || selectedMonth"
            icon="i-material-symbols:filter-alt-off"
            severity="secondary"
            text
            @click="resetPeriodFilter"
            v-tooltip="'Reset Filter Periode'"
            class="mt-4"
          />
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            label="Hapus Terpilih"
            icon="i-material-symbols:delete"
            severity="danger"
            variant="outlined"
            @click="confirmDeleteSelected"
            :disabled="!selectedTransactions || !selectedTransactions.length"
          />
          <Button
            icon="i-solar:refresh-bold"
            @click="refreshTransaction"
            variant="outlined"
            severity="secondary"
          />
          <Button
            icon="i-material-symbols:upload"
            label="Export"
            @click="exportCSV"
            severity="secondary"
          />
        </div>
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      v-model:filters="filters"
      v-model:selection="selectedTransactions"
      show-gridlines
      striped-rows
      paginator
      scrollable
      :value="filteredTransactions"
      :loading="loading"
      :rows="6"
      :globalFilterFields="[
        'user.full_name',
        'equipments.equipment.name',
        'status',
      ]"
      tableStyle="min-width: 50rem"
      filterDisplay="row"
      data-key="transaction_id"
    >
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-5">
          <h2 class="font-bold font-poppins">Transaksi</h2>
          <IconField>
            <InputIcon>
              <div class="i-material-symbols:search" />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Search..."
            />
          </IconField>
        </div>
      </template>

      <template #empty>
        <p class="text-center">Belum ada transaksi</p>
      </template>

      <template #loading>
        <LoadingVideo src="/loading.webm" :width="256" :height="256" />
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

      <Column field="urgent" class="min-w-9rem">
        <template #body="slotProps">
          <Badge
            v-if="slotProps.data.urgent"
            value="Mendesak"
            severity="danger"
          />
          <Badge v-else value="Tidak Mendesak" severity="secondary" />
        </template>
      </Column>

      <Column field="transaction_id" header="ID">
        <template #body="slotProps">
          <p>#{{ slotProps.data.transaction_id }}</p>
        </template>
      </Column>

      <Column field="user.full_name" header="Nama" />

      <Column field="project" header="Proyek" />

      <Column field="purpose" header="Tujuan" class="min-w-20rem" />

      <Column field="equipments" header="Peralatan" class="min-w-20rem">
        <template #body="slotProps">
          <ul class="flex flex-row flex-wrap gap-1">
            <Tag
              v-for="item in slotProps.data.equipments"
              severity="primary"
              :key="item.id"
              :value="item.equipment.name"
            />
          </ul>
        </template>
      </Column>

      <Column field="status" header="Status" :showFilterMenu="false">
        <template #body="slotProps">
          <span
            v-if="slotProps.data.status === 'pending'"
            class="text-yellow-500 font-semibold"
            >Menunggu Konfirmasi</span
          >
          <span
            v-if="slotProps.data.status === 'rejected'"
            class="text-red-500 font-semibold"
            >Ditolak</span
          >
          <span
            v-if="slotProps.data.status === 'cancelled'"
            class="text-red-200 font-semibold"
            >Dibatalkan</span
          >
          <span
            v-if="slotProps.data.status === 'overdue'"
            class="text-red-800 font-semibold"
            >Terlambat</span
          >
          <span
            v-if="slotProps.data.status === 'approved'"
            class="text-green-600 font-semibold"
            >Disetujui</span
          >
          <span
            v-if="slotProps.data.status === 'completed'"
            class="text-green-800 font-semibold"
            >Selesai</span
          >
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="statusOptions"
            placeholder="Pilih Status"
            :showClear="true"
          ></Select>
        </template>
      </Column>

      <Column
        field="return_status"
        header="Status Pengembalian"
        :showFilterMenu="false"
      >
        <template #body="slotProps">
          <span
            v-if="slotProps.data.return_status === 'not_returned'"
            class="text-yellow-500 font-semibold"
            >Belum dikembalikan</span
          >
          <span
            v-if="slotProps.data.return_status === 'pending_check'"
            class="text-orange-500 font-semibold"
            >Sedang di cek</span
          >
          <span
            v-if="slotProps.data.return_status === 'returned_damaged'"
            class="text-red-500 font-semibold"
            >Ada kerusakan</span
          >
          <span
            v-if="slotProps.data.return_status === 'returned_incomplete'"
            class="text-red-500 font-semibold"
            >Tidak lengkap / Hilang</span
          >
          <span
            v-if="slotProps.data.return_status === 'returned_complete'"
            class="text-green-500 font-semibold"
            >Pengembalian selesai</span
          >
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="returnStatusOptions"
            placeholder="Pilih Status"
            :showClear="true"
          ></Select>
        </template>
      </Column>

      <Column field="borrow_date" header="Tanggal Pinjam" class="min-w-10rem">
        <template #body="slotProps">
          <div>
            {{
              new Date(slotProps.data.borrow_date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }}
          </div>
        </template>
      </Column>

      <Column field="return_date" header="Tanggal Kembali" class="min-w-10rem">
        <template #body="slotProps">
          <div>
            {{
              new Date(slotProps.data.return_date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }}
          </div>
        </template>
      </Column>

      <Column :exportable="false">
        <template #body="slotProps" class="flex flex-row">
          <Button
            icon="i-material-symbols:folder-open"
            outlined
            rounded
            class="mb-2"
            @click.prevent="
              $router.push(
                `/admin/transaction/${slotProps.data.transaction_id}`
              )
            "
          />
          <Button
            icon="i-material-symbols:delete-forever"
            outlined
            rounded
            severity="danger"
            @click="confirmDeleteTransaction(slotProps.data)"
            :disabled="!canDeleteTransaction(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Delete Single Transaction Dialog -->
    <Dialog
      v-model:visible="deleteTransactionDialog"
      modal
      header="Konfirmasi Hapus Transaksi"
      :style="{ width: '30rem' }"
    >
      <div class="confirmation-content">
        <i class="i-material-symbols:warning mr-3" style="font-size: 2rem; color: #f59e0b" />
        <div>
          <p class="mb-2">Anda yakin ingin menghapus transaksi ini?</p>
          <p class="text-sm text-gray-600 mb-2">
            <strong>ID:</strong> #{{ selectedTransaction?.transaction_id }}
          </p>
          <p class="text-sm text-gray-600 mb-2">
            <strong>User:</strong> {{ selectedTransaction?.user?.full_name }}
          </p>
          <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
            <p class="text-sm text-yellow-800">
              <strong>Peringatan:</strong> Menghapus transaksi akan menghapus semua data terkait termasuk detail transaksi, detail pengembalian, dan notifikasi.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="Batal"
          icon="i-material-symbols:close"
          text
          @click="deleteTransactionDialog = false"
        />
        <Button 
          label="Hapus" 
          icon="i-material-symbols:check" 
          severity="danger"
          @click="deleteTransaction" 
        />
      </template>
    </Dialog>

    <!-- Delete Multiple Transactions Dialog -->
    <Dialog
      v-model:visible="deleteTransactionsDialog"
      modal
      header="Konfirmasi Hapus Transaksi"
      :style="{ width: '35rem' }"
    >
      <div class="confirmation-content">
        <i class="i-material-symbols:warning mr-3" style="font-size: 2rem; color: #f59e0b" />
        <div>
          <p class="mb-2">Anda yakin ingin menghapus {{ selectedTransactions.length }} transaksi?</p>
          <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
            <p class="text-sm text-yellow-800">
              <strong>Peringatan:</strong> Menghapus transaksi akan menghapus semua data terkait dan tidak dapat dikembalikan.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="Batal"
          icon="i-material-symbols:close"
          text
          @click="deleteTransactionsDialog = false"
        />
        <Button 
          label="Hapus Semua" 
          icon="i-material-symbols:check" 
          severity="danger"
          @click="deleteSelectedTransactions" 
        />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";

const toast = useToast();
const trStore = useTransactionStore();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  return_status: { value: null, matchMode: FilterMatchMode.EQUALS },
  borrow_date: { value: null, matchMode: FilterMatchMode.DATE_IS },
});

const dt = ref();
const transactions = ref();
const loading = ref(false);

// Separate filters for month and year
const selectedYear = ref<number | null>(null);
const selectedMonth = ref<number | null>(null);

const refreshTransaction = async () => {
  loading.value = true;

  await trStore
    .getAllTransaction()
    .then(() => {
      transactions.value = trStore.transaction;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      loading.value = false;
    });
};

// Options untuk dropdown tahun
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];

  // Generate years from 2 years ago to 1 year in the future
  for (let year = currentYear - 2; year <= currentYear + 1; year++) {
    years.push({
      label: year.toString(),
      value: year,
    });
  }

  // Sort from newest to oldest
  return years.sort((a, b) => b.value - a.value);
});

// Options untuk dropdown bulan
const monthOptions = computed(() => {
  return [
    { label: "Januari", value: 0 },
    { label: "Februari", value: 1 },
    { label: "Maret", value: 2 },
    { label: "April", value: 3 },
    { label: "Mei", value: 4 },
    { label: "Juni", value: 5 },
    { label: "Juli", value: 6 },
    { label: "Agustus", value: 7 },
    { label: "September", value: 8 },
    { label: "Oktober", value: 9 },
    { label: "November", value: 10 },
    { label: "Desember", value: 11 },
  ];
});

// Computed property untuk mengurutkan transaksi
const sortedTransactions = computed(() => {
  if (!transactions.value) return [];

  return [...transactions.value].sort((a, b) => {
    // Prioritaskan urgent
    if (a.urgent !== b.urgent) {
      return a.urgent ? -1 : 1;
    }
    // Kemudian urutkan berdasarkan waktu pembuatan (FIFO)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
});

// Filter berdasarkan tahun dan bulan yang dipilih
const filteredTransactions = computed(() => {
  let result = sortedTransactions.value;

  // Filter berdasarkan tahun dan/atau bulan yang dipilih
  if (selectedYear.value !== null || selectedMonth.value !== null) {
    result = result.filter((transaction) => {
      const borrowDate = new Date(transaction.borrow_date);

      // Filter berdasarkan tahun jika dipilih
      if (selectedYear.value !== null) {
        if (borrowDate.getFullYear() !== selectedYear.value) {
          return false;
        }
      }

      // Filter berdasarkan bulan jika dipilih
      if (selectedMonth.value !== null) {
        if (borrowDate.getMonth() !== selectedMonth.value) {
          return false;
        }
      }

      return true;
    });
  }

  return result;
});

// Handle perubahan filter
const onFilterChange = () => {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  if (selectedYear.value || selectedMonth.value) {
    let filterInfo = "Filter periode: ";
    if (selectedMonth.value !== null) {
      filterInfo += monthNames[selectedMonth.value];
    }
    if (selectedYear.value !== null) {
      if (selectedMonth.value !== null) {
        filterInfo += ` ${selectedYear.value}`;
      } else {
        filterInfo += `Tahun ${selectedYear.value}`;
      }
    }
    console.log(filterInfo);
  } else {
    console.log("Filter periode dihapus - menampilkan semua data");
  }
};

// Reset filter periode
const resetPeriodFilter = () => {
  selectedYear.value = null;
  selectedMonth.value = null;
  console.log("Filter periode direset");
};

// Reset semua filter
const resetFilters = () => {
  resetPeriodFilter();
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    return_status: { value: null, matchMode: FilterMatchMode.EQUALS },
    borrow_date: { value: null, matchMode: FilterMatchMode.DATE_IS },
  };

  // Reset filter DataTable juga
  if (dt.value) {
    dt.value.clearFilters();
  }
};

const selectedTransactions = ref<any[]>([]);
const deleteTransactionDialog = ref(false);
const deleteTransactionsDialog = ref(false);
const selectedTransaction = ref<any>(null);

const canDeleteTransaction = (transaction: any) => {
  // Only allow deletion for cancelled, rejected, or completed transactions
  const deletableStatuses = ['cancelled', 'rejected', 'completed'];
  return deletableStatuses.includes(transaction.status);
};

// Confirm delete single transaction
const confirmDeleteTransaction = (transaction: any) => {
  if (!canDeleteTransaction(transaction)) {
    toast.add({
      severity: "warn",
      summary: "Tidak Diizinkan",
      detail: "Hanya transaksi yang dibatalkan, ditolak, atau selesai yang dapat dihapus",
      life: 3000,
    });
    return;
  }
  
  selectedTransaction.value = transaction;
  deleteTransactionDialog.value = true;
};

// Confirm delete multiple transactions
const confirmDeleteSelected = () => {
  if (!selectedTransactions.value || selectedTransactions.value.length === 0) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Tidak ada transaksi yang dipilih",
      life: 3000,
    });
    return;
  }

  // Check if all selected transactions can be deleted
  const undeletableTransactions = selectedTransactions.value.filter(
    (transaction) => !canDeleteTransaction(transaction)
  );

  if (undeletableTransactions.length > 0) {
    toast.add({
      severity: "warn",
      summary: "Tidak Diizinkan",
      detail: `${undeletableTransactions.length} transaksi tidak dapat dihapus karena statusnya masih aktif`,
      life: 3000,
    });
    return;
  }

  deleteTransactionsDialog.value = true;
};

// Delete single transaction
const deleteTransaction = async () => {
  try {
    const res = await $fetch<{
      statusCode: number;
      message: string;
      deletedTransaction?: { id: number; user: string };
    }>("/api/transaction/delete?multiple=false", {
      method: "DELETE",
      body: { id: selectedTransaction.value.transaction_id },
      credentials: "include",
    });

    if (res.statusCode === 200) {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: `Transaksi #${selectedTransaction.value.transaction_id} berhasil dihapus`,
        life: 3000,
      });
      await refreshTransaction();
    }
  } catch (err: any) {
    console.error("Delete transaction error:", err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: err.data?.message || err.message || "Gagal menghapus transaksi",
      life: 3000,
    });
  } finally {
    deleteTransactionDialog.value = false;
    selectedTransaction.value = null;
  }
};

// Delete multiple transactions
const deleteSelectedTransactions = async () => {
  try {
    const selected = selectedTransactions.value.map(
      (transaction) => transaction.transaction_id
    );

    const res = await $fetch<{
      statusCode: number;
      message: string;
      deletedCount?: number;
    }>("/api/transaction/delete?multiple=true", {
      method: "DELETE",
      body: { ids: selected },
      credentials: "include",
    });

    if (res.statusCode === 200) {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: `${res.deletedCount || selected.length} transaksi berhasil dihapus`,
        life: 3000,
      });
      await refreshTransaction();
      selectedTransactions.value = [];
    }
  } catch (err: any) {
    console.error("Delete transactions error:", err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: err.data?.message || err.message || "Gagal menghapus transaksi",
      life: 3000,
    });
  } finally {
    deleteTransactionsDialog.value = false;
  }
};

// Update fungsi exportCSV
const exportCSV = () => {
  let fileName = "transactions";

  const monthNames = [
    "januari",
    "februari",
    "maret",
    "april",
    "mei",
    "juni",
    "juli",
    "agustus",
    "september",
    "oktober",
    "november",
    "desember",
  ];

  // Build filename based on selected filters
  if (selectedYear.value || selectedMonth.value) {
    const parts = [];
    if (selectedMonth.value !== null) {
      parts.push(monthNames[selectedMonth.value]);
    }
    if (selectedYear.value !== null) {
      parts.push(selectedYear.value.toString());
    }
    fileName += `-${parts.join("-")}`;
  } else {
    fileName += "-all";
  }

  dt.value.exportCSV({
    selectionOnly: false,
    fileName: `${fileName}-${new Date().toISOString().split("T")[0]}.csv`,
  });
};

onMounted(async () => {
  await refreshTransaction();
});

const statusOptions = ref([
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "overdue",
  "completed",
]);

const returnStatusOptions = ref([
  "not_returned",
  "pending_check",
  "returned_damaged",
  "returned_incomplete",
  "returned_complete",
]);

definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

useSeoMeta({
  title: "Daftar Transaksi | Mediawi",
  description: "Halaman daftar transaksi",
  ogTitle: "Daftar Transaksi | Mediawi",
});
</script>

<style></style>

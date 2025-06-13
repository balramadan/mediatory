<template>
  <div class="">
    <!-- Filter Section -->
    <Card class="mb-5 rounded shadow-xs">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
          <!-- Search -->
          <div class="flex flex-col">
            <label class="text-sm font-medium mb-2">Pencarian</label>
            <InputText
              v-model="searchQuery"
              placeholder="Cari proyek, tujuan, atau alat..."
              @input="onSearchChange"
            />
          </div>

          <!-- Status Filter -->
          <div class="flex flex-col">
            <label class="text-sm font-medium mb-2">Status Peminjaman</label>
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Semua Status"
              show-clear
              @change="applyFilters"
            />
          </div>

          <!-- Return Status Filter -->
          <div class="flex flex-col">
            <label class="text-sm font-medium mb-2">Status Pengembalian</label>
            <Select
              v-model="returnStatusFilter"
              :options="returnStatusOptions"
              option-label="label"
              option-value="value"
              placeholder="Semua Status"
              show-clear
              @change="applyFilters"
            />
          </div>

          <!-- Actions -->
          <div class="flex flex-col justify-end">
            <Button
              label="Reset Filter"
              icon="pi pi-refresh"
              severity="secondary"
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Data Table -->
    <DataTable
      :value="historyStore.transactions"
      :loading="historyStore.loading"
      class="rounded"
      lazy
      paginator
      :rows="historyStore.pagination.limit"
      :total-records="historyStore.pagination.totalRecords"
      :first="
        (historyStore.pagination.currentPage - 1) *
        historyStore.pagination.limit
      "
      @page="onPageChange"
      show-gridlines
      striped-rows
      responsive-layout="scroll"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Daftar Riwayat Peminjaman</h2>
          <div class="text-sm text-gray-600">
            Total: {{ historyStore.pagination.totalRecords }} transaksi
          </div>
        </div>
      </template>

      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600">Tidak ada riwayat peminjaman ditemukan</p>
        </div>
      </template>

      <template #loading>
        <LoadingVideo src="/loading.webm" :width="256" :height="256" />
      </template>

      <!-- Transaction ID Column -->
      <Column
        field="transaction_id"
        header="No. Transaksi"
        style="min-width: 120px"
      >
        <template #body="slotProps">
            <span class="font-mono text-sm"
            >{{ slotProps.index + 1 }}</span
          >
        </template>
      </Column>

      <!-- Project Column -->
      <Column field="project" header="Proyek" style="min-width: 200px">
        <template #body="slotProps">
          <div>
            <div class="font-medium">{{ slotProps.data.project }}</div>
            <div class="text-sm text-gray-500 mt-1">
              {{ slotProps.data.purpose }}
            </div>
          </div>
        </template>
      </Column>

      <!-- Equipment Column -->
      <Column header="Alat" style="min-width: 250px">
        <template #body="slotProps">
          <div class="space-y-1">
            <Tag
              v-for="item in slotProps.data.equipments"
              :key="item.equipment_id"
              :value="`${item.equipment.name} (${item.quantity})`"
              class="mr-1 mb-1"
            />
          </div>
        </template>
      </Column>

      <!-- Dates Column -->
      <Column header="Tanggal" style="min-width: 200px">
        <template #body="slotProps">
          <div class="text-sm">
            <div class="flex items-center mb-1">
              <i class="pi pi-calendar text-green-500 mr-2"></i>
              <span>Pinjam: {{ formatDate(slotProps.data.borrow_date) }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-calendar text-red-500 mr-2"></i>
              <span>Kembali: {{ formatDate(slotProps.data.return_date) }}</span>
            </div>
          </div>
        </template>
      </Column>

      <!-- Status Column -->
      <Column header="Status" style="min-width: 180px">
        <template #body="slotProps">
          <div class="space-y-2">
            <Tag
              :value="getStatusLabel(slotProps.data.status)"
              :severity="getStatusSeverity(slotProps.data.status)"
            />
            <Tag
              :value="getReturnStatusLabel(slotProps.data.return_status)"
              :severity="getReturnStatusSeverity(slotProps.data.return_status)"
            />
          </div>
        </template>
      </Column>

      <!-- Created Date Column -->
      <Column field="createdAt" header="Dibuat" style="min-width: 120px">
        <template #body="slotProps">
          <span class="text-sm">{{
            formatDate(slotProps.data.createdAt)
          }}</span>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Aksi" style="min-width: 120px">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="i-solar:eye-bold"
              size="small"
              v-tooltip="'Lihat Detail'"
              @click="viewDetail(slotProps.data.transaction_id)"
            />
            <Button
              v-if="canDownloadReceipt(slotProps.data)"
              icon="i-solar:download-minimalistic-bold"
              severity="secondary"
              size="small"
              v-tooltip="'Download Bukti'"
              @click="downloadReceipt(slotProps.data.transaction_id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Detail Dialog -->
    <Dialog
      v-model:visible="showDetailDialog"
      :style="{ width: '90vw', maxWidth: '800px' }"
      header="Detail Transaksi"
      modal
    >
      <div v-if="selectedTransaction" class="space-y-6">
        <!-- Transaction Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold mb-2">Informasi Peminjaman</h3>
            <div class="space-y-2 text-sm">
              <div>
                <strong>ID:</strong> #{{ selectedTransaction.transaction_id }}
              </div>
              <div>
                <strong>Proyek:</strong> {{ selectedTransaction.project }}
              </div>
              <div>
                <strong>Tujuan:</strong> {{ selectedTransaction.purpose }}
              </div>
              <div>
                <strong>Tanggal Pinjam:</strong>
                {{ formatDate(selectedTransaction.borrow_date) }}
              </div>
              <div>
                <strong>Tanggal Kembali:</strong>
                {{ formatDate(selectedTransaction.return_date) }}
              </div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Status</h3>
            <div class="space-y-2">
              <Tag
                :value="getStatusLabel(selectedTransaction.status)"
                :severity="getStatusSeverity(selectedTransaction.status)"
              />
              <Tag
                :value="getReturnStatusLabel(selectedTransaction.return_status)"
                :severity="
                  getReturnStatusSeverity(selectedTransaction.return_status)
                "
              />
            </div>
          </div>
        </div>

        <!-- Equipment List -->
        <div>
          <h3 class="font-semibold mb-2">Daftar Alat</h3>
          <DataTable :value="selectedTransaction.equipments" size="small">
            <Column field="equipment.name" header="Nama Alat" />
            <Column
              field="equipment.category.category_name"
              header="Kategori"
            />
            <Column field="quantity" header="Jumlah" />
          </DataTable>
        </div>

        <!-- Return Information -->
        <div v-if="selectedTransaction.equipment_returns.length > 0">
          <h3 class="font-semibold mb-2">Informasi Pengembalian</h3>
          <DataTable
            :value="selectedTransaction.equipment_returns"
            size="small"
          >
            <Column field="equipment.name" header="Nama Alat" />
            <Column field="returned_quantity" header="Jumlah Dikembalikan" />
            <Column field="condition" header="Kondisi">
              <template #body="slotProps">
                <Tag
                  :value="getConditionLabel(slotProps.data.condition)"
                  :severity="getConditionSeverity(slotProps.data.condition)"
                />
              </template>
            </Column>
            <Column field="damage_notes" header="Catatan Kerusakan" />
          </DataTable>
        </div>

        <!-- Notes -->
        <div
          v-if="
            selectedTransaction.verified_notes ||
            selectedTransaction.return_notes
          "
        >
          <h3 class="font-semibold mb-2">Catatan</h3>
          <div class="space-y-2 text-sm">
            <div v-if="selectedTransaction.verified_notes">
              <strong>Catatan Verifikasi:</strong>
              {{ selectedTransaction.verified_notes }}
            </div>
            <div v-if="selectedTransaction.return_notes">
              <strong>Catatan Pengembalian:</strong>
              {{ selectedTransaction.return_notes }}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  layout: "dashuser",
  middleware: ["auth"],
});

const historyStore = useHistoryStore();
const router = useRouter();

// Reactive data
const searchQuery = ref("");
const statusFilter = ref();
const returnStatusFilter = ref();
const showDetailDialog = ref(false);
const selectedTransaction = ref();

// Search debounce
const searchDebounce = ref();

// Options
const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Disetujui", value: "approved" },
  { label: "Ditolak", value: "rejected" },
  { label: "Selesai", value: "completed" },
  { label: "Dibatalkan", value: "cancelled" },
  { label: "Terlambat", value: "overdue" },
];

const returnStatusOptions = [
  { label: "Belum Dikembalikan", value: "not_returned" },
  { label: "Pending Cek", value: "pending_check" },
  { label: "Dikembalikan Lengkap", value: "returned_complete" },
  { label: "Dikembalikan Rusak", value: "returned_damaged" },
  { label: "Dikembalikan Tidak Lengkap", value: "returned_incomplete" },
];

// Methods
const applyFilters = () => {
  historyStore.fetchHistory({
    status: statusFilter.value,
    return_status: returnStatusFilter.value,
    search: searchQuery.value,
    page: 1,
  });
};

const onSearchChange = () => {
  clearTimeout(searchDebounce.value);
  searchDebounce.value = setTimeout(() => {
    applyFilters();
  }, 500);
};

const resetFilters = () => {
  searchQuery.value = "";
  statusFilter.value = null;
  returnStatusFilter.value = null;
  historyStore.fetchHistory({ page: 1 });
};

const onPageChange = (event: any) => {
  historyStore.fetchHistory({
    status: statusFilter.value,
    return_status: returnStatusFilter.value,
    search: searchQuery.value,
    page: event.page + 1,
  });
};

const viewDetail = (transactionId: number) => {
  selectedTransaction.value = historyStore.transactions.find(
    (t) => t.transaction_id === transactionId
  );
  showDetailDialog.value = true;
};

const canDownloadReceipt = (transaction: any) => {
  return (
    transaction.status === "completed" ||
    transaction.return_status === "returned_complete"
  );
};

const downloadReceipt = (transactionId: number) => {
  // Implementation for downloading receipt
  window.open(`/api/transaction/${transactionId}/receipt`, "_blank");
};

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Disetujui",
    rejected: "Ditolak",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    overdue: "Terlambat",
  };
  return labels[status] || status;
};

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    completed: "info",
    cancelled: "secondary",
    overdue: "danger",
  };
  return severities[status] || "secondary";
};

const getReturnStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    not_returned: "Belum Dikembalikan",
    pending_check: "Pending Cek",
    returned_complete: "Dikembalikan Lengkap",
    returned_damaged: "Dikembalikan Rusak",
    returned_incomplete: "Dikembalikan Tidak Lengkap",
  };
  return labels[status] || status;
};

const getReturnStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    not_returned: "warning",
    pending_check: "info",
    returned_complete: "success",
    returned_damaged: "danger",
    returned_incomplete: "secondary",
  };
  return severities[status] || "secondary";
};

const getConditionLabel = (condition: string) => {
  const labels: Record<string, string> = {
    good: "Baik",
    damaged: "Rusak",
    incomplete: "Tidak Lengkap",
    lost: "Hilang",
    other: "Lainnya",
  };
  return labels[condition] || condition;
};

const getConditionSeverity = (condition: string) => {
  const severities: Record<string, string> = {
    good: "success",
    damaged: "danger",
    incomplete: "warning",
    lost: "danger",
    other: "secondary",
  };
  return severities[condition] || "secondary";
};

// Lifecycle
onMounted(() => {
  historyStore.fetchHistory();
});

onUnmounted(() => {
  clearTimeout(searchDebounce.value);
});
</script>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  font-weight: 600;
}

:deep(.p-tag) {
  font-size: 0.75rem;
}
</style>

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
        <template #body="slotProps">
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
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";

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
      value: year
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
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
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

// Update fungsi exportCSV
const exportCSV = () => {
  let fileName = "transactions";
  
  const monthNames = [
    "januari", "februari", "maret", "april", "mei", "juni",
    "juli", "agustus", "september", "oktober", "november", "desember"
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

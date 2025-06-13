<template>
  <div class="">
    <Toolbar class="flex flex-col items-end md:flex-row md:items-center md:justify-between mb-5">
      <template #start>
        <Button
          icon="i-material-symbols:add"
          label="Tambah"
          @click="openNewMaintenanceDialog"
          severity="contrast"
        />
      </template>
      <template #end>
        <div class="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            icon="i-solar:refresh-bold"
            @click="refreshMaintenance"
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

    <!-- Filter -->
    <div class="mb-4 flex flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <label for="status-filter" class="font-medium">Status:</label>
        <Select
          id="status-filter"
          v-model="filters.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Pilih Status"
          class="w-48"
          @change="filterMaintenance"
        />
      </div>
    </div>

    <!-- Data Table -->
    <DataTable
      ref="dt"
      :value="maintenances"
      show-gridlines
      paginator
      striped-rows
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      :loading="loading"
      :globalFilterFields="[
        'id',
        'equipment.name',
        'maintenance_type',
        'status',
        'technician_name',
      ]"
      tableStyle="min-width: 50rem"
      filterDisplay="row"
    >
      <template #header>
        <div class="flex flex-col md:flex-row md:justify-between items-center gap-2.5">
          <h2 class="font-bold font-poppins">Daftar Pemeliharaan</h2>
          <IconField>
            <InputIcon>
              <div class="i-material-symbols:search" />
            </InputIcon>
            <InputText v-model="globalSearchValue" placeholder="Search..." />
          </IconField>
        </div>
      </template>

      <template #empty>
        <p class="text-center">Tidak ada pemeliharaan alat</p>
      </template>

      <template #loading>
        <LoadingVideo src="/loading.webm" :width="256" :height="256" />
      </template>

      <Column field="maintenance_id" header="ID" sortable style="min-width: 6rem"></Column>

      <Column
        field="equipment.name"
        header="Nama Peralatan"
        sortable
        style="min-width: 14rem"
      >
        <template #body="{ data }">
          {{ data.equipment?.name || "N/A" }}
        </template>
      </Column>

      <Column field="quantity" header="Jumlah" sortable style="min-width: 8rem"></Column>

      <Column field="maintenance_type" header="Jenis" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <Tag :severity="getMaintenanceTypeSeverity(data.maintenance_type)">
            {{ formatMaintenanceType(data.maintenance_type) }}
          </Tag>
        </template>
      </Column>

      <Column field="start_date" header="Tanggal Mulai" sortable style="min-width: 10rem">
        <template #body="{ data }">
          {{ formatDate(data.start_date) }}
        </template>
      </Column>

      <Column
        field="expected_end_date"
        header="Perkiraan Selesai"
        sortable
        style="min-width: 10rem"
      >
        <template #body="{ data }">
          {{
            data.expected_end_date
              ? formatDate(data.expected_end_date)
              : "Belum ditentukan"
          }}
        </template>
      </Column>

      <Column field="status" header="Status" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <Tag
            :severity="getStatusSeverity(data.status)"
            :value="formatStatus(data.status)"
          ></Tag>
        </template>
      </Column>

      <Column field="technician_name" header="Teknisi" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.technician_name || "Belum ditentukan" }}
        </template>
      </Column>

      <Column header="Aksi" style="min-width: 12rem">
        <template #body="{ data }">
          <Button
            icon="i-solar:eye-bold"
            class="p-button-rounded p-button-info p-button-sm mr-2"
            variant="outlined"
            @click="viewMaintenance(data)"
          />
          <Button
            icon="i-material-symbols:edit"
            class="p-button-rounded p-button-warning p-button-sm mr-2"
            variant="outlined"
            @click="editMaintenance(data)"
          />
          <Button
            v-if="data.status === StatusMaintenance.ongoing"
            icon="i-material-symbols:check"
            class="p-button-rounded p-button-success p-button-sm"
            @click="completeMaintenance(data)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- New Maintenance Dialog -->
    <Dialog
      v-model:visible="newMaintenanceDialog"
      :style="{ width: '30rem' }"
      header="Tambah Pemeliharaan Peralatan"
      :modal="true"
    >
      <!-- Gunakan komponen FormAddMaintenance -->
      <FormAddMaintenance
        @save="
          {
            closeDialog();
            refreshMaintenance();
          }
        "
        @cancel="closeDialog"
      />
    </Dialog>

    <!-- View/Edit Maintenance Dialog -->
    <Dialog
      v-model:visible="editMaintenanceDialog"
      :style="{ width: '500px' }"
      :header="viewMode ? 'Detail Pemeliharaan' : 'Edit Pemeliharaan'"
      :modal="true"
    >
      <div v-if="selectedMaintenance">
        <div class="field mb-4">
          <label class="font-bold">ID</label>
          <div class="mt-1">{{ selectedMaintenance.id }}</div>
        </div>

        <div class="field mb-4">
          <label class="font-bold">Peralatan</label>
          <div class="mt-1">{{ selectedMaintenance.equipment?.name }}</div>
        </div>

        <div class="field mb-4">
          <label class="font-bold">Jumlah</label>
          <div class="mt-1">{{ selectedMaintenance.quantity }} unit</div>
        </div>

        <div class="field mb-4">
          <label class="font-bold">Jenis Pemeliharaan</label>
          <div class="mt-1">
            <Tag
              :severity="getMaintenanceTypeSeverity(selectedMaintenance.maintenance_type)"
            >
              {{ formatMaintenanceType(selectedMaintenance.maintenance_type) }}
            </Tag>
          </div>
        </div>

        <div class="field mb-4">
          <label class="font-bold">Tanggal Mulai</label>
          <div class="mt-1">
            {{ formatDate(selectedMaintenance.start_date) }}
          </div>
        </div>

        <div class="field mb-4">
          <label class="font-bold">Perkiraan Selesai</label>
          <div class="mt-1">
            {{
              selectedMaintenance.expected_end_date
                ? formatDate(selectedMaintenance.expected_end_date)
                : "Belum ditentukan"
            }}
          </div>
        </div>

        <div
          class="field mb-4"
          v-if="selectedMaintenance.status === StatusMaintenance.completed"
        >
          <label class="font-bold">Tanggal Selesai</label>
          <div class="mt-1">
            {{
              selectedMaintenance.actual_end_date
                ? formatDate(selectedMaintenance.actual_end_date)
                : "Belum selesai"
            }}
          </div>
        </div>

        <div class="flex flex-col mb-5">
          <label class="font-bold">Status</label>
          <div v-if="viewMode" class="mt-1">
            <Tag
              :severity="getStatusSeverity(selectedMaintenance.status)"
              :value="formatStatus(selectedMaintenance.status)"
            ></Tag>
          </div>
          <Select
            v-else
            v-model="editForm.status"
            :options="statusOptions.filter((s) => s.value !== null)"
            option-label="label"
            option-value="value"
            placeholder="Pilih Status"
            class="mt-1"
          />
        </div>

        <div class="flex flex-col mb-5">
          <label class="font-bold">Teknisi</label>
          <div v-if="viewMode" class="mt-1">
            {{ selectedMaintenance.technician_name || "Belum ditentukan" }}
          </div>
          <InputText v-else v-model="editForm.technician_name" class="mt-1" />
        </div>

        <div class="field mb-4">
          <label class="font-bold">Deskripsi</label>
          <div v-if="viewMode" class="mt-1 whitespace-pre-line">
            {{ selectedMaintenance.description || "Tidak ada deskripsi" }}
          </div>
        </div>

        <div class="flex flex-col mb-5">
          <label class="font-bold">Catatan</label>
          <div v-if="viewMode" class="mt-1 whitespace-pre-line">
            {{ selectedMaintenance.notes || "Tidak ada catatan" }}
          </div>
          <Textarea
            v-else
            v-model="editForm.notes"
            rows="3"
            class="mt-1"
            placeholder="Tambahkan catatan"
          />
        </div>

        <div class="field mb-4">
          <label class="font-bold">Dicatat Oleh</label>
          <div class="mt-1">
            {{ selectedMaintenance.admin?.full_name || "Unknown" }}
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Tutup"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeDetailDialog"
          v-if="viewMode"
        />
        <div v-else>
          <Button
            label="Batal"
            icon="pi pi-times"
            class="p-button-text"
            @click="closeDetailDialog"
          />
          <Button label="Simpan" icon="pi pi-check" @click="updateMaintenanceRecord" />
        </div>
      </template>
    </Dialog>

    <!-- Complete Maintenance Dialog -->
    <Dialog
      v-model:visible="completeMaintenanceDialog"
      :style="{ width: '450px' }"
      header="Selesaikan Pemeliharaan"
      :modal="true"
      class="p-fluid"
    >
      <div v-if="selectedMaintenance">
        <p class="mb-4">
          Apakah Anda yakin ingin menyelesaikan pemeliharaan untuk
          <strong
            >{{ selectedMaintenance.quantity }} unit
            {{ selectedMaintenance.equipment?.name }}</strong
          >?
        </p>
        <p class="mb-4">
          Ini akan mengubah status pemeliharaan menjadi "Selesai" dan mengembalikan jumlah
          unit ke stok yang tersedia.
        </p>

        <div class="field mb-4">
          <label for="complete-notes" class="font-bold">Catatan Penyelesaian</label>
          <Textarea
            id="complete-notes"
            v-model="completeForm.notes"
            rows="3"
            placeholder="Tambahkan catatan penyelesaian"
            class="mt-1"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          class="p-button-text"
          @click="completeMaintenanceDialog = false"
        />
        <Button
          label="Selesaikan"
          icon="pi pi-check"
          class="p-button-success"
          @click="finishMaintenance"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "@primevue/core/api";
import type { MaintenanceType } from "~/types/maintenance";

enum StatusMaintenance {
  ongoing = "ongoing",
  completed = "completed",
  cancelled = "cancelled",
}

const maintenanceStore = useMaintenanceStore();
const equipmentStore = useEquipmentStore();
const toast = useToast();

const dt = ref();
const loading = ref(false);
const maintenances = computed(() => maintenanceStore.maintenances);

// Global search
const globalSearchValue = ref("");
watch(globalSearchValue, (newValue) => {
  dt.value.filter(newValue, "contains");
});

const filters = reactive<any>({
  status: null,
});

// Modals
const newMaintenanceDialog = ref(false);
const editMaintenanceDialog = ref(false);
const completeMaintenanceDialog = ref(false);
const viewMode = ref(true);

const editForm = reactive({
  status: "",
  notes: "",
  technician_name: "",
});

const completeForm = reactive({
  notes: "",
});

const selectedMaintenance = ref<any>(null);

// Options
const statusOptions = [
  { label: "Semua", value: null },
  { label: "Sedang Berlangsung", value: StatusMaintenance.ongoing },
  { label: "Selesai", value: StatusMaintenance.completed },
  { label: "Dibatalkan", value: StatusMaintenance.cancelled },
];

// Fetch data on mount
onMounted(async () => {
  await refreshMaintenance();
  await equipmentStore.getEquipment();
});

// Methods
const refreshMaintenance = async () => {
  loading.value = true;
  try {
    await maintenanceStore.fetchMaintenances({ status: filters.status });
  } catch (error) {
    console.error("Error refreshing maintenance:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal memuat data pemeliharaan",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const filterMaintenance = async () => {
  await maintenanceStore.fetchMaintenances({ status: filters.status });
};

const openNewMaintenanceDialog = () => {
  newMaintenanceDialog.value = true;
};

const closeDialog = () => {
  newMaintenanceDialog.value = false;
};

const closeDetailDialog = () => {
  editMaintenanceDialog.value = false;
  selectedMaintenance.value = null;
};

const viewMaintenance = (maintenance: any) => {
  selectedMaintenance.value = maintenance;
  viewMode.value = true;
  editMaintenanceDialog.value = true;
};

const editMaintenance = (maintenance: any) => {
  selectedMaintenance.value = maintenance;
  editForm.status = maintenance.status;
  editForm.notes = maintenance.notes || "";
  editForm.technician_name = maintenance.technician_name || "";
  viewMode.value = false;
  editMaintenanceDialog.value = true;
};

const updateMaintenanceRecord = async () => {
  if (!selectedMaintenance.value) return;

  try {
    const result = await maintenanceStore.updateMaintenance(
      selectedMaintenance.value.id,
      editForm
    );

    if (result.success) {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Pemeliharaan berhasil diperbarui",
        life: 3000,
      });
      closeDetailDialog();
      await refreshMaintenance();
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: result.message || "Gagal memperbarui pemeliharaan",
        life: 3000,
      });
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "Terjadi kesalahan",
      life: 3000,
    });
  }
};

const completeMaintenance = (maintenance: any) => {
  selectedMaintenance.value = maintenance;
  completeForm.notes = "";
  completeMaintenanceDialog.value = true;
};

const finishMaintenance = async () => {
  if (!selectedMaintenance.value) return;

  try {
    const result = await maintenanceStore.updateMaintenance(
      selectedMaintenance.value.id,
      {
        status: StatusMaintenance.completed,
        notes: completeForm.notes,
      }
    );

    if (result.success) {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Pemeliharaan berhasil diselesaikan",
        life: 3000,
      });
      completeMaintenanceDialog.value = false;
      await refreshMaintenance();
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: result.message || "Gagal menyelesaikan pemeliharaan",
        life: 3000,
      });
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "Terjadi kesalahan",
      life: 3000,
    });
  }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

// Utility methods
const formatDate = (dateString: any) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatMaintenanceType = (type: string): string => {
  const typeMap: Record<MaintenanceType, string> = {
    repair: "Perbaikan",
    cleaning: "Pembersihan",
    calibration: "Kalibrasi",
    inspection: "Inspeksi",
  };
  return type in typeMap ? typeMap[type as MaintenanceType] : type;
};

const getMaintenanceTypeSeverity = (type: MaintenanceType | string) => {
  const severityMap: Record<MaintenanceType, string> = {
    repair: "danger",
    cleaning: "success",
    calibration: "warning",
    inspection: "info",
  };
  return type in severityMap ? severityMap[type as MaintenanceType] : "info";
};

const formatStatus = (status: string) => {
  const statusMap: Record<StatusMaintenance, string> = {
    [StatusMaintenance.ongoing]: "Sedang Berlangsung",
    [StatusMaintenance.completed]: "Selesai",
    [StatusMaintenance.cancelled]: "Dibatalkan",
  };
  return status in statusMap
    ? statusMap[(status as unknown) as StatusMaintenance]
    : status;
};

const getStatusSeverity = (status: StatusMaintenance) => {
  const severityMap: Record<StatusMaintenance, string> = {
    [StatusMaintenance.ongoing]: "warning",
    [StatusMaintenance.completed]: "success",
    [StatusMaintenance.cancelled]: "danger",
  };
  return severityMap[status] || "info";
};

// Page meta
definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

useSeoMeta({
  title: "Pemeliharaan Peralatan | Mediawi",
  description: "Halaman manajemen pemeliharaan peralatan",
  ogTitle: "Pemeliharaan Peralatan | Mediawi",
});
</script>

<style></style>

<template>
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
          :severity="
            getMaintenanceTypeSeverity(selectedMaintenance.maintenance_type)
          "
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
        {{ selectedMaintenance || "Tidak ada deskripsi" }}
      </div>
      <Textarea
        v-else
        v-model="selectedMaintenance.description"
        rows="3"
        class="mt-1"
        placeholder="Tambahkan deskripsi"
      />
    </div>

    {{ selectedMaintenance }}

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
</template>

<script lang="ts" setup>
import type { MaintenanceType } from "~/types/maintenance";

enum StatusMaintenance {
  ongoing = "ongoing",
  completed = "completed",
  cancelled = "cancelled",
}

// Mendefinisikan Props
defineProps({
  viewMode: {
    type: Boolean,
    default: false,
    required: true,
  },
  selectedMaintenance: {
    type: Object,
    default: () => ({}),
    required: true,
  },
});

const editForm = reactive({
  status: "",
  notes: "",
  technician_name: "",
});

// Options
const statusOptions = [
  { label: "Semua", value: null },
  { label: "Sedang Berlangsung", value: StatusMaintenance.ongoing },
  { label: "Selesai", value: StatusMaintenance.completed },
  { label: "Dibatalkan", value: StatusMaintenance.cancelled },
];

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

const getMaintenanceTypeSeverity = (type: MaintenanceType | string) => {
  const severityMap: Record<MaintenanceType, string> = {
    repair: "danger",
    cleaning: "success",
    calibration: "warning",
    inspection: "info",
  };
  return type in severityMap ? severityMap[type as MaintenanceType] : "info";
};

const getStatusSeverity = (status: StatusMaintenance) => {
  const severityMap: Record<StatusMaintenance, string> = {
    [StatusMaintenance.ongoing]: "warning",
    [StatusMaintenance.completed]: "success",
    [StatusMaintenance.cancelled]: "danger",
  };
  return severityMap[status] || "info";
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

const formatStatus = (status: string) => {
  const statusMap: Record<StatusMaintenance, string> = {
    [StatusMaintenance.ongoing]: "Sedang Berlangsung",
    [StatusMaintenance.completed]: "Selesai",
    [StatusMaintenance.cancelled]: "Dibatalkan",
  };
  return status in statusMap
    ? statusMap[status as unknown as StatusMaintenance]
    : status;
};
</script>

<style></style>

<template>
  <Form @submit.prevent="saveMaintenance" class="flex flex-col">
    <FloatLabel variant="on" class="mt-5 mb-5">
      <Select
        id="equipment"
        v-model="maintenanceForm.equipment_id"
        :options="equipments"
        option-label="name"
        option-value="equipment_id"
        class="w-full"
        :class="{ 'p-invalid': !maintenanceForm.equipment_id }"
        @change="onEquipmentChange"
        required
      />
      <label for="equipment" class="">Peralatan</label>
    </FloatLabel>
    <small v-if="!maintenanceForm.equipment_id" class="p-error mb-5"
      >Peralatan harus dipilih</small
    >

    <FloatLabel variant="on" class="mb-5">
      <InputNumber
        inputId="quantity"
        v-model="maintenanceForm.quantity"
        mode="decimal"
        :max="selectedEquipment?.available_quantity || 0"
        :min="1"
        class="w-full"
        :class="{ 'p-invalid': !maintenanceForm.quantity }"
        required
      />
      <label for="quantity" class="">Jumlah</label>
    </FloatLabel>
    <small v-if="!maintenanceForm.quantity" class="p-error mb-5"
      >Jumlah harus diisi</small
    >
    <small v-if="selectedEquipment" class="text-gray-500 mb-5">
      Tersedia: {{ selectedEquipment?.available_quantity || 0 }} unit
    </small>

    <FloatLabel variant="on" class="mb-5">
      <Select
        id="maintenance_type"
        v-model="maintenanceForm.maintenance_type"
        :options="maintenanceTypes"
        option-label="label"
        option-value="value"
        class="w-full"
        :class="{
          'p-invalid': !maintenanceForm.maintenance_type,
        }"
        required
      />
      <label for="maintenance_type">Jenis Pemeliharaan</label>
    </FloatLabel>
    <small v-if="!maintenanceForm.maintenance_type" class="text-red-500 mb-5"
      >Jenis harus dipilih</small
    >

    <FloatLabel variant="on" class="mb-5">
      <DatePicker
        inputId="expected_end_date"
        v-model="maintenanceForm.expected_end_date"
        dateFormat="dd/mm/yy"
        class="w-full"
        :class="{
          'p-invalid': !maintenanceForm.expected_end_date,
        }"
        :min-date="new Date()"
        :manualInput="false"
      />
      <label for="expected_end_date">Perkiraan Tanggal Selesai</label>
    </FloatLabel>
    <small v-if="!maintenanceForm.expected_end_date" class="text-red-500 mb-5"
      >Masukkan tanggal</small
    >

    <FloatLabel variant="on" class="mb-5">
      <InputText
        id="technician_name"
        v-model="maintenanceForm.technician_name"
        class="w-full"
      />
      <label for="technician_name" class="">Nama Teknisi (Opsional)</label>
    </FloatLabel>

    <FloatLabel variant="on" class="mb-5">
      <Textarea
        id="description"
        v-model="maintenanceForm.description"
        rows="3"
        class="w-full"
      />
      <label for="description" class="">Deskripsi (Opsional)</label>
    </FloatLabel>

    <div class="flex justify-end gap-2 mt-4">
      <Button
        label="Batal"
        icon="pi pi-times"
        class="p-button-text"
        @click="emit('cancel')"
        type="button"
      />
      <Button
        label="Simpan"
        icon="pi pi-check"
        @click="saveMaintenance"
        type="button"
      />
    </div>
  </Form>
</template>

<script setup lang="ts">
const equipmentStore = useEquipmentStore();
const maintenanceStore = useMaintenanceStore();
const toast = useToast();

const emit = defineEmits(["save", "cancel"]);

// Form states
const maintenanceForm = reactive({
  equipment_id: "",
  quantity: 1,
  maintenance_type: "",
  description: "",
  expected_end_date: null,
  technician_name: "",
});

const equipments = computed(() => equipmentStore.equipment);
const selectedEquipment = ref<any>(null);

// Options
const maintenanceTypes = [
  { label: "Perbaikan", value: "repair" },
  { label: "Pembersihan", value: "cleaning" },
  { label: "Kalibrasi", value: "calibration" },
  { label: "Inspeksi", value: "inspection" },
];

const onEquipmentChange = () => {
  if (maintenanceForm.equipment_id) {
    selectedEquipment.value = equipments.value.find(
      (eq: any) => eq.equipment_id === maintenanceForm.equipment_id
    );
    // Reset quantity if it exceeds available quantity
    if (
      selectedEquipment.value &&
      maintenanceForm.quantity > selectedEquipment.value.available_quantity
    ) {
      maintenanceForm.quantity = selectedEquipment.value.available_quantity;
    }
  } else {
    selectedEquipment.value = null;
  }
};

const saveMaintenance = async () => {
  if (
    !maintenanceForm.equipment_id ||
    !maintenanceForm.quantity ||
    !maintenanceForm.maintenance_type
  ) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Harap isi semua kolom yang diperlukan",
      life: 3000,
    });
    return;
  } else if (!maintenanceForm.expected_end_date) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Harap isi Perkiraan tanggal selesai",
      life: 3000,
    });
    return;
  }

  try {
    const result = await maintenanceStore.createMaintenance(maintenanceForm);

    if (result.success) {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Pemeliharaan berhasil ditambahkan",
        life: 3000,
      });
      emit("save");
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: result.message || "Gagal menambahkan pemeliharaan",
        life: 3000,
      });
      emit("cancel");
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.data?.message,
      life: 3000,
    });
    emit("cancel");
  }
};
</script>

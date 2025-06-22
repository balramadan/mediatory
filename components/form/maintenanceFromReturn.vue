<template>
  <div class="flex flex-col gap-5">
    <div class="mb-4">
      <h3 class="font-semibold mb-2">Informasi Peminjam</h3>
      <div class="bg-gray-50 p-3 rounded">
        <p><strong>Nama:</strong> {{ borrowerInfo?.full_name }}</p>
        <p><strong>Email:</strong> {{ borrowerInfo?.email }}</p>
        <p><strong>Telepon:</strong> {{ borrowerInfo?.phone }}</p>
      </div>
    </div>

    <div class="mb-4">
      <h3 class="font-semibold mb-2">Barang Rusak yang Perlu Diperbaiki</h3>
      <div class="space-y-3">
        <div
          v-for="(item, index) in damagedItems"
          :key="index"
          class="border rounded p-3"
        >
          <div class="flex items-center mb-2">
            <Checkbox
              v-model="selectedItems"
              :value="item.equipment_id"
              :inputId="`item-${index}`"
            />
            <label :for="`item-${index}`" class="ml-2 font-medium">
              {{ item.equipment.name }}
            </label>
          </div>
          <p class="text-sm text-gray-600">{{ item.damage_notes }}</p>
          <p class="text-sm"><strong>Jumlah:</strong> {{ item.returned_quantity }} unit</p>
        </div>
      </div>
    </div>

    <Divider />

    <div class="space-y-4">
      <h3 class="font-semibold">Detail Maintenance</h3>
      
      <div>
        <label class="block mb-2 text-sm font-medium">Jenis Maintenance:</label>
        <Select
          v-model="maintenanceForm.maintenance_type"
          :options="maintenanceTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih jenis maintenance"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium">Deskripsi:</label>
        <Textarea
          v-model="maintenanceForm.description"
          rows="3"
          class="w-full"
          placeholder="Deskripsikan pekerjaan maintenance yang diperlukan"
        />
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium">Teknisi:</label>
        <InputText
          v-model="maintenanceForm.technician_name"
          class="w-full"
          placeholder="Nama teknisi yang bertanggung jawab"
        />
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium">Perkiraan Selesai:</label>
        <DatePicker
          v-model="maintenanceForm.expected_end_date"
          dateFormat="dd/mm/yy"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium">Catatan Tambahan:</label>
        <Textarea
          v-model="maintenanceForm.notes"
          rows="2"
          class="w-full"
          placeholder="Catatan tambahan (opsional)"
        />
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <Button
        label="Batal"
        severity="secondary"
        @click="$emit('cancel')"
      />
      <Button
        label="Buat Jadwal Maintenance"
        @click="createMaintenance"
        :loading="saving"
        :disabled="selectedItems.length === 0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  transactionId: number;
  damagedItems: any[];
  borrowerInfo: any;
}

const props = defineProps<Props>();
const emit = defineEmits(['cancel', 'completed']);
const toast = useToast();

const saving = ref(false);
const selectedItems = ref<string[]>([]);

const maintenanceForm = reactive({
  maintenance_type: '',
  description: '',
  technician_name: '',
  expected_end_date: null,
  notes: `Maintenance diperlukan karena kerusakan saat peminjaman oleh ${props.borrowerInfo?.full_name}`,
});

const maintenanceTypeOptions = [
  { label: "Perbaikan", value: "repair" },
  { label: "Pembersihan", value: "cleaning" },
  { label: "Kalibrasi", value: "calibration" },
  { label: "Inspeksi", value: "inspection" },
];

const createMaintenance = async () => {
  if (selectedItems.value.length === 0) {
    toast.add({
      severity: "warn",
      summary: "Peringatan",
      detail: "Pilih minimal satu barang untuk maintenance",
      life: 3000,
    });
    return;
  }

  try {
    saving.value = true;

    const maintenanceRequests = selectedItems.value.map(equipmentId => {
      const item = props.damagedItems.find(d => d.equipment_id === equipmentId);
      return {
        equipment_id: equipmentId,
        quantity: item?.returned_quantity || 1,
        maintenance_type: maintenanceForm.maintenance_type,
        description: `${maintenanceForm.description}\n\nKerusakan: ${item?.damage_notes}`,
        technician_name: maintenanceForm.technician_name,
        expected_end_date: maintenanceForm.expected_end_date,
        notes: maintenanceForm.notes,
        source_transaction_id: props.transactionId,
      };
    });

    const response = await $fetch('/api/maintenance/from-return', {
      method: 'POST',
      body: {
        maintenance_requests: maintenanceRequests,
        borrower_info: props.borrowerInfo,
      },
    });

    if (response.statusCode !== 200) {
      throw new Error(response.message || 'Gagal membuat jadwal maintenance');
    }

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Jadwal maintenance berhasil dibuat",
      life: 3000,
    });

    emit('completed', response.data);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "Terjadi kesalahan saat membuat jadwal maintenance",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};
</script>
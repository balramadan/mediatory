<template>
  <Form class="flex flex-col gap-5 mt-1 w-full" @submit="checkReturn">
    <div v-if="loading" class="flex justify-center items-center">
      <ProgressSpinner />
    </div>
    <div
      v-else
      v-for="(item, index) in equipments"
      :key="index"
      class="p-4 border border-gray-200 rounded-md"
    >
      <h3 class="font-semibold text-lg mb-2">{{ item.equipment.name }}</h3>
      <div class="flex flex-col gap-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 text-sm">Jumlah dipinjam:</label>
            <InputNumber v-model="item.quantity" disabled class="w-full" />
          </div>
          <div>
            <label class="block mb-2 text-sm">Jumlah dikembalikan:</label>
            <InputNumber
              v-model="item.returned_quantity"
              :max="item.quantity"
              class="w-full"
              @update:modelValue="updateReturnedQuantity(item)"
            />
          </div>
        </div>

        <div>
          <label class="block mb-2 text-sm">Kondisi:</label>
          <Select
            v-model="item.condition"
            :options="conditionOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih kondisi"
            class="w-full"
          />
        </div>

        <div v-if="item.condition && item.condition !== 'good'">
          <label class="block mb-2 text-sm"
            >Catatan kerusakan/kehilangan:</label
          >
          <Textarea
            v-model="item.damage_notes"
            rows="2"
            class="w-full"
            placeholder="Deskripsikan kondisi atau alasan"
          />
        </div>
      </div>
      <Divider />
    </div>

    <div class="mt-4">
      <label class="block mb-2 text-sm"
        >Catatan pengembalian secara keseluruhan:</label
      >
      <Textarea
        v-model="returnNotes"
        rows="3"
        class="w-full"
        placeholder="Tambahkan catatan pengembalian secara keseluruhan"
      />
    </div>

    <div class="flex justify-end mt-4">
      <Button
        type="button"
        label="Batal"
        severity="secondary"
        class="mr-2"
        @click.prevent="$emit('cancel')"
      />
      <Button
        type="submit"
        label="Konfirmasi Pengembalian"
        severity="contrast"
        :disabled="!isFormValid"
      />
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { useTransactionStore } from "~/stores/transaction";

const props = defineProps({
  transactionId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["cancel", "completed"]);

const loading = ref(true);
const equipments = ref<any[]>([]);
const returnNotes = ref("");
const toast = useToast();
const transactionStore = useTransactionStore();

const conditionOptions = [
  { label: "Baik", value: "good" },
  { label: "Rusak", value: "damaged" },
  { label: "Tidak Lengkap", value: "incomplete" },
  { label: "Hilang", value: "lost" },
  { label: "Lainnya", value: "other" },
];

// Compute if form is valid for submission
const isFormValid = computed(() => {
  // Check if all required fields are filled
  return equipments.value.every((item) => {
    // Required fields: returned_quantity, condition
    const hasRequiredFields = item.returned_quantity !== null && item.condition;

    // If condition is not 'good', then damage_notes is required
    const needsDamageNotes = item.condition && item.condition !== "good";

    return (
      hasRequiredFields &&
      (!needsDamageNotes || (needsDamageNotes && item.damage_notes?.trim()))
    );
  });
});

// Prevent returned quantity from exceeding borrowed quantity
const updateReturnedQuantity = (item: any) => {
  if (item.returned_quantity > item.quantity) {
    item.returned_quantity = item.quantity;
  }
};

// Fetch transaction details and populate form
const fetchTransactionData = async () => {
  try {
    loading.value = true;

    // Pastikan semua transaksi sudah dimuat
    await transactionStore.getAllTransaction();

    // Ambil data transaksi dari store
    const transaction = transactionStore.getTransaction(props.transactionId);

    if (!transaction) {
      throw new Error("Gagal memuat data transaksi");
    }

    if (!transaction.equipments || transaction.equipments.length === 0) {
      throw new Error("Data peralatan tidak ditemukan");
    }

    // Initialize equipment return data
    equipments.value = transaction.equipments.map((item) => ({
      transaction_id: props.transactionId,
      equipment_id: item.equipment_id,
      equipment: item.equipment,
      quantity: item.quantity,
      returned_quantity: item.quantity, // Default to full return
      condition: "good", // Default to good condition
      damage_notes: "",
      return_date: new Date(),
    }));
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Terjadi kesalahan saat memuat data",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Submit form data
const checkReturn = async () => {
  try {
    loading.value = true;

    // Prepare data for submission
    const returnData = {
      transaction_id: props.transactionId,
      return_notes: returnNotes.value,
      equipment_returns: equipments.value.map((item) => ({
        equipment_id: item.equipment_id,
        returned_quantity: item.returned_quantity,
        condition: item.condition,
        damage_notes: item.damage_notes,
      })),
    };

    // Send data to the server
    const { data, error } = await useFetch("/api/transaction/returned/verify", {
      method: "POST",
      body: returnData,
    });

    if (error.value) {
      throw new Error(
        error.value.message || "Gagal memverifikasi pengembalian"
      );
    }

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Verifikasi pengembalian berhasil",
      life: 3000,
    });

    // Emit completed event
    emit("completed", data.value);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Terjadi kesalahan saat memverifikasi pengembalian",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Initialize data when component is mounted
onMounted(() => {
  fetchTransactionData();
});
</script>

<style scoped>
/* Component specific styles */
.p-select {
  width: 100%;
}
</style>

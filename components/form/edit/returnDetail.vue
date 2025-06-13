<template>
  <div class="flex flex-col gap-5">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <ProgressSpinner />
    </div>
    
    <div v-else>
      <div class="mb-4">
        <p class="text-sm text-gray-600">
          Edit detail pengembalian untuk memperbaiki status barang yang rusak atau hilang.
        </p>
      </div>

      <div
        v-for="(item, index) in localReturnDetails"
        :key="index"
        class="p-4 border border-gray-200 rounded-md mb-4"
      >
        <h3 class="font-semibold text-lg mb-3">{{ item.equipment.name }}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 text-sm font-medium">Jumlah Dikembalikan:</label>
            <InputNumber 
              v-model="item.returned_quantity"
              :max="getMaxQuantity(item)"
              class="w-full" 
            />
          </div>
          
          <div>
            <label class="block mb-2 text-sm font-medium">Kondisi:</label>
            <Select
              v-model="item.condition"
              :options="conditionOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih kondisi"
              class="w-full"
            />
          </div>
        </div>

        <div v-if="item.condition && item.condition !== 'good'" class="mt-4">
          <label class="block mb-2 text-sm font-medium">
            Catatan kerusakan/kehilangan:
          </label>
          <Textarea
            v-model="item.damage_notes"
            rows="3"
            class="w-full"
            placeholder="Deskripsikan kondisi atau alasan"
          />
        </div>

        <!-- Status replacement untuk item hilang -->
        <div v-if="item.condition === 'lost' || item.condition === 'incomplete'" class="mt-4">
          <label class="block mb-2 text-sm font-medium">Status Penggantian:</label>
          <Select
            v-model="item.replacement_status"
            :options="replacementStatusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih status penggantian"
            class="w-full"
          />
        </div>

        <!-- Penalty amount untuk item hilang -->
        <div v-if="(item.condition === 'lost' || item.condition === 'incomplete') && item.replacement_status === 'penalty_paid'" class="mt-4">
          <label class="block mb-2 text-sm font-medium">Jumlah Denda (Rp):</label>
          <InputNumber 
            v-model="item.penalty_amount"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            class="w-full"
          />
          
          <label class="block mb-2 text-sm font-medium mt-4">Catatan Denda:</label>
          <Textarea
            v-model="item.penalty_notes"
            rows="2"
            class="w-full"
            placeholder="Catatan tambahan mengenai denda"
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
          label="Simpan Perubahan"
          @click="saveChanges"
          :loading="saving"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  transactionId: number;
  returnDetails: any[];
}

const props = defineProps<Props>();
const emit = defineEmits(['cancel', 'completed']);
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const localReturnDetails = ref([...props.returnDetails]);

const conditionOptions = [
  { label: "Baik", value: "good" },
  { label: "Rusak", value: "damaged" },
  { label: "Tidak Lengkap", value: "incomplete" },
  { label: "Hilang", value: "lost" },
  { label: "Lainnya", value: "other" },
];

const replacementStatusOptions = [
  { label: "Belum Ditentukan", value: null },
  { label: "Barang Ditemukan", value: "found" },
  { label: "Barang Diganti", value: "replaced" },
  { label: "Denda Dibayar", value: "penalty_paid" },
];

const getMaxQuantity = (item: any) => {
  // Ambil quantity asli dari transaction detail
  return item.quantity || item.returned_quantity;
};

const saveChanges = async () => {
  try {
    saving.value = true;

    const updateData = {
      transaction_id: props.transactionId,
      return_details: localReturnDetails.value.map(item => ({
        equipment_id: item.equipment_id,
        returned_quantity: item.returned_quantity,
        condition: item.condition,
        damage_notes: item.damage_notes,
        replacement_status: item.replacement_status,
        penalty_amount: item.penalty_amount,
        penalty_notes: item.penalty_notes,
      }))
    };

    await $fetch('/api/transaction/return/update', {
      method: 'PUT',
      body: updateData,
    }).then((response: any) => {
      if (!response || response.statusCode !== 200) {
        throw new Error(response?.message || 'Gagal memperbarui detail pengembalian');
      }
  
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Detail pengembalian berhasil diperbarui",
        life: 3000,
      });
  
      emit('completed', response.data);
    });
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "Terjadi kesalahan saat menyimpan perubahan",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};
</script>
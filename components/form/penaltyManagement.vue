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
      <h3 class="font-semibold mb-2">Barang Hilang/Tidak Lengkap</h3>
      <div class="space-y-4">
        <div
          v-for="(item, index) in localLostItems"
          :key="index"
          class="border rounded p-4"
        >
          <h4 class="font-medium mb-2">{{ item.equipment.name }}</h4>
          <p class="text-sm text-gray-600 mb-2">{{ item.damage_notes }}</p>
          <p class="text-sm mb-3">
            <strong>Jumlah Hilang:</strong> 
            {{ (item.quantity || 0) - (item.returned_quantity || 0) }} unit
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 text-sm font-medium">Status Penggantian:</label>
              <Select
                v-model="item.replacement_status"
                :options="replacementStatusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih status"
                class="w-full"
                @change="onReplacementStatusChange(item)"
              />
            </div>

            <div v-if="item.replacement_status === 'penalty_paid'">
              <label class="block mb-2 text-sm font-medium">Jumlah Denda (Rp):</label>
              <InputNumber 
                v-model="item.penalty_amount"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                class="w-full"
              />
            </div>
          </div>

          <div v-if="item.replacement_status" class="mt-4">
            <label class="block mb-2 text-sm font-medium">Catatan:</label>
            <Textarea
              v-model="item.penalty_notes"
              rows="2"
              class="w-full"
              :placeholder="getPenaltyNotesPlaceholder(item.replacement_status)"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPenalty > 0" class="bg-yellow-50 border border-yellow-200 rounded p-4">
      <h4 class="font-semibold text-yellow-800 mb-2">Ringkasan Denda</h4>
      <p class="text-yellow-700">
        <strong>Total Denda: </strong>
        {{ formatCurrency(totalPenalty) }}
      </p>
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <Button
        label="Batal"
        severity="secondary"
        @click="$emit('cancel')"
      />
      <Button
        label="Simpan Pengaturan Denda"
        @click="savePenaltySettings"
        :loading="saving"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  transactionId: number;
  lostItems: any[];
  borrowerInfo: any;
}

const props = defineProps<Props>();
const emit = defineEmits(['cancel', 'completed']);
const toast = useToast();

const saving = ref(false);
const localLostItems = ref([...props.lostItems]);

const replacementStatusOptions = [
  { label: "Belum Ditentukan", value: null },
  { label: "Barang Ditemukan", value: "found" },
  { label: "Barang Diganti", value: "replaced" },
  { label: "Denda Dibayar", value: "penalty_paid" },
];

const totalPenalty = computed(() => {
  return localLostItems.value.reduce((total, item) => {
    return total + (item.penalty_amount || 0);
  }, 0);
});

const onReplacementStatusChange = (item: any) => {
  if (item.replacement_status === 'found' || item.replacement_status === 'replaced') {
    item.penalty_amount = 0;
  }
};

const getPenaltyNotesPlaceholder = (status: string) => {
  switch (status) {
    case 'found':
      return 'Jelaskan dimana dan kapan barang ditemukan';
    case 'replaced':
      return 'Jelaskan detail penggantian barang';
    case 'penalty_paid':
      return 'Catatan pembayaran denda';
    default:
      return 'Catatan tambahan';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};

const savePenaltySettings = async () => {
  try {
    saving.value = true;

    const penaltyData = {
      transaction_id: props.transactionId,
      penalty_items: localLostItems.value.map(item => ({
        equipment_id: item.equipment_id,
        replacement_status: item.replacement_status,
        penalty_amount: item.penalty_amount || 0,
        penalty_notes: item.penalty_notes,
      }))
    };

    const response = await $fetch('/api/transaction/returned/update', {
      method: 'PUT',
      body: penaltyData,
    });

    if (response.statusCode !== 200) {
      throw new Error(response.message || 'Gagal menyimpan pengaturan denda');
    }

    // Kirim notifikasi email jika ada denda
    if (totalPenalty.value > 0) {
      await $fetch('/api/notification/penalty-notice', {
        method: 'POST',
        body: {
          user_email: props.borrowerInfo.email,
          user_name: props.borrowerInfo.full_name,
          transaction_id: props.transactionId,
          penalty_amount: totalPenalty.value,
          penalty_items: localLostItems.value.filter(item => item.penalty_amount > 0),
        },
      });
    }

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Pengaturan denda berhasil disimpan",
      life: 3000,
    });

    emit('completed', response.data);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.data?.message || "Terjadi kesalahan saat menyimpan pengaturan denda",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};
</script>
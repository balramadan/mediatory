<template>
  <div class="mt-5 rounded shadow-xs">
    <DataTable
      ref="dt"
      show-gridlines
      striped-rows
      :value="currentTransaction"
      :loading="loading"
      :rows="6"
    >
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-5">
          <h2 class="font-bold font-poppins">Tabel Peminjaman Terkini</h2>
          <Button
            label="Export"
            icon="i-material-symbols:upload"
            severity="secondary"
          />
        </div>
      </template>

      <template #empty>
        <p class="text-base font-normal text-center">
          Tidak ada alat yang dipinjam
        </p>
      </template>

      <template #loading>
        <LoadingVideo src="/loading.webm" :width="256" :height="256" />
      </template>

      <Column field="transaction_id" header="ID">
        <template #body="{ data }">
          <p>#{{ data.transaction_id }}</p>
        </template>
      </Column>
      <Column field="user.full_name" header="Nama"></Column>
      <Column field="equipments" header="Alat" class="text-base font-normal min-w-15rem">
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
      <Column field="return_date" header="Tanggal Pengembalian">
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
      <Column field="return_status" header="Status Kembali">
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
const toast = useToast();
const trStore = useTransactionStore();

const dt = ref();
const loading = ref(false);
const currentTransaction = ref();

onMounted(() => {
  loading.value = true;
  trStore
    .getAllTransaction()
    .then(() => {
      currentTransaction.value = trStore.transaction.filter(
        (tr) => tr.status === "approved" && tr.return_status === "not_returned"
      );
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<style></style>

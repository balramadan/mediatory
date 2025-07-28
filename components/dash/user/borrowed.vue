<template>
  <div>
    <DataTable
      ref="dt"
      show-gridlines
      striped-rows
      paginator
      class="rounded"
      :value="borrowed"
      :loading="loading"
      :rows="6"
    >
      <template #header>
        <h2 class="font-bold text-base">Peminjaman Terkini</h2>
      </template>

      <template #empty>
        <p class="text-base font-normal text-center">
          Tidak ada alat yang dipinjam
        </p>
      </template>

      <template #loading>
        <LoadingVideo src="/loading.webm" :width="256" :height="256" />
      </template>

      <Column header="No" class="text-base font-normal w-16">
        <template #body="slotProps">
          <div>{{ slotProps.index + 1 }}</div>
        </template>
      </Column>
      <Column field="equipments" header="Alat" class="text-base font-normal">
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
      <Column
        field="return_date"
        header="Tanggal Pengembalian"
        class="text-base font-normal"
      >
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
      <Column header="Status" class="text-base font-normal">
        <template #body="slotProps">
          <div v-if="slotProps.data.status !== 'approved'" class="">
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
              v-if="slotProps.data.status === 'completed'"
              class="text-green-800 font-semibold"
              >Selesai</span
            >
          </div>
          <div v-else>
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
          </div>
        </template>
      </Column>
      <Column :exportable="false" class="w-10">
        <template #body="slotProps">
          <Button
            icon="i-material-symbols:folder-open"
            outlined
            rounded
            class="mb-2"
            @click.prevent="
              $router.push(`/transaction/${slotProps.data.transaction_id}`)
            "
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
const userStore = useUserStore();
const toast = useToast();

const loading = ref(false);
const dt = ref();
const borrowed = ref();

const trUser = async () => {
  loading.value = true;
  const userId = userStore.user.id;

  await $fetch(`/api/transaction?byUser=${userId}`, {
    method: "GET",
    credentials: "include",
  })
    .then((res: any) => {
      if (res.statusCode === 200) {
        borrowed.value = res.data.filter((item: any) => item.status !== "completed");
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: `Gagal mendapatkan data peminjaman`,
        life: 3000,
      });
    })
    .finally(() => (loading.value = false));
};

onMounted(async () => {
  await trUser();
});
</script>

<style></style>

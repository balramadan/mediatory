<template>
  <div>
    <Toolbar class="mb-5">
      <template #end>
        <Button
          label="Export"
          icon="i-material-symbols:upload"
          severity="secondary"
        />
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      v-model:filters="filters"
      show-gridlines
      striped-rows
      paginator
      :value="transactions"
      :loading="loading"
      :rows="6"
      :globalFilterFields="[
        'user.full_name',
        'equipments.equipment.name',
        'status',
      ]"
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

      <template #loading><ProgressSpinner /></template>

      <Column field="transaction_id" header="ID"></Column>
      <Column field="user.full_name" header="Nama"></Column>
      <Column field="project" header="Proyek"></Column>
      <Column field="purpose" header="Tujuan"></Column>
      <Column field="equipments" header="Peralatan" class="max-w-10rem">
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
      <Column field="status" header="Status">
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
      <Column field="borrow_date" header="Tanggal Pinjam">
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
      <Column field="return_date" header="Tanggal Kembali">
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
      <Column :exportable="false" class="w-10">
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
import { FilterMatchMode } from "@primevue/core/api";

const trStore = useTransactionStore();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const dt = ref();
const transactions = ref();
const loading = ref(false);

onMounted(async () => {
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
});

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

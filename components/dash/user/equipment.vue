<template>
  <div class="grid grid-cols-2 gap-5" sm="flex flex-row gap-5 w-full">
    <!-- Total Equipment -->
    <div
      class="bg-slate-100 w-full rounded shadow-xs px-5 py-2.5 flex flex-row items-center"
    >
      <div class="w-3/5">
        <h3 class="text-xs">Total Alat</h3>
        <p class="text-2xl font-bold">{{ stats._sum.quantity }}</p>
      </div>
      <Divider class="w-1/5" layout="vertical" />
      <div class="w-1/5 flex justify-center">
        <div class="i-solar:camera-bold w-10 h-10 text-black opacity-20" />
      </div>
    </div>

    <!-- Active Equipment (Sedang Dipinjam) -->
    <div
      class="bg-green-200 w-full rounded shadow-xs px-5 py-2.5 flex flex-row items-center"
    >
      <div class="w-3/5">
        <h3 class="text-xs">Di Pinjam/Di Booking </h3>
        <p class="text-2xl font-bold">{{ stats.active }}</p>
      </div>
      <Divider class="w-1/5" layout="vertical" />
      <div class="w-1/5 flex justify-center">
        <div
          class="i-solar:clock-circle-bold w-10 h-10 text-black opacity-20"
        />
      </div>
    </div>

    <!-- Overdue Equipment (Terlambat) -->
    <div
      class="bg-red-200 w-full rounded shadow-xs px-5 py-2.5 flex flex-row items-center"
    >
      <div class="w-3/5">
        <h3 class="text-xs">Terlambat</h3>
        <p class="text-2xl font-bold">{{ stats.overdue }}</p>
      </div>
      <Divider class="w-1/5" layout="vertical" />
      <div class="w-1/5 flex justify-center">
        <div
          class="i-solar:shield-warning-bold w-10 h-10 text-black opacity-20"
        />
      </div>
    </div>

    <!-- Maintenance Equipment -->
    <div
      class="bg-yellow-200 w-full rounded shadow-xs px-5 py-2.5 flex flex-row items-center"
    >
      <div class="w-3/5">
        <h3 class="text-xs">Pemeliharaan</h3>
        <p class="text-2xl font-bold">{{ stats.maintenance }}</p>
      </div>
      <Divider class="w-1/5" layout="vertical" />
      <div class="w-1/5 flex justify-center">
        <div
          class="i-solar:sledgehammer-bold w-10 h-10 text-black opacity-20"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const equipmentStatsStore = useEquipmentStatsStore();
const stats = computed(() => equipmentStatsStore.stats);
const loading = computed(() => equipmentStatsStore.loading);
const error = computed(() => equipmentStatsStore.error);

let refreshInterval: NodeJS.Timeout | null = null;

onMounted(async () => {
  await equipmentStatsStore.fetchStats();

  // Pastikan setInterval hanya berjalan di client-side
  if (process.client) {
    refreshInterval = setInterval(() => {
      equipmentStatsStore.fetchStats();
    }, 30000);
  }
});

onUnmounted(() => {
  // Bersihkan interval saat component di-unmount
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
});

// Tambahan: Bersihkan interval saat leaving page
onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
});
</script>

<style></style>

<template>
  <div>
    <div class="grid grid-cols-12 gap-5">
      <DashAdmEquipment class="col-span-7" />
      <div class="col-span-5 shadow-xs rounded bg-slate-100 px-2.5 py-2.5">
        <h2 class="font-bold">Trend Peminjaman</h2>
        <DashAdmTrend class="" />
      </div>
    </div>
    <DashAdmTableloan />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});
useSeoMeta({
  title: "Dashboard Admin | Mediatory",
  description: "Halaman dashboard admin",
  ogTitle: "Dashboard Admin | Mediatory",
});
</script>

<style></style>

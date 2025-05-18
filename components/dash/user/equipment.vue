<template>
  <div class="grid grid-cols-2 gap-5" sm="flex flex-row gap-5 w-full">
    <div class="bg-slate-100 w-full rounded shadow-xs px-5 py-2.5 flex flex-row items-center">
      <div class="w-3/5">
        <h3 class="text-xs">Alat</h3>
        <p class="text-2xl font-bold">50</p>
      </div>
      <Divider class="w-1/5" layout="vertical" />
      <div class="w-1/5 flex justify-center">
        <div class="i-solar:camera-bold w-10 h-10 text-black opacity-20" />
      </div>
    </div>
    <div class="bg-green-200 w-full rounded shadow-xs px-5 py-2.5 flex flex-row items-center">
      <div class="w-3/5">
        <h3 class="text-xs">Aktif</h3>
        <p class="text-2xl font-bold">22</p>
      </div>
      <Divider class="w-1/5" layout="vertical" />
      <div class="w-1/5 flex justify-center">
        <div class="i-solar:clock-circle-bold w-10 h-10 text-black opacity-20" />
      </div>
    </div>
    <div class="bg-red-200 w-full rounded shadow-xs px-5 py-2.5 flex flex-row items-center">
      <div class="w-3/5">
        <h3 class="text-xs">Terlambat</h3>
        <p class="text-2xl font-bold">7</p>
      </div>
      <Divider class="w-1/5" layout="vertical" />
      <div class="w-1/5 flex justify-center">
        <div class="i-solar:shield-warning-bold w-10 h-10 text-black opacity-20" />
      </div>
    </div>
    <div class="bg-yellow-200 w-full rounded shadow-xs px-5 py-2.5 flex flex-row items-center">
      <div class="w-3/5">
        <h3 class="text-xs">Perbaikan</h3>
        <p class="text-2xl font-bold">2</p>
      </div>
      <Divider class="w-1/5" layout="vertical" />
      <div class="w-1/5 flex justify-center">
        <div class="i-solar:sledgehammer-bold w-10 h-10 text-black opacity-20" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>

<style>

</style>
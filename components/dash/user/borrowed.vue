<template>
  <div>
    <DataTable>
      <template #header>
        <h2 class="font-bold text-base">Peminjaman Terkini</h2>
      </template>
      <template #empty>
        <p class="text-base font-normal text-center">Tidak ada alat yang dipinjam</p>
      </template>
      <template #loading> Tunggu sebentar... </template>
      <Column header="ID" class="text-base" />
      <Column header="Alat" class="text-base" />
      <Column header="Tanggal Pengembalian" class="text-base" />
      <Column header="Status" class="text-base" />
      <Column header="Aksi" class="text-base" />
    </DataTable>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>

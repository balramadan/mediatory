<template>
  <div class="mt-5 rounded shadow-xs">
    <DataTable>
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-5">
          <h2 class="font-bold">Tabel Peminjaman Terkini</h2>
          <Button icon="i-solar:export-bold" label="Export" type="button" severity="contrast" size="small" />
        </div>
      </template>
      <Column header="ID" />
      <Column header="User" />
      <Column header="Alat" />
      <Column header="Tanggal Pengembalian" />
      <Column header="Status" />
      <Column header="Aksi" />
    </DataTable>
  </div>
</template>

<script lang="ts" setup>

</script>

<style></style>

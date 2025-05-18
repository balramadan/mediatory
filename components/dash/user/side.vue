<template>
  <div
    class="hidden fixed top-0 left-0 mt-12.5 py-5 h-[calc(100vh-48px)] w-15 bg-white shadow-sm z-98"
    sm="flex flex-col items-center gap-10"
  >
    <NuxtLink v-for="(item, index) in sidenav" :key="index" :to="item.route">
      <div
        v-tooltip.right="item.label"
        :class="[
          item.icon,
          'w-24px h-24px p-2 text-black opacity-30 cursor-pointer transition-all ease-in-out duration-300',
        ]"
        hover="text-fuchsia-600 opacity-100"
      />
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
const sidenav = ref([
  {
    icon: "i-material-symbols:dashboard",
    label: "Dashboard",
    route: "/",
  },
  {
    icon: "i-solar:camera-bold",
    label: "List Alat",
    route: "/equipment",
  },
  {
    icon: "i-material-symbols:history",
    label: "Riwayat Peminjaman",
    route: "/history",
  },
]);
</script>

<style></style>

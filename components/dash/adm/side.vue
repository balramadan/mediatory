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
          'w-24px h-24px p-2 cursor-pointer transition-all ease-in-out duration-300',
          $route.path === item.route
            ? 'text-fuchsia-600 opacity-100'
            : 'text-black opacity-30',
        ]"
        hover="text-fuchsia-200 opacity-100"
      />
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
const adminStore = useAdminStore();

const sidenav = ref([
  {
    icon: "i-material-symbols:dashboard",
    label: "Dashboard",
    route: "/admin",
  },
  {
    icon: "i-material-symbols:event-list",
    label: "Transaksi",
    route: "/admin/transaction",
  },
  {
    icon: "i-solar:camera-bold",
    label: "Alat",
    route: "/admin/equipment",
  },
  {
    icon: "i-material-symbols:build",
    label: "Pemeliharaan",
    route: "/admin/maintenance",
  },
  {
    icon: "i-material-symbols:category",
    label: "Kategori",
    route: "/admin/category",
  },
  {
    icon: "i-material-symbols:group",
    label: "List User",
    route: "/admin/users",
  },
  ...(adminStore.admin.role === "superadmin"
    ? [
        {
          icon: "i-material-symbols:person-shield",
          label: "List Admin",
          route: "/admin/list",
        },
      ]
    : []),
]);
</script>

<style></style>

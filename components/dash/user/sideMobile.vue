<template>
  <Drawer
    v-model:visible="drawerVisible"
    position="left"
    :style="{ width: '280px' }"
    class="p-drawer-sm block"
    sm="hidden"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <NuxtImg src="/logowi.png" height="30" />
      </div>
    </template>

    <template #default>
      <div class="flex flex-col gap-2 p-4">
        <NuxtLink
          v-for="(item, index) in navigationItems"
          :key="index"
          :to="item.route"
          class="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 text-gray-700 hover:text-fuchsia-600 no-underline"
          :class="{
            'bg-fuchsia-50 text-fuchsia-600 border-l-4 border-fuchsia-600':
              $route.path === item.route,
          }"
          @click="closeDrawer"
        >
          <div :class="[item.icon, 'w-5 h-5']" />
          <span class="font-medium">{{ item.label }}</span>
        </NuxtLink>

        <Divider class="my-4" />

        <!-- User Info Section -->
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Avatar
            v-if="!userStore.user.imgUrl"
            :label="getInitials(userStore.user.name)"
            shape="circle"
            size="normal"
            style="background-color: #c74375; color: #fff"
          />
          <NuxtImg
            v-else
            :src="userStore.user.imgUrl"
            height="40"
            width="40"
            class="h-10 w-10 rounded-full object-cover object-center"
          />
          <div class="flex flex-col">
            <span class="font-semibold text-sm">{{
              userStore.user.name
            }}</span>
            <span class="text-xs text-gray-500">{{
              userStore.user.phone
            }}</span>
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script lang="ts" setup>
const userStore = useUserStore();
const route = useRoute();

const props = defineProps({
  toggleDrawer: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const emit = defineEmits(["update:toggleDrawer"]);

const drawerVisible = computed({
  get: () => props.toggleDrawer,
  set: (value) => emit("update:toggleDrawer", value),
});

const navigationItems = ref([
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

const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const closeDrawer = () => {
  drawerVisible.value = false;
};
</script>

<style scoped>
.p-drawer-sm {
  --p-drawer-width: 280px;
}

/* Override PrimeVue drawer styles for better mobile experience */
:deep(.p-drawer-content) {
  padding: 0;
}

:deep(.p-drawer-header) {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
</style>

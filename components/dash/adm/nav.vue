<template>
  <div
    class="fixed top-0 flex flex-row w-full px-5 py-2 bg-white shadow-sm justify-between items-center z-99"
  >
    <div id="logo" class="flex items-center gap-3">
      <!-- Mobile Menu Button -->
      <Button
        icon="i-material-symbols:menu"
        variant="text"
        rounded
        aria-label="Menu"
        severity="secondary"
        class="block sm:hidden"
        @click.prevent="openDrawer"
      />
      <NuxtImg src="/logowi.png" height="30" />
    </div>

    <div class="flex flex-row items-center sm:gap-2">
      <ClientOnly>
        <OverlayBadge
          :value="notifBadge"
          severity="contrast"
          class="mr-5"
          size="small"
        >
          <Button
            icon="i-material-symbols:notifications"
            variant="text"
            rounded
            aria-label="Notifikasi"
            severity="secondary"
            @click.prevent="toggleNotif"
          />
        </OverlayBadge>
      </ClientOnly>

      <!-- Desktop Profile Section -->
      <div class="hidden sm:flex sm:flex-row sm:items-center sm:gap-1">
        <Avatar
          v-if="!imgUrl"
          :label="getInitials(adminName)"
          shape="circle"
          size="normal"
          style="background-color: #c74375; color: #fff"
        />
        <NuxtImg
          v-else
          :src="imgUrl"
          height="36"
          width="36"
          class="h-9 w-9 rounded-full object-cover object-center"
        />
        <div class="flex flex-col gap-0.2 ml-2">
          <h2 class="text-xs text-fuchsia-600 font-bold">{{ adminName }}</h2>
          <p class="text-xs">{{ adminRole }}</p>
        </div>
        <div
          class="p-2 cursor-pointer rounded transition-all ease-in-out duration-300 hover:bg-fuchsia-100"
          @click.prevent="toggleMenu"
        >
          <div class="i-material-symbols:keyboard-arrow-down w-4 h-4" />
        </div>
      </div>

      <!-- Mobile Profile Avatar (simplified) -->
      <div class="sm:hidden">
        <Avatar
          v-if="!imgUrl"
          :label="getInitials(adminName)"
          shape="circle"
          size="normal"
          style="background-color: #c74375; color: #fff"
          @click.prevent="toggleMenu"
          class="cursor-pointer"
        />
        <NuxtImg
          v-else
          :src="imgUrl"
          height="36"
          width="36"
          class="h-9 w-9 rounded-full cursor-pointer object-center object-cover"
          @click.prevent="toggleMenu"
        />
      </div>
    </div>
  </div>

  <Menu id="overlay_menu" ref="pop" class="mt-2" :model="items" :popup="true">
    <template #item="{ item, props }">
      <NuxtLink
        v-if="item.route"
        v-slot="{ href, navigate }"
        class="flex flex-row items-center"
        :to="item.route"
        custom
      >
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <div :class="item.icon" />
          <span class="ml-1">{{ item.label }}</span>
        </a>
      </NuxtLink>
      <NuxtLink
        v-else
        v-ripple
        class="flex flex-row items-center"
        :to="item.url"
        :target="item.target"
        v-bind="props.action"
      >
        <div :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
      </NuxtLink>
    </template>
  </Menu>

  <Popover ref="popNotif" class="max-w-25rem max-h-20rem">
    <div
      v-for="(item, index) in notif"
      :class="[
        'flex flex-row items-center justify-between gap-5 px-2.5 py-2.5 cursor-pointer',
        item.is_read ? 'bg-gray-100' : 'hover:bg-slate-100',
      ]"
      :key="index"
    >
      <div
        class=""
        @click.prevent="clickNotif(item.notification_id, item.transaction_id)"
      >
        <p class="text-sm font-semibold">
          {{ item.title }}
        </p>
        <p class="text-xs">
          {{ item.message }}
        </p>
      </div>
      <div class="">
        <Button
          icon="i-material-symbols:more-vert"
          severity="secondary"
          variant="text"
          @click.prevent="toggleMore($event, item.notification_id)"
        />
      </div>
    </div>
  </Popover>

  <Menu ref="menuNotif" id="overlay_menu" :model="itemsNotif" :popup="true" />
</template>

<script setup lang="ts">
const toast = useToast();

const adminStore = useAdminStore();
const notifStore = useNotificationStore();

const emit = defineEmits(["toggle-drawer"]);

// Variabel informasi admin
const adminId = ref("");
const adminName = ref("");
const adminRole = ref("");
const imgUrl = ref("");

const notifId = ref();

const notif = computed(() => {
  return [...notifStore.notifications].sort((a, b) => {
    // Urutkan berdasarkan createdAt (dari terbaru ke terlama)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

const notifBadge = computed(() => {
  return notifStore.notifications.filter(
    (notification) => !notification.is_read
  ).length;
});

// Informasi akan diambil melalui store admin
onMounted(async () => {
  // Pinia
  adminId.value = adminStore.admin.id;
  adminName.value = adminStore.admin.name;
  adminRole.value = adminStore.admin.role;
  imgUrl.value = adminStore.admin.imgUrl;

  await notifStore.getNotification();
});

const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const pop = ref();
const popNotif = ref();
const items = ref([
  {
    label: "Profile",
    icon: "i-material-symbols:person",
    route: "/admin/profile",
  },
  {
    label: "Logout",
    icon: "i-material-symbols:logout",
    route: "/admin/logout",
  },
]);
const menuNotif = ref();
const itemsNotif = ref([
  {
    label: "Tandai Sudah Dibaca",
    icon: "i-material-symbols:mark-email-read",
    command: async () => {
      await markAsRead();
    },
  },
  {
    label: "Delete",
    icon: "i-material-symbols:delete",
    command: async () => {
      await deleteNotif();
    },
  },
]);

const toggleMenu = (event: any) => {
  pop.value.toggle(event);
};

const openDrawer = () => {
  emit("toggle-drawer");
};

const toggleNotif = (event: any) => {
  popNotif.value.toggle(event);
};

const toggleMore = (event: any, id: string) => {
  menuNotif.value.toggle(event);
  notifId.value = id;
};

const markAsRead = async () => {
  await notifStore.markAsRead(notifId.value).then(async () => {
    await notifStore.getNotification();
  });
};

const deleteNotif = async () => {
  await notifStore.deleteNotif(notifId.value).catch((err) => {
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Gagal menghapus notifikasi",
      life: 3000,
    });
  });
};

const clickNotif = async (id: string, tr_id: number) => {
  await notifStore.markAsRead(id).then(() => {
    navigateTo(`/admin/transaction/${tr_id}`);
  });
};
</script>

<style></style>

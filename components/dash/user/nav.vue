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
        @click.prevent="openDrawerUser"
      />
      <NuxtImg src="/logowi.png" height="30" />
    </div>

    <!-- Desktop Profile Section -->
    <div class="hidden sm:flex sm:flex-row sm:items-center sm:gap-1">
      <Avatar
        v-if="!imgUrl"
        :label="getInitials(userName)"
        shape="circle"
        size="normal"
        style="background-color: #c74375; color: #fff"
      />
      <NuxtImg
        v-else
        :src="imgUrl"
        height="36"
        width="36"
        class="h-9 w-9 rounded-full"
      />
      <div class="hidden" sm="flex flex-row items-center gap-1">
        <div sm="flex flex-col gap-0.2">
          <h2 class="text-xs text-fuchsia-600 font-bold">{{ userName }}</h2>
          <p class="text-xs">{{ userPhone }}</p>
        </div>
        <div
          class="p-2 cursor-pointer rounded transition-all ease-in-out duration-300 hover:bg-fuchsia-100"
          @click.prevent="toggle"
        >
          <div class="i-material-symbols:keyboard-arrow-down w-4 h-4" />
        </div>
      </div>
    </div>

    <div class="sm:hidden">
      <Avatar
        v-if="!imgUrl"
        :label="getInitials(userName)"
        shape="circle"
        size="normal"
        style="background-color: #c74375; color: #fff"
        @click.prevent="toggle"
        class="cursor-pointer"
      />
      <NuxtImg
        v-else
        :src="imgUrl"
        height="36"
        width="36"
        class="h-9 w-9 rounded-full cursor-pointer object-center object-cover"
        @click.prevent="toggle"
      />
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
</template>

<script lang="ts" setup>
const emit = defineEmits(['toggle-drawer']);

const userId = ref("");
const userName = ref("");
const userPhone = ref("");
const imgUrl = ref("");

onMounted(() => {
  // Panggil penyimpanan state user
  const store = useUserStore();

  userId.value = store.user.id;
  userName.value = store.user.name;
  userPhone.value = store.user.phone;
  imgUrl.value = store.user.imgUrl;
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
const items = ref([
  {
    label: "Profile",
    icon: "i-material-symbols:person",
    route: "/profile",
  },
  {
    label: "Logout",
    icon: "i-material-symbols:logout",
    route: "/logout",
  },
]);
const toggle = (event: any) => {
  pop.value.toggle(event);
};

const openDrawerUser = () => {
  emit('toggle-drawer')
  console.log("click burger")
}
</script>

<style></style>
<template>
  <div
    class="fixed top-0 flex flex-row w-full px-5 py-2 bg-white shadow-sm justify-between items-center z-99"
  >
    <div id="logo" class="">
      <NuxtImg src="/logowi.png" height="30" />
    </div>
    <div class="flex flex-row items-center gap-2">
      <div
        class="border border-solid border-black p-1 rounded-full"
        sm="rounded"
      >
        <div class="i-material-symbols:person text-black w-6 h-6 p-2" />
      </div>
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

<script setup>
const userId = ref("")
const userName = ref("")
const userPhone = ref("")

onMounted(() => {
  // Panggil penyimpanan state user
  const store = useUserStore()

  userId.value = store.user.id
  userName.value = store.user.name
  userPhone.value = store.user.phone
})

const pop = ref();
const items = ref([
  {
    label: "Profile",
    icon: "i-material-symbols:person",
    route: "/u/",
  },
  {
    label: "Logout",
    icon: "i-material-symbols:logout",
    route: "/logout",
  },
]);
const toggle = (event) => {
  pop.value.toggle(event);
};
</script>

<style></style>

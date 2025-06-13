<template>
  <div>
    <DashUserNav @toggle-drawer="handleToggleDrawer" />
    <DashUserSide />
    <DashUserSideMobile
      v-model:toggleDrawer="drawerUser"
      @update:toggleDrawer="handleDrawerUpdate"
    />
    <div
      class="mt-12.5 sm:ml-15 px-5 py-5 bg-slate-50 min-h-[calc(100vh-50px)]"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
const drawerUser = ref(false);

const handleToggleDrawer = () => {
  drawerUser.value = !drawerUser.value;
};

const handleDrawerUpdate = (value: boolean) => {
  drawerUser.value = value;
};
</script>

<style></style>

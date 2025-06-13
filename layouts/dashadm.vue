<template>
  <div>
    <DashAdmNav @toggle-drawer="handleToggleDrawer" />
    <DashAdmSide />
    <DashAdmSideMobile
      v-model:toggleDrawer="drawer"
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
const drawer = ref(false);

const handleToggleDrawer = () => {
  drawer.value = !drawer.value;
};

const handleDrawerUpdate = (value: boolean) => {
  drawer.value = value;
};
</script>

<style></style>

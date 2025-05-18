<template>
  <div class="flex justify-center items-center h-screen">
    <ProgressSpinner />
  </div>
</template>

<script lang="ts" setup>
onMounted(async () => {
  // Pinia
  const store = useAdminStore();
  const admin_id = store.admin.id;

  await $fetch("/api/admin/logout", {
    method: "POST",
    body: { admin_id },
  })
    .then(() => {
      store.logout();
      navigateTo("/admin/login");
    })
    .catch((error) => {
      console.error("Logout failed:", error);
    });
});

definePageMeta({
  layout: "default",
});
// SEO Meta
useSeoMeta({
  title: "Proses logout... | Mediadesk",
  description: "Logout untuk admin",
  ogTitle: "Proses logout... | Mediadesk",
});
</script>

<style></style>

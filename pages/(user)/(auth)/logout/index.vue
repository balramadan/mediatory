<template>
  <div class="flex justify-center items-center h-screen">
    <ProgressSpinner />
  </div>
</template>

<script lang="ts" setup>
onMounted(async () => {
  // Pinia
  const store = useUserStore();
  const user_id = store.user.id;

  await $fetch("/api/user/logout", {
    method: "POST",
    body: { user_id },
  })
    .then(() => {
      store.logout();
      navigateTo("/login");
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
  title: "Proses logout... | Mediawi",
  description: "Logout untuk user",
  ogTitle: "Proses logout... | Mediawi",
});
</script>

<style></style>

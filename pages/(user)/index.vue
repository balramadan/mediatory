<template>
  <div class="font-bold text-2xl">
    <div class="flex flex-row gap-1">
      <Greeting />
      <DashUserName />
    </div>
    <DashUserEquipment class="mt-5" />
    <DashUserBorrowed class="mt-5" />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'dashuser',
  middleware: ["auth"]
})

useSeoMeta({
  title: "Home | Mediadesk",
  description: "Welcome to my website",
  ogTitle: "Home | Mediadesk"
});
</script>

<style></style>

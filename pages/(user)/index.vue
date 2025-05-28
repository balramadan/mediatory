<template>
  <div class="">
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
  title: "Home | Mediawi",
  description: "Welcome to my website",
  ogTitle: "Home | Mediawi"
});
</script>

<style></style>

<template>
  <p class="text-base text-fuchsia-600 font-bold">{{ name }}</p>
</template>

<script lang="ts" setup>
const store = useUserStore()
const { user } = storeToRefs(store)
const { name } = user.value
</script>

<style>

</style>
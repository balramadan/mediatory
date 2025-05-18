<template>
  <h2 class="text-base font-normal">{{ greeting }},</h2>
</template>

<script lang="ts" setup>
defineOptions({
  name: "UserGreeting",
});

const greeting = ref("");

const updateGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    greeting.value = "Selamat Pagi";
  } else if (hour >= 12 && hour < 15) {
    greeting.value = "Selamat Siang";
  } else if (hour >= 15 && hour < 19) {
    greeting.value = "Selamat Sore";
  } else {
    greeting.value = "Selamat Malam";
  }
};

// Update greeting when component mounts
onMounted(() => {
  updateGreeting();

  // Optional: Update greeting every minute to keep it current
  setInterval(updateGreeting, 60000);
});
</script>

<style></style>

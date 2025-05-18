<template>
  <Form class="grid grid-cols-1 sm:grid-cols-12">
    <div class="sm:col-span-8 flex flex-col gap-5">
      <DataView :value="eq" dataKey="id">
        <template #list="slotProps">
          <div
            v-for="(item, index) in slotProps.items"
            :key="index"
            :class="{
              'border-t border-surface-200 dark:border-surface-700':
                index !== 0,
              'py-5 px-10 flex flex-row justify-between': true,
            }"
          >
          <div class="">
            <p class="font-bold text-xl">{{ item.name }}</p>
            <p>Kategori: {{ item. }}</p>
          </div>
            <div class="">
              
            </div>
          </div>
        </template>
      </DataView>
    </div>
    <div class="sm:col-span-4"></div>
  </Form>
</template>

<script lang="ts" setup>
const cart = useCartStore();
const eq = ref();

onMounted(() => {
  eq.value = cart.cart;
});
</script>

<style></style>

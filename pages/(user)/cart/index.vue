<template>
  <div>
    <div>
      <NuxtLink
        to="/equipment"
        class="flex flex-row gap-2 items-center w-30 px-5 py-5 transition-all ease-in-out duration-300"
        hover="text-fuchsia-600"
      >
        <div class="i-material-symbols:arrow-back" />
        <p>Kembali</p>
      </NuxtLink>
    </div>
    <h2 class="font-bold text-xl text-center px-5 py-5">Keranjang</h2>
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 py-5 px-10">
      <div class="sm:col-span-8 flex flex-col gap-5">
        <DataView :value="eq" dataKey="id" class="px-5 shadow">
          <template #list="slotProps">
            <div
              v-for="(item, index) in slotProps.items"
              :key="index"
              :class="{
                'border-t border-surface-200 dark:border-surface-700':
                  index !== 0,
                'py-5 px-10 flex flex-col sm:flex-row items-center gap-5': true,
              }"
            >
              <div class="min-w-16">
                <Image v-if="item.imgUrl" preview>
                  <template #image>
                    <NuxtImg
                      :src="item.imgUrl"
                      :alt="item.name"
                      class="w-16 h-16 object-cover rounded"
                    />
                  </template>
                  <template #preview="{ style, previewCallback }">
                    <NuxtImg
                      :src="item.imgUrl"
                      :alt="item.name"
                      :style="style"
                      @click="previewCallback"
                    />
                  </template>
                </Image>
                <span v-else class="text-gray-400">No image</span>
              </div>
              <div class="w-full flex flex-col md:flex-row justify-between items-center gap-2.5">
                <div class="w-full text-center sm:text-start">
                  <p class="font-bold text-xl">{{ item.name }}</p>
                  <p>Kategori: {{ item.category.category_name }}</p>
                </div>
                <div class="flex flex-row items-center gap-10">
                  <div class="flex flex-row items-center gap-5">
                    <Button
                      :disabled="item.quantity === 1 ? true : false"
                      icon="i-material-symbols:arrow-left"
                      aria-label="Kurangi"
                      severity="secondary"
                      @click.prevent="decreaseQuantity(item.equipment_id)"
                    />
                    <span>{{ item.quantity }}</span>
                    <Button
                      :disabled="
                        item.quantity === item.available_quantity ? true : false
                      "
                      icon="i-material-symbols:arrow-right"
                      aria-label="Tambah"
                      severity="secondary"
                      @click.prevent="increaseQuantity(item.equipment_id)"
                    />
                  </div>
                  <div>
                    <Button
                      icon="i-material-symbols:delete"
                      aria-label="Hapus"
                      severity="danger"
                      @click.prevent="removeFromCart(item.equipment_id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </DataView>
      </div>
      <div class="sm:col-span-4 py-5 shadow">
        <h2 class="mx-5 font-bold text-xl">Informasi</h2>
        <FormAddBorrow class="mx-5" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const cart = useCartStore();
const eq = ref();

onMounted(() => {
  eq.value = cart.cart;
});

const decreaseQuantity = (itemId: string) => {
  cart.decreaseQuantity(itemId);
  eq.value = cart.cart;
};

const increaseQuantity = (itemId: string) => {
  cart.increaseQuantity(itemId);
  eq.value = cart.cart;
};

const removeFromCart = (itemId: string) => {
  cart.removeFromCart(itemId);
  eq.value = cart.cart;
};

// Make cart items reactive
watch(
  () => cart.cart,
  (newCart) => {
    eq.value = newCart;
  },
  { deep: true }
);

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useSeoMeta({
  title: "Keranjang | Mediawi",
  description: "Daftar Peralatan yang bisa dipinjam",
  ogTitle: "Keranjang | Mediawi",
});
</script>

<style></style>

<template>
  <div>
    <Toolbar class="mb-5">
      <template #end>
        <Button
          icon="i-solar:refresh-bold"
          @click="refreshEquipment"
          variant="outlined"
          severity="secondary"
          class="mr-2.5"
        />
        <OverlayBadge :value="cart" severity="contrast" class="mr-5">
          <Button
            icon="i-material-symbols:shopping-cart"
            severity="secondary"
            @click.prevent="$router.push('/cart')"
          />
        </OverlayBadge>
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      show-gridlines
      striped-rows
      paginator
      data-key="equipment_id"
      :value="equipment"
      :loading="loading"
      :rows="6"
      :filters="filters"
      :globalFilterFields="[
        'name',
        'status',
        'category.category_name',
        'available_quantity',
      ]"
    >
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-5">
          <h2 class="font-bold">Daftar Alat</h2>
          <IconField>
            <InputIcon>
              <div class="i-material-symbols:search" />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Search..."
            />
          </IconField>
        </div>
      </template>
      <template #empty>
        <p class="text-center">Tidak ada alat yang tersedia</p>
      </template>

      <template #loading
        ><LoadingVideo src="/loading.webm" :width="256" :height="256"
      /></template>

      <Column field="imgUrl" class="w-32">
        <template #body="slotProps">
          <Image v-if="slotProps.data.imgUrl" preview>
            <template #image>
              <NuxtImg
                :src="slotProps.data.imgUrl"
                :alt="slotProps.data.name"
                class="w-16 h-16 object-cover rounded"
              />
            </template>
            <template #preview="{ style, previewCallback }">
              <NuxtImg
                :src="slotProps.data.imgUrl"
                :alt="slotProps.data.name"
                :style="style"
                @click="previewCallback"
              />
            </template>
          </Image>
          <span v-else class="text-gray-400">No image</span>
        </template>
      </Column>

      <Column field="name" header="Nama Alat" sortable class="text-base w-80" />

      <Column field="status" header="Status Alat" sortable class="text-base">
        <template #body="slotProps">
          <span
            v-if="slotProps.data.available_quantity === 0"
            class="text-red-500 font-semibold"
            >Tidak Tersedia</span
          >
          <span
            v-else-if="slotProps.data.status === 'available'"
            class="text-green-500 font-semibold"
            >Tersedia</span
          >
          <span
            v-else-if="slotProps.data.status === 'maintenance'"
            class="text-yellow-500 font-semibold"
            >Diperbaiki</span
          >
        </template>
      </Column>

      <Column
        field="available_quantity"
        header="Jumlah Tersedia"
        sortable
        class="text-base"
      />

      <Column
        field="category.category_name"
        header="Kategori"
        sortable
        class="text-base"
      />

      <Column :exportable="false" style="min-width: 5rem">
        <template #body="slotProps">
          <Button
            icon="i-material-symbols:add-shopping-cart"
            :disabled="slotProps.data.available_quantity === 0"
            outlined
            rounded
            @click.prevent="buttonAddToCart(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="addToCartDialog"
      header="Tambah ke Keranjang"
      class="w-full sm:w-[30rem]"
      :modal="true"
    >
      <Form class="mt-1">
        <div class="flex flex-col gap-5">
          <FloatLabel variant="on">
            <InputText
              id="name"
              v-model="addEquipment.name"
              disabled
              class="w-full"
            />
            <label for="name">Nama Alat</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputNumber
              id="available_quantity"
              v-model="addEquipment.available_quantity"
              disabled
              class="w-full"
            />
            <label for="available_quantity">Jumlah Tersedia</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputNumber
              id="available_quantity"
              v-model="borrowQuantity"
              class="w-full"
            />
            <label for="available_quantity">Jumlah yang ingin dipinjam</label>
          </FloatLabel>
        </div>
        <div class="py-6">
          <Button
            type="submit"
            severity="contrast"
            label="Tambah"
            @click.prevent="addToCart"
          />
        </div>
      </Form>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { FilterMatchMode } from "@primevue/core/api";

const toast = useToast();
const eqStore = useEquipmentStore();
const cartStore = useCartStore();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const loading = ref(false);
const dt = ref();
const equipment = ref();
const addEquipment = ref();
const borrowQuantity = ref(0);
const addToCartDialog = ref(false);
// const borrowDialog = ref(false);

const refreshEquipment = async () => {
  loading.value = true;
  await eqStore.getEquipment().finally(() => {
    loading.value = false;
  });
  equipment.value = eqStore.equipment;
};

const cart = computed(() => {
  return cartStore.cart.length;
});

onMounted(() => {
  refreshEquipment();
});

const buttonAddToCart = (eq: any) => {
  addEquipment.value = eq;
  addToCartDialog.value = true;
};

const addToCart = () => {
  if (borrowQuantity.value < 1) {
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Jumlah yang ingin dipinjam harus lebih dari 0",
      life: 3000,
    });
    return;
  } else if (borrowQuantity.value > addEquipment.value.available_quantity) {
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail:
        "Jumlah yang ingin dipinjam tidak boleh melebihi jumlah alat yang tersedia",
      life: 3000,
    });
    return;
  }

  cartStore.addToCart({
    equipment_id: addEquipment.value.equipment_id,
    name: addEquipment.value.name,
    quantity: borrowQuantity.value,
    available_quantity: addEquipment.value.available_quantity,
    status: addEquipment.value.status,
    category: addEquipment.value.category,
    imgUrl: addEquipment.value.imgUrl,
    createdAt: addEquipment.value.createdAt,
    transactions: addEquipment.value.transactions,
    maintenance: addEquipment.value.maintenance,
    equipment_returns: addEquipment.value.equipment_returns,
  });

  addToCartDialog.value = false;
};

definePageMeta({
  layout: "dashuser",
  middleware: ["auth"],
});

useSeoMeta({
  title: "Daftar Peralatan | Mediawi",
  description: "Daftar Peralatan yang bisa dipinjam",
  ogTitle: "Daftar Peralatan | Mediawi",
});
</script>

<style></style>

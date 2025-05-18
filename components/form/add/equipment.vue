<template>
  <Form class="flex flex-col gap-5 mt-1" @submit="addEquipment">
    <FloatLabel variant="on">
      <InputText
        id="equipment-name"
        v-model.lazy="equipmentName"
        type="text"
        class="w-full"
      />
      <label for="equipment-name">Nama Alat</label>
    </FloatLabel>
    <FloatLabel variant="on">
      <InputNumber
        id="equipment-quantity"
        v-model.lazy="equipmentQuantity"
        input-id="integeronly"
        class="w-full"
      />
      <label for="equipment-quantity">Jumlah</label>
    </FloatLabel>
    <FloatLabel variant="on">
      <Select
        id="equipment-category"
        v-model="selectCategory"
        :options="categoryOptions"
        optionLabel="label"
        class="w-full"
      />
      <label for="equipment-category">Kategori Alat</label>
    </FloatLabel>
    <Button
      type="submit"
      :unstyled="true"
      class="px-5 py-3 bg-fuchsia-600 text-white font-bold rounded cursor-pointer transition-all duration-300 ease-in-out"
      hover="bg-fuchsia-700"
      label="Tambah"
    />
  </Form>
</template>

<script lang="ts" setup>
const toast = useToast();

const emit = defineEmits(["equipment-added"]);

const catStore = useCategoryStore();
const categoryOptions = ref<{ label: string; value: string }[]>([]);
const equipmentName = ref("");
const equipmentQuantity = ref<number>();
const selectCategory = ref();

onMounted(async () => {
  await catStore.getCategory();

  categoryOptions.value = catStore.category.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));
});

const addEquipment = async () => {
  await $fetch("/api/equipment/add", {
    method: "POST",
    body: {
      name: equipmentName.value,
      quantity: equipmentQuantity.value,
      category_id: selectCategory.value?.value,
    },
    credentials: "include",
  }).then((res) => {
    if (res.statusCode === 200) {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Peralatan berhasil ditambahkan",
        life: 3000,
      });
      equipmentName.value = "";
      equipmentQuantity.value = 0;
      selectCategory.value = null;

      emit("equipment-added");
    } else {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `${res.message}`,
        life: 3000,
      });
    }
  });
};
</script>

<style></style>

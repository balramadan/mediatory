<template>
  <Form class="flex flex-col gap-5 mt-1" @submit="editEquipment">
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
      label="Ubah"
    />
  </Form>
</template>

<script lang="ts" setup>
const toast = useToast();
const equipmentStore = useEquipmentStore();
const catStore = useCategoryStore();

const props = defineProps({
  equipmentId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["edit-complete"]);

const equipmentName = ref("");
const equipmentQuantity = ref<number>();
const selectCategory = ref();
const categoryOptions = ref<{ label: string; value: string }[]>([]);

onMounted(async () => {
  await catStore.getCategory();

  categoryOptions.value = catStore.category.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  const equipment = equipmentStore.equipment.find(
    (eq) => eq.equipment_id === props.equipmentId
  );

  if (equipment) {
    equipmentName.value = equipment.name;
    equipmentQuantity.value = equipment.quantity;
    selectCategory.value = {
      label: equipment.category.category_name,
      value: equipment.category.category_id,
    };
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Alat tidak ditemukan",
      life: 3000,
    });
  }
});

const editEquipment = async () => {
  await $fetch("/api/equipment/edit", {
    method: "PUT",
    body: {
      id: props.equipmentId,
      name: equipmentName.value,
      quantity: equipmentQuantity.value,
      category_id: selectCategory.value?.value,
    },
    credentials: "include",
  })
    .then((res) => {
      if (res.statusCode === 200) {
        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Alat berhasil diedit",
          life: 3000,
        });
        emit("edit-complete");
      } else {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: res.message,
          life: 3000,
        });
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    });
};
</script>

<style></style>

<template>
  <Form class="flex flex-col gap-5 mt-1" @submit="editCategory">
    <FloatLabel variant="on">
      <InputText
        id="category-name"
        v-model.lazy="categoryName"
        type="text"
        class="w-full"
      />
      <label for="category-name">Nama Kategori</label>
    </FloatLabel>
    <FloatLabel variant="on">
      <InputText
        id="category-desc"
        v-model.lazy="categoryDesc"
        type="text"
        class="w-full"
      />
      <label for="category-desc">Deskripsi Kategori</label>
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
const categoryStore = useCategoryStore();

const props = defineProps({
  categoryId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["edit-complete"]);

const categoryName = ref("");
const categoryDesc = ref("");

onMounted(() => {
  const category = categoryStore.category.find(
    (cat) => cat.category_id === props.categoryId
  );

  if (category) {
    categoryName.value = category.name;
    categoryDesc.value = category.description;
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Kategori tidak ditemukan",
      life: 3000,
    });
  }
});

const editCategory = async () => {
  // Konversi categoryId ke number jika diperlukan
  const categoryIdNum =
    typeof props.categoryId === "string"
      ? parseInt(props.categoryId)
      : props.categoryId;

  await $fetch("/api/category/edit", {
    method: "PUT",
    body: {
      category_id: categoryIdNum,
      category_name: categoryName.value,
      description: categoryDesc.value,
    },
    credentials: "include",
  })
    .then((res) => {
      if (res.statusCode === 200) {
        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Kategori berhasi diperbarui",
          life: 3000,
        });

        emit("edit-complete");
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal memperbarui kategori",
        life: 3000,
      });
    });
};
</script>

<style></style>

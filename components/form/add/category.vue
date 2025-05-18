<template>
  <Form class="flex flex-col gap-5 mt-1" @submit="addCategory">
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
      label="Buat"
    />
  </Form>
</template>

<script lang="ts" setup>
const toast = useToast();
const emit = defineEmits(["category-added"])

const categoryName = ref("");
const categoryDesc = ref("");

const addCategory = async () => {
  await $fetch("/api/category/add", {
    method: "POST",
    body: {
      name: categoryName.value,
      description: categoryDesc.value,
    },
  }).then((res) => {
    if (res.statusCode === 200) {
      toast.add({
        severity: "success",
        summary: "Berhasil Menambahkan",
        detail: "Menambahkan kategori baru berhasil",
        life: 3000,
      });

      emit("category-added")
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: `${res.message}`,
        life: 3000,
      });
    }
  });
};
</script>

<style></style>

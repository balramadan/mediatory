<template>
  <div>
    <Toolbar class="mb-5">
      <template #start>
        <Button
          label="Buat"
          icon="i-material-symbols:add"
          severity="contrast"
          @click.prevent="openNew"
        />
        <Button
          label="Hapus"
          icon="i-material-symbols:delete"
          severity="danger"
          class="ml-2"
          outlined
          @click.prevent="confirmDeleteSelected"
        />
      </template>

      <template #end>
        <Button
          label="Export"
          icon="i-material-symbols:upload"
          severity="secondary"
          @click="exportCSV()"
        />
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      v-model:selection="selectedCategory"
      :value="category"
      :loading="loading"
      data-key="category_id"
      show-gridlines
      striped-rows
    >
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-5">
          <h2 class="font-bold font-poppins">Kategori</h2>
          <IconField>
            <InputIcon>
              <div class="i-material-symbols:search" />
            </InputIcon>
            <InputText placeholder="Search..." />
          </IconField>
        </div>
      </template>

      <template #empty>
        <p class="text-center">Belum ada kategori</p>
      </template>

      <template #loading>
        <LoadingVideo src="/loading.webm" :width="256" :height="256" />
      </template>

      <Column
        selection-mode="multiple"
        style="width: 3rem"
        :exportable="false"
      />
      <Column field="category_id" header="ID" class="text-base w-0.5" />
      <Column field="name" header="Nama Kategori" class="text-base" />
      <Column header="Jumlah Alat" class="text-base">
        <template #body="slotProps">
          {{ slotProps.data.equipment ? slotProps.data.equipment.length : 0 }}
        </template>
      </Column>
      <Column :exportable="false" style="max-width: 48px">
        <template #body="slotProps">
          <Button
            icon="i-material-symbols:edit"
            outlined
            rounded
            class="mb-2 lg:mb-0 lg:mr-2"
            @click.prevent="editCategory(slotProps.data)"
          />
          <Button
            icon="i-material-symbols:delete"
            outlined
            rounded
            severity="danger"
            @click.prevent="confirmDeleteCategory(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Dialog tambah kategori -->
    <Dialog
      v-model:visible="categoryDialog"
      modal
      header="Tambah Kategori"
      :style="{ width: '25rem' }"
    >
      <FormAddCategory
        @category-added="
          {
            refreshCategory();
            categoryDialog = false;
          }
        "
      />
    </Dialog>

    <!-- Dialog hapus yang dipilih -->
    <Dialog
      v-model:visible="deleteCategoriesDialog"
      :style="{ width: '25rem' }"
      header="Konfirmasi Hapus"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <div class="i-material-symbols:warning !text-3xl" />
        <span v-if="category">Anda yakin ingin menghapus kategori?</span>
      </div>
      <template #footer>
        <Button
          label="Tidak"
          icon="i-material-symbols:close"
          severity="danger"
          text
          @click="deleteCategoriesDialog = false"
        />
        <Button
          label="Ya"
          icon="i-material-symbols:check"
          text
          @click="deleteSelectedCategory"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="editCategoryDialog"
      header="Edit Kategori"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <FormEditCategory
        :category-id="categoryId"
        @edit-complete="
          {
            refreshCategory();
            editCategoryDialog = false;
          }
        "
      />
    </Dialog>

    <Dialog
      v-model:visible="deleteCategoryDialog"
      header="Konfirmasi Hapus"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <div class="flex items-center gap-4">
        <div class="i-material-symbols:warning !text-3xl" />
        <span v-if="category"
          >Anda yakin ingin menghapus kategori {{ categoryName }}?</span
        >
      </div>
      <template #footer>
        <Button
          label="Tidak"
          icon="i-material-symbols:close"
          severity="danger"
          text
          @click="deleteCategoryDialog = false"
        />
        <Button
          label="Ya"
          icon="i-material-symbols:check"
          text
          @click="deleteCategory"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";

const toast = useToast();

const dt = ref();
const loading = ref(false);
const category = ref();
const categoryId = ref();
const categoryName = ref("")
const filteredCategory = ref();
const searchTerm = ref("");
const categoryDialog = ref(false);
const selectedCategory = ref();
const deleteCategoriesDialog = ref(false);
const editCategoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const storeCategory = useCategoryStore();

// const filters = ref({
//   global: { value: null, matchMode: FilterMatchMode.CONTAINS }
// })

const refreshCategory = async () => {
  // Mengambil kategori yang ada di state
  await storeCategory.getCategory();
  category.value = storeCategory.category;
};

onMounted(async () => {
  loading.value = true
  refreshCategory().then(() => loading.value = false);
});

// Untuk memunculkan form tambah kategori
const openNew = () => {
  categoryDialog.value = true;
};

// Untuk memunculkan konfirmasi hapus kategori
const confirmDeleteSelected = () => {
  deleteCategoriesDialog.value = true;
};

// Fungsi untuk menghapus kategori yang dipilih
const deleteSelectedCategory = async () => {
  const selected = selectedCategory.value.map((cat: Category) => cat.category_id);

  await $fetch("/api/category/delete?multiple=true", {
    method: "DELETE",
    body: {
      id: selected,
    },
    credentials: "include",
  })
    .then((res) => {
      if (res.statusCode === 200) {
        storeCategory.getCategory();
        deleteCategoriesDialog.value = false;

        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Kategori berhasil dihapus",
          life: 3000,
        });
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `Gagal menghapus kategori`,
        life: 3000,
      });
    });
};

// Fungsi untuk ekspor data kategori ke CSV
const exportCSV = () => {
  dt.value.exportCSV();
};

const editCategory = (cat: Category) => {
  categoryId.value = cat.category_id;
  editCategoryDialog.value = true;
};

// Fungsi untuk mengonfirmasi penghapusan kategori
const confirmDeleteCategory = (cat: Category) => {
  deleteCategoryDialog.value = true;
  categoryId.value = cat.category_id;
  categoryName.value = cat.name
};

// Fungsi untuk menghapus kategori
const deleteCategory = async () => {
  const numberId = Number(categoryId.value);

  await $fetch("/api/category/delete?multiple=false", {
    method: "DELETE",
    body: {
      id: numberId,
    },
    credentials: "include",
  })
    .then((res) => {
      if (res.statusCode === 200) {
        refreshCategory();
        deleteCategoryDialog.value = false;

        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Kategori berhasil dihapus",
          life: 3000,
        });
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `Gagal menghapus kategori: ${err}`,
        life: 3000,
      });
    });
};

definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

useSeoMeta({
  title: "List Kategori | Mediawi",
  description: "List kategori alat",
  ogTitle: "List Kategori | Mediawi",
});
</script>

<style></style>

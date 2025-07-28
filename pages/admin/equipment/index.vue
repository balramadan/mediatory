<template>
  <div>
    <Toolbar class="mb-5">
      <template #start>
        <Button
          label="Tambah"
          icon="i-material-symbols:add"
          severity="contrast"
          class="mr-2"
          @click="openNew"
        />
        <Button
          label="Hapus"
          icon="i-material-symbols:delete"
          severity="danger"
          variant="outlined"
          @click="confirmDeleteSelected"
          :disabled="!selectedEquipment || !selectedEquipment.length"
        />
      </template>

      <template #end>
        <Button
          icon="i-solar:refresh-bold"
          @click="refreshEquipment"
          variant="outlined"
          severity="secondary"
          class="mr-2.5"
        />
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
      v-model:selection="selectedEquipment"
      show-gridlines
      striped-rows
      :filters="filters"
      :value="equipment"
      data-key="equipment_id"
      :paginator="true"
      :rows="6"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} equipment"
      :globalFilterFields="['name', 'status', 'category.category_name']"
      :loading="loading"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="font-bold font-poppins">Peralatan</h2>
          <IconField iconPosition="left">
            <InputIcon>
              <div class="i-material-symbols:search" />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
            />
          </IconField>
        </div>
      </template>

      <template #empty>
        <div class="text-center">
          <p>No equipment found.</p>
        </div>
      </template>

      <template #loading>
        <LoadingVideo src="/loading.webm" :width="256" :height="256" />
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

      <Column field="imgUrl" class="min-w-7rem">
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

      <Column field="name" header="Nama Alat" sortable class="min-w-15rem" />

      <Column field="available_quantity" header="Tersedia" sortable />

      <Column field="quantity" header="Jumlah Total" sortable />

      <Column
        field="category.category_name"
        header="Category"
        sortable
        class="min-w-15rem"
      />

      <Column field="status" header="Status Alat" class="text-base">
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

      <Column :exportable="false" style="min-width: 8rem">
        <template #body="slotProps">
          <Button
            icon="i-material-symbols:edit"
            outlined
            rounded
            class="mr-2"
            @click="editEquipment(slotProps.data)"
          />
          <Button
            icon="i-material-symbols:delete-forever"
            outlined
            rounded
            severity="danger"
            @click="confirmDeleteEquipment(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Add Equipment Dialog -->
    <Dialog
      v-model:visible="equipmentDialog"
      modal
      header="Tambah Peralatan"
      :style="{ width: '30rem' }"
      @hide="onAddDialogHide"
    >
      <FormAddEquipment
        ref="addEquipmentRef"
        @equipment-added="onEquipmentAdded"
      />
    </Dialog>

    <!-- Edit Equipment Dialog -->
    <Dialog
      v-model:visible="editEquipmentDialog"
      modal
      header="Edit Peralatan"
      :style="{ width: '30rem' }"
      @hide="onEditDialogHide"
    >
      <FormEditEquipment
        v-if="equipmentId"
        ref="editEquipmentRef"
        :equipment-id="equipmentId"
        @edit-complete="onEditComplete"
      />
    </Dialog>

    <!-- Delete Single Equipment Dialog -->
    <Dialog
      v-model:visible="deleteEquipmentDialog"
      modal
      header="Konfirmasi"
      :style="{ width: '25rem' }"
    >
      <div class="confirmation-content">
        <div class="i-material-symbols:warning mr-3" style="font-size: 2rem" />
        <span>Anda yakin ingin menghapus alat?</span>
      </div>
      <template #footer>
        <Button
          label="Tidak"
          icon="i-material-symbols:close"
          severity="danger"
          text
          @click="deleteEquipmentDialog = false"
        />
        <Button
          label="Ya"
          icon="i-material-symbols:check"
          text
          @click="deleteEquipment"
        />
      </template>
    </Dialog>

    <!-- Delete Multiple Equipment Dialog -->
    <Dialog
      v-model:visible="deleteEquipmentsDialog"
      modal
      header="Konfirmasi"
      :style="{ width: '25rem' }"
    >
      <div class="confirmation-content">
        <div class="i-material-symbols:warning mr-3" style="font-size: 2rem" />
        <span>Apakah yakin ingin menghapus alat-alat?</span>
      </div>
      <template #footer>
        <Button
          label="Tidak"
          icon="i-material-symbols:close"
          severity="danger"
          text
          @click="deleteEquipmentsDialog = false"
        />
        <Button
          label="Ya"
          icon="i-material-symbols:check"
          text
          @click="deleteSelectedEquipment"
        />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import type { Equipment } from "~/types/equipment";
import { FilterMatchMode } from "@primevue/core/api";

const toast = useToast();
const storeEquipment = useEquipmentStore();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const loading = ref(false);
const dt = ref();
const equipment = ref<Equipment[]>([]);
const equipmentId = ref<string>();
const equipmentDialog = ref(false);
const selectedEquipment = ref<Equipment[]>([]);
const deleteEquipmentsDialog = ref(false);
const editEquipmentDialog = ref(false);
const deleteEquipmentDialog = ref(false);

// Refs for form components
const addEquipmentRef = ref();
const editEquipmentRef = ref();

const refreshEquipment = async () => {
  loading.value = true;
  await storeEquipment.getEquipment().finally(() => {
    loading.value = false;
  });
  equipment.value = storeEquipment.equipment;
};

onMounted(async () => {
  loading.value = true;
  refreshEquipment().finally(() => (loading.value = false));
});

const getStatusSeverity = (status: string) => {
  switch (status) {
    case "available":
      return "success";
    case "not_available":
      return "danger";
    case "maintenance":
      return "warning";
    default:
      return "info";
  }
};

const openNew = () => {
  equipmentDialog.value = true;
};

const confirmDeleteSelected = () => {
  deleteEquipmentsDialog.value = true;
};

const deleteSelectedEquipment = async () => {
  if (!selectedEquipment.value || selectedEquipment.value.length === 0) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "No equipment selected",
      life: 3000,
    });
    return;
  }

  const selected = selectedEquipment.value.map(
    (equ: Equipment) => equ.equipment_id
  );

  try {
    const res = await $fetch<{
      statusCode: number;
      message: string;
      deletedCount?: number;
    }>("/api/equipment/delete?multiple=true", {
      method: "DELETE",
      body: { ids: selected }, // Use 'ids' instead of 'id'
      credentials: "include",
    });

    if (res.statusCode === 200) {
      toast.add({
        severity: "success",
        summary: "Successful",
        detail: `${
          res.deletedCount || selected.length
        } equipment(s) deleted successfully`,
        life: 3000,
      });
      await refreshEquipment();
      selectedEquipment.value = [];
    }
  } catch (err: any) {
    console.error("Delete equipment error:", err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: err.data?.message || err.message || "Failed to delete equipment",
      life: 3000,
    });
  } finally {
    deleteEquipmentsDialog.value = false;
  }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

const editEquipment = (eq: Equipment) => {
  equipmentId.value = eq.equipment_id;
  editEquipmentDialog.value = true;
};

const confirmDeleteEquipment = (eq: Equipment) => {
  deleteEquipmentDialog.value = true;
  equipmentId.value = eq.equipment_id;
};

const deleteEquipment = async () => {
  try {
    const res = await $fetch<{
      statusCode: number;
      message: string;
      deletedEquipment?: { id: string; name: string };
    }>("/api/equipment/delete?multiple=false", {
      method: "DELETE",
      body: { id: equipmentId.value },
      credentials: "include",
    });

    if (res.statusCode === 200) {
      toast.add({
        severity: "success",
        summary: "Successful",
        detail: `Equipment "${
          res.deletedEquipment?.name || "Unknown"
        }" deleted successfully`,
        life: 3000,
      });
      await refreshEquipment();
    }
  } catch (err: any) {
    console.error("Delete equipment error:", err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: err.data?.message || err.message || "Failed to delete equipment",
      life: 3000,
    });
  } finally {
    deleteEquipmentDialog.value = false;
  }
};

// Dialog event handlers
const onEquipmentAdded = async () => {
  await refreshEquipment();
  equipmentDialog.value = false;
};

const onEditComplete = async () => {
  await refreshEquipment();
  editEquipmentDialog.value = false;
};

const onAddDialogHide = async () => {
  // Cleanup any temporary files when dialog is closed
  if (addEquipmentRef.value) {
    await nextTick();
    await addEquipmentRef.value.cleanup();
    addEquipmentRef.value.resetForm();
  }
};

const onEditDialogHide = async () => {
  // Cleanup any temporary files when dialog is closed
  if (editEquipmentRef.value) {
    await nextTick();
    await editEquipmentRef.value.cleanup();
  }
};

definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

useSeoMeta({
  title: "Daftar Peralatan | Mediawi",
  description: "Halaman daftar alat admin",
  ogTitle: "Daftar Peralatan | Mediawi",
});
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
}
</style>

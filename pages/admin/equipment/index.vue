<template>
  <div>
    <Toolbar class="mb-5">
      <template #start>
        <Button
          label="Tambah"
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
          @click="exportCSV"
        />
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      v-model:selection="selectedEquipment"
      v-model:filters="filters"
      data-key="equipment_id"
      show-gridlines
      striped-rows
      paginator
      :value="equipment"
      :loading="loading"
      :rows="6"
      :globalFilterFields="['name', 'status', 'category.category_name']"
    >
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-5">
          <h2 class="font-bold font-poppins">Peralatan</h2>
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
        <p class="text-center">Belum ada peralatan</p>
      </template>

      <template #loading><ProgressSpinner /></template>

      <Column
        selection-mode="multiple"
        style="width: 3rem"
        :exportable="false"
      />
      <Column field="equipment_id" header="ID" class="text-base w-1" />
      <Column field="name" header="Nama Alat" class="text-base" />
      <Column
        field="available_quantity"
        header="Tersedia"
        class="text-base w-1"
      />
      <Column field="quantity" header="Jumlah Total" class="text-base w-1" />
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
      <Column
        field="category.category_name"
        header="Kategori"
        class="text-base"
      />
      <Column :exportable="false" class="w-10">
        <template #body="slotProps">
          <Button
            icon="i-material-symbols:edit"
            outlined
            rounded
            class="mb-2"
            @click.prevent="editEquipment(slotProps.data)"
          />
          <Button
            icon="i-material-symbols:delete"
            outlined
            rounded
            severity="danger"
            @click.prevent="confirmDeleteEquipment(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="equipmentDialog"
      modal
      header="Tambah Kategori"
      :style="{ width: '25rem' }"
    >
      <FormAddEquipment @equipment-added="refreshEquipment()" />
    </Dialog>

    <Dialog
      v-model:visible="deleteEquipmentsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <div class="i-material-symbols:warning !text-3xl" />
        <span v-if="equipment">Anda yakin ingin menghapus peralatan?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="i-material-symbols:close"
          severity="danger"
          text
          @click.prevent="deleteEquipmentsDialog = false"
        />
        <Button
          label="Yes"
          icon="i-material-symbols:check"
          text
          @click.prevent="deleteSelectedEquipment"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="editEquipmentDialog"
      header="Edit Alat"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <FormEditEquipment
        :equipment-id="equipmentId"
        @edit-complete="
          {
            refreshEquipment();
            editEquipmentDialog = false;
          }
        "
      />
    </Dialog>

    <Dialog
      v-model:visible="deleteEquipmentDialog"
      header="Konfirmasi Hapus"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <div class="flex items-center gap-4">
        <div class="i-material-symbols:warning !text-3xl" />
        <span v-if="equipment">Anda yakin ingin menghapus alat?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="i-material-symbols:close"
          severity="danger"
          text
          @click="deleteEquipmentDialog = false"
        />
        <Button
          label="Yes"
          icon="i-material-symbols:check"
          text
          @click="deleteEquipment"
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
const equipment = ref();
const equipmentId = ref();
const equipmentDialog = ref(false);
const selectedEquipment = ref();
const deleteEquipmentsDialog = ref(false);
const editEquipmentDialog = ref(false);
const deleteEquipmentDialog = ref(false);

const refreshEquipment = async () => {
  await storeEquipment.getEquipment();
  equipment.value = storeEquipment.equipment;
};

onMounted(async () => {
  loading.value = true;
  refreshEquipment().finally(() => (loading.value = false));
});

const openNew = () => {
  equipmentDialog.value = true;
};

const confirmDeleteSelected = () => {
  deleteEquipmentsDialog.value = true;
};

const deleteSelectedEquipment = async () => {
  if (!selectedEquipment.value || selectedEquipment.value.length === 0) {
    toast.add({
      severity: "error",
      summary: "Peralatan tidak dipilih",
      detail: "Tidak bisa menghapus karena tidak ada peralatan yang dipilih",
      life: 3000,
    });

    return;
  }

  const selected = selectedEquipment.value.map(
    (equ: Equipment) => equ.equipment_id
  );

  await $fetch<{ statusCode: number; message: string }>(
    "/api/equipment/delete?multiple=true",
    {
      method: "DELETE",
      body: {
        id: selected,
      },
      credentials: "include",
    }
  )
    .then((res) => {
      if (res.statusCode === 200) {
        refreshEquipment();
        deleteEquipmentsDialog.value = false;

        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Peralatan berhasil dihapus",
          life: 3000,
        });
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `Gagal menghapus peralatan: ${err}`,
        life: 3000,
      });
    });
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
  console.log(equipmentId.value);

  await $fetch("/api/equipment/delete?multiple=false", {
    method: "DELETE",
    body: {
      id: equipmentId.value,
    },
    credentials: "include",
  })
    .then((res) => {
      if (res.statusCode === 200) {
        refreshEquipment();
        deleteEquipmentDialog.value = false;

        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Peralatan berhasil dihapus",
          life: 3000,
        });
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `Gagal menghapus peralatan: ${err}`,
        life: 3000,
      });
    });
};

definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

useSeoMeta({
  title: "Daftar Peralatan | Mediatory",
  description: "Halaman daftar alat admin",
  ogTitle: "Daftar Peralatan | Mediatory",
});
</script>

<style></style>

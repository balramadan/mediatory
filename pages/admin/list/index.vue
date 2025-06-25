<template>
  <div>
    <Toolbar class="mb-5">
      <template #start>
        <div class="flex flex-row gap-5">
          <Button
            icon="i-material-symbols:person-add"
            label="Tambah Admin"
            severity="contrast"
            @click="showAddDialog = true"
          />
          <Button
            icon="i-material-symbols:delete"
            label="Hapus Terpilih"
            severity="danger"
            variant="outlined"
            :disabled="!selectedAdmins || selectedAdmins.length === 0"
            @click="confirmDeleteSelected"
          />
        </div>
      </template>
      <template #end>
        <Button
          icon="i-material-symbols:refresh"
          label="Refresh"
          severity="secondary"
          @click="refreshData"
        />
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      v-model:filters="filters"
      v-model:selection="selectedAdmins"
      :value="admins"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      showGridlines
      stripedRows
      :loading="loading"
      filterDisplay="menu"
      :globalFilterFields="['full_name', 'email', 'role']"
      class="shadow-sm"
      dataKey="admin_id"
      selectionMode="multiple"
    >
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-5">
          <h2 class="font-bold font-poppins">Manajemen Admin</h2>
          <div class="">
            <IconField>
              <InputIcon>
                <div class="i-material-symbols:search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Cari admin..."
                class="w-64"
              />
            </IconField>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center justify-center text-center py-8">
          <div
            class="i-material-symbols:admin-panel-settings text-6xl text-gray-300 mb-4"
          />
          <p class="text-lg text-gray-500">Belum ada data admin</p>
        </div>
      </template>

      <template #loading>
        <LoadingVideo src="/loading.webm" :width="256" :height="256" />
      </template>

      <!-- Column Selection -->
      <Column
        selectionMode="multiple"
        headerStyle="width: 3rem"
        :exportable="false"
      ></Column>

      <!-- Column ID -->
      <Column field="admin_id" header="ID" sortable style="width: 80px">
        <template #body="slotProps">
          <span class="text-xs bg-blue-100 px-2 py-1 rounded font-mono">
            {{ slotProps.data.admin_id.substring(0, 8) }}...
          </span>
        </template>
      </Column>

      <!-- Column Avatar & Nama -->
      <Column
        field="full_name"
        header="Administrator"
        sortable
        style="min-width: 200px"
      >
        <template #body="slotProps">
          <div class="flex items-center gap-3">
            <div>
              <Avatar
                v-if="!slotProps.data.imgUrl"
                :label="getInitials(slotProps.data.full_name)"
                shape="circle"
                size="normal"
                style="background-color: #c74375; color: #fff"
              />
              <NuxtImg
                v-else
                :src="slotProps.data.imgUrl"
                width="32"
                height="32"
                class="rounded-full w-8 h-8"
              />
            </div>
            <div>
              <div class="font-semibold">{{ slotProps.data.full_name }}</div>
              <div class="text-sm text-gray-500">
                {{ slotProps.data.email }}
              </div>
            </div>
          </div>
        </template>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Cari nama"
          />
        </template>
      </Column>

      <!-- Column Role -->
      <Column field="role" header="Role" sortable style="width: 120px">
        <template #body="slotProps">
          <Tag
            :value="formatRole(slotProps.data.role)"
            :severity="getRoleSeverity(slotProps.data.role)"
          />
        </template>
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Role"
            class="p-column-filter"
            showClear
          />
        </template>
      </Column>

      <!-- Column Last Login -->
      <Column
        field="last_login"
        header="Login Terakhir"
        sortable
        style="width: 150px"
      >
        <template #body="slotProps">
          <div class="text-sm">
            {{ formatDate(slotProps.data.last_login) }}
          </div>
        </template>
      </Column>

      <!-- Column Status -->
      <Column header="Status" style="width: 100px">
        <template #body="slotProps">
          <Tag
            :value="getAdminStatus(slotProps.data)"
            :severity="getStatusSeverity(slotProps.data)"
          />
        </template>
      </Column>

      <!-- Column Created At -->
      <Column
        field="createdAt"
        header="Bergabung"
        sortable
        style="width: 120px"
      >
        <template #body="slotProps">
          <div class="text-sm">
            {{ formatDate(slotProps.data.createdAt) }}
          </div>
        </template>
      </Column>

      <!-- Column Actions -->
      <Column header="Aksi" style="width: 120px">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="i-material-symbols:visibility"
              severity="info"
              variant="text"
              size="small"
              v-tooltip.top="'Lihat Detail'"
              @click="viewAdmin(slotProps.data)"
            />
            <Button
              icon="i-material-symbols:edit"
              severity="warning"
              variant="text"
              size="small"
              v-tooltip.top="'Edit Admin'"
              @click="editAdmin(slotProps.data)"
            />
            <Button
              icon="i-material-symbols:delete"
              severity="danger"
              variant="text"
              size="small"
              v-tooltip.top="'Hapus Admin'"
              @click="confirmDelete(slotProps.data)"
              :disabled="slotProps.data.role === 'superadmin'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dialog Detail Admin -->
    <Dialog
      v-model:visible="showDetailDialog"
      modal
      header="Detail Administrator"
      :style="{ width: '450px' }"
    >
      <div v-if="selectedAdmin" class="space-y-4">
        <div class="text-center mb-6">
          <Avatar
            :label="getInitials(selectedAdmin.full_name)"
            size="xlarge"
            shape="circle"
            style="background-color: #3b82f6; color: white"
            class="mb-3"
          />
          <h3 class="text-xl font-semibold">{{ selectedAdmin.full_name }}</h3>
          <p class="text-gray-500">{{ selectedAdmin.email }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">Admin ID</label>
            <p class="font-mono text-xs">{{ selectedAdmin.admin_id }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Role</label>
            <div class="mt-1">
              <Tag
                :value="formatRole(selectedAdmin.role)"
                :severity="getRoleSeverity(selectedAdmin.role)"
              />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600"
              >Login Terakhir</label
            >
            <p>{{ formatDate(selectedAdmin.last_login) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Bergabung</label>
            <p>{{ formatDate(selectedAdmin.createdAt) }}</p>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600">Status</label>
          <div class="mt-1">
            <Tag
              :value="getAdminStatus(selectedAdmin)"
              :severity="getStatusSeverity(selectedAdmin)"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Tutup"
          severity="secondary"
          @click="showDetailDialog = false"
        />
        <Button
          label="Edit"
          icon="i-material-symbols:edit"
          @click="editAdmin(selectedAdmin)"
        />
      </template>
    </Dialog>

    <!-- Dialog Add Admin -->
    <Dialog
      v-model:visible="showAddDialog"
      modal
      header="Tambah Administrator"
      :style="{ width: '500px' }"
    >
      <form @submit.prevent="addAdmin" class="space-y-5">
        <div>
          <FloatLabel variant="on" class="mt-2.5">
            <InputText
              id="add-name"
              v-model="addForm.full_name"
              class="w-full"
              :invalid="!!addErrors.full_name"
            />
            <label for="add-name">Nama Lengkap</label>
          </FloatLabel>
          <small v-if="addErrors.full_name" class="text-red-500">
            {{ addErrors.full_name }}
          </small>
        </div>

        <div>
          <FloatLabel variant="on">
            <InputText
              id="add-email"
              v-model="addForm.email"
              type="email"
              class="w-full"
              :invalid="!!addErrors.email"
            />
            <label for="add-email">Email</label>
          </FloatLabel>
          <small v-if="addErrors.email" class="text-red-500">
            {{ addErrors.email }}
          </small>
        </div>

        <div>
          <FloatLabel variant="on">
            <Password
              id="add-password"
              v-model="addForm.password"
              class="w-full"
              inputClass="w-full"
              :invalid="!!addErrors.password"
              toggleMask
            />
            <label for="add-password">Password</label>
          </FloatLabel>
          <small v-if="addErrors.password" class="text-red-500">
            {{ addErrors.password }}
          </small>
        </div>

        <div>
          <FloatLabel variant="on">
            <Select
              id="add-role"
              v-model="addForm.role"
              :options="[{ label: 'Inventory', value: 'inventory' }]"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              :invalid="!!addErrors.role"
              disabled
            />
            <label for="add-role">Role</label>
          </FloatLabel>
          <small v-if="addErrors.role" class="text-red-500">
            {{ addErrors.role }}
          </small>
        </div>
      </form>

      <template #footer>
        <Button
          label="Batal"
          severity="secondary"
          @click="showAddDialog = false"
        />
        <Button
          label="Simpan"
          icon="i-material-symbols:save"
          :loading="adding"
          @click="addAdmin"
        />
      </template>
    </Dialog>

    <!-- Dialog Edit Admin -->
    <Dialog
      v-model:visible="showEditDialog"
      modal
      header="Edit Administrator"
      :style="{ width: '500px' }"
    >
      <form @submit.prevent="updateAdmin" class="space-y-8">
        <div>
          <FloatLabel>
            <InputText
              id="edit-name"
              v-model="editForm.full_name"
              class="w-full"
              :invalid="!!editErrors.full_name"
            />
            <label for="edit-name">Nama Lengkap</label>
          </FloatLabel>
          <small v-if="editErrors.full_name" class="text-red-500">
            {{ editErrors.full_name }}
          </small>
        </div>

        <div>
          <FloatLabel>
            <InputText
              id="edit-email"
              v-model="editForm.email"
              type="email"
              class="w-full"
              :invalid="!!editErrors.email"
            />
            <label for="edit-email">Email</label>
          </FloatLabel>
          <small v-if="editErrors.email" class="text-red-500">
            {{ editErrors.email }}
          </small>
        </div>

        <div>
          <FloatLabel>
            <Select
              id="edit-role"
              v-model="editForm.role"
              :options="roleOptions.filter((r) => r.value !== null)"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              :invalid="!!editErrors.role"
              disabled
            />
            <label for="edit-role">Role</label>
          </FloatLabel>
          <small v-if="editErrors.role" class="text-red-500">
            {{ editErrors.role }}
          </small>
        </div>

        <div>
          <FloatLabel>
            <Password
              id="edit-password"
              v-model="editForm.password"
              class="w-full"
              inputClass="w-full"
              toggleMask
            />
            <label for="edit-password">Password Baru (Opsional)</label>
          </FloatLabel>
        </div>
      </form>

      <template #footer>
        <Button
          label="Batal"
          severity="secondary"
          @click="showEditDialog = false"
        />
        <Button
          label="Simpan"
          icon="i-material-symbols:save"
          :loading="updating"
          @click="updateAdmin"
        />
      </template>
    </Dialog>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog />

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script lang="ts" setup>
import { FilterMatchMode } from "@primevue/core/api";

// Meta & Layout - hanya superadmin yang bisa akses
definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

// Composables
const toast = useToast();
const confirm = useConfirm();

// State
const admins = ref();
const selectedAdmins = ref();
const loading = ref(false);
const adding = ref(false);
const updating = ref(false);
const showDetailDialog = ref(false);
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const selectedAdmin = ref();

// Form data
const addForm = ref({
  full_name: "",
  email: "",
  password: "",
  role: "inventory",
});

const editForm = ref({
  full_name: "",
  email: "",
  role: "",
  password: "",
});

const addErrors = ref<Record<string, string>>({});
const editErrors = ref<Record<string, string>>({});

// Options
const roleOptions = ref([
  { label: "Semua Role", value: null },
  { label: "Super Admin", value: "superadmin" },
  { label: "Inventory", value: "inventory" },
]);

// Filters
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  full_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  role: { value: null, matchMode: FilterMatchMode.EQUALS },
});

// Methods
const fetchAdmins = async () => {
  try {
    loading.value = true;
    const { data } = await $fetch("/api/admin");
    admins.value = data || [];
  } catch (error) {
    console.error("Error fetching admins:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal memuat data admin",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  fetchAdmins();
};

const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (dateString: any) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRole = (role: string) => {
  const roleMap: Record<string, string> = {
    superadmin: "Super Admin",
    inventory: "Inventory",
  };
  return roleMap[role] || role;
};

const getRoleSeverity = (role: string) => {
  const severityMap: Record<string, string> = {
    superadmin: "danger",
    inventory: "info",
  };
  return severityMap[role] || "secondary";
};

const getAdminStatus = (admin: any) => {
  if (!admin.last_login) return "Belum Login";

  const lastLogin = new Date(admin.last_login);
  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) return "Online Hari Ini";
  if (daysDiff <= 7) return "Aktif";
  if (daysDiff <= 30) return "Tidak Aktif";
  return "Inactive";
};

const getStatusSeverity = (admin: string) => {
  const status = getAdminStatus(admin);
  const severityMap = {
    "Online Hari Ini": "success",
    Aktif: "info",
    "Tidak Aktif": "warning",
    Inactive: "danger",
    "Belum Login": "secondary",
  };
  return severityMap[status] || "secondary";
};

const viewAdmin = (admin: any) => {
  selectedAdmin.value = admin;
  showDetailDialog.value = true;
};

const editAdmin = (admin: any) => {
  selectedAdmin.value = admin;
  editForm.value = {
    full_name: admin.full_name || "",
    email: admin.email || "",
    role: admin.role || "inventory",
    password: "",
  };
  editErrors.value = {};
  showEditDialog.value = true;
  showDetailDialog.value = false;
};

const addAdmin = async () => {
  try {
    adding.value = true;
    addErrors.value = {};

    // Validasi
    if (!addForm.value.full_name.trim()) {
      addErrors.value.full_name = "Nama lengkap wajib diisi";
      return;
    }
    if (!addForm.value.email.trim()) {
      addErrors.value.email = "Email wajib diisi";
      return;
    }
    if (!addForm.value.password.trim()) {
      addErrors.value.password = "Password wajib diisi";
      return;
    }
    if (addForm.value.password.length < 6) {
      addErrors.value.password = "Password minimal 6 karakter";
      return;
    }

    // Panggil API register admin
    await $fetch("/api/admin/register", {
      method: "POST",
      body: addForm.value,
    })
      .then(async () => {
        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Admin berhasil ditambahkan",
          life: 3000,
        });

        showAddDialog.value = false;
        addForm.value = {
          full_name: "",
          email: "",
          password: "",
          role: "inventory",
        };
        await fetchAdmins();
      })
      .catch((error) => {
        toast.add({
          severity: "error",
          summary: "Gagal",
          detail: error.data?.message,
          life: 3000,
        });
      });
  } catch (error) {
    console.error("Error adding admin:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal menambahkan admin",
      life: 3000,
    });
  } finally {
    adding.value = false;
  }
};

const updateAdmin = async () => {
  try {
    updating.value = true;
    editErrors.value = {};

    // Validasi
    if (!editForm.value.full_name.trim()) {
      editErrors.value.full_name = "Nama lengkap wajib diisi";
      return;
    }
    if (!editForm.value.email.trim()) {
      editErrors.value.email = "Email wajib diisi";
      return;
    }

    await $fetch(`/api/admin/edit/${selectedAdmin.value.admin_id}`, {
      method: "PUT",
      body: editForm.value,
    });

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Data admin berhasil diperbarui",
      life: 3000,
    });

    showEditDialog.value = false;
    await fetchAdmins();
  } catch (error) {
    console.error("Error updating admin:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal memperbarui data admin",
      life: 3000,
    });
  } finally {
    updating.value = false;
  }
};

const confirmDelete = (admin: any) => {
  if (admin.role === "superadmin") {
    toast.add({
      severity: "warn",
      summary: "Tidak Diizinkan",
      detail: "Super Admin tidak dapat dihapus",
      life: 3000,
    });
    return;
  }

  confirm.require({
    message: `Apakah Anda yakin ingin menghapus admin "${admin.full_name}"?`,
    header: "Konfirmasi Hapus",
    icon: "i-material-symbols:warning",
    rejectProps: {
      label: "Batal",
      severity: "secondary",
      variant: "outlined",
    },
    acceptProps: {
      label: "Hapus",
      severity: "danger",
    },
    accept: () => {
      deleteAdmin(admin);
    },
  });
};

const confirmDeleteSelected = () => {
  const superAdmins = selectedAdmins.value.filter(
    (admin: any) => admin.role === "superadmin"
  );
  if (superAdmins.length > 0) {
    toast.add({
      severity: "warn",
      summary: "Tidak Diizinkan",
      detail: "Super Admin tidak dapat dihapus",
      life: 3000,
    });
    return;
  }

  confirm.require({
    message: `Apakah Anda yakin ingin menghapus ${selectedAdmins.value.length} admin yang dipilih?`,
    header: "Konfirmasi Hapus",
    icon: "i-material-symbols:warning",
    rejectProps: {
      label: "Batal",
      severity: "secondary",
      variant: "outlined",
    },
    acceptProps: {
      label: "Hapus",
      severity: "danger",
    },
    accept: () => {
      deleteSelectedAdmins();
    },
  });
};

const deleteAdmin = async (admin: any) => {
  try {
    // Panggil API delete admin (perlu dibuat)
    await $fetch(`/api/admin/delete/${admin.admin_id}`, {
      method: "DELETE",
    });

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Admin berhasil dihapus",
      life: 3000,
    });

    await fetchAdmins();
  } catch (error) {
    console.error("Error deleting admin:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal menghapus admin",
      life: 3000,
    });
  }
};

const deleteSelectedAdmins = async () => {
  try {
    // Filter out super admins
    const adminIds = selectedAdmins.value
      .filter((admin: any) => admin.role !== "superadmin")
      .map((admin: any) => admin.admin_id);

    // Panggil API delete multiple admins (perlu dibuat)
    await $fetch("/api/admin/delete/bulk", {
      method: "DELETE",
      body: { ids: adminIds },
    });

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: `${adminIds.length} admin berhasil dihapus`,
      life: 3000,
    });

    selectedAdmins.value = [];
    await fetchAdmins();
  } catch (error) {
    console.error("Error deleting admins:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal menghapus admin",
      life: 3000,
    });
  }
};

// Lifecycle
onMounted(() => {
  fetchAdmins();
});

// SEO
useSeoMeta({
  title: "Manajemen Admin | Mediawi",
  description: "Halaman manajemen administrator",
  ogTitle: "Manajemen Admin | Mediawi",
});
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>

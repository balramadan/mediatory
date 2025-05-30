<template>
  <div>
    <Toolbar class="mb-5">
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
      :value="users"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      showGridlines
      stripedRows
      :loading="loading"
      filterDisplay="menu"
      :globalFilterFields="['full_name', 'email', 'phone']"
    >
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-5">
          <h2 class="font-bold font-poppins">Manajemen User</h2>
          <div class="flex flex-row items-center gap-3">
            <IconField>
              <InputIcon>
                <div class="i-material-symbols:search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Cari user..."
                class="w-64"
              />
            </IconField>
            
          </div>
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col justify-center items-center text-center py-8">
          <div class="i-material-symbols:group text-6xl text-gray-300 mb-4" />
          <p class="text-lg text-gray-500">Belum ada data user</p>
        </div>
      </template>

      <template #loading>
        <div class="text-center py-8">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
          <p class="mt-4 text-gray-500">Memuat data...</p>
        </div>
      </template>

      <!-- Column ID -->
      <Column field="user_id" header="ID" sortable style="width: 80px">
        <template #body="slotProps">
          <span class="text-xs bg-gray-100 px-2 py-1 rounded">
            #{{ slotProps.data.user_id }}
          </span>
        </template>
      </Column>

      <!-- Column Avatar & Nama -->
      <Column field="full_name" header="User" sortable style="min-width: 200px">
        <template #body="slotProps">
          <div class="flex items-center gap-3">
            <Avatar
              :label="getInitials(slotProps.data.full_name)"
              shape="circle"
              size="normal"
              style="background-color: #C74375; color: #fff"
            />
            <div>
              <div class="font-semibold">{{ slotProps.data.full_name }}</div>
              <div class="text-sm text-gray-500">
                {{ slotProps.data.email }}
              </div>
            </div>
          </div>
        </template>
      </Column>

      <!-- Column Phone -->
      <Column
        field="phone_number"
        header="No. Telepon"
        sortable
        style="width: 140px"
      >
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <div class="i-material-symbols:phone text-gray-400" />
            <span>{{ slotProps.data.phone || "-" }}</span>
          </div>
        </template>
      </Column>

      <!-- Column Status -->
      <Column
        field="created_at"
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

      <!-- Column Status Aktif -->
      <Column header="Status Akun" style="width: 100px">
        <template #body="slotProps">
          <Tag
            :value="getUserStatus(slotProps.data)"
            :severity="getStatusSeverity(slotProps.data)"
          />
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
              @click="viewUser(slotProps.data)"
            />
            <Button
              icon="i-material-symbols:edit"
              severity="warning"
              variant="text"
              size="small"
              v-tooltip.top="'Edit User'"
              @click="editUser(slotProps.data)"
            />
            <Button
              icon="i-material-symbols:delete"
              severity="danger"
              variant="text"
              size="small"
              v-tooltip.top="'Hapus User'"
              @click="confirmDelete(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dialog Detail User -->
    <Dialog
      v-model:visible="showDetailDialog"
      modal
      header="Detail User"
      :style="{ width: '450px' }"
    >
      <div v-if="selectedUser" class="space-y-4">
        <div class="text-center mb-6">
          <Avatar
            :label="getInitials(selectedUser.full_name)"
            size="xlarge"
            shape="circle"
            style="background-color: #C74375; color: #fff"
            class="mb-3"
          />
          <h3 class="text-xl font-semibold">{{ selectedUser.full_name }}</h3>
          <p class="text-gray-500">{{ selectedUser.email }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">User ID</label>
            <p class="font-mono">#{{ selectedUser.user_id }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">NIM</label>
            <p>{{ selectedUser.nim || "-" }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">No. Telepon</label>
            <p>{{ selectedUser.phone_number || "-" }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Bergabung</label>
            <p>{{ formatDate(selectedUser.created_at) }}</p>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600">Status</label>
          <div class="mt-1">
            <Tag
              :value="getUserStatus(selectedUser)"
              :severity="getStatusSeverity(selectedUser)"
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
          @click="editUser(selectedUser)"
        />
      </template>
    </Dialog>

    <!-- Dialog Edit User -->
    <Dialog
      v-model:visible="showEditDialog"
      modal
      header="Edit User"
      :style="{ width: '500px' }"
    >
      <form @submit.prevent="updateUser" class="space-y-4">
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
            <InputText id="edit-nim" v-model="editForm.nim" class="w-full" />
            <label for="edit-nim">NIM</label>
          </FloatLabel>
        </div>

        <div>
          <FloatLabel>
            <InputText
              id="edit-phone"
              v-model="editForm.phone_number"
              class="w-full"
            />
            <label for="edit-phone">No. Telepon</label>
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
          @click="updateUser"
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

// Composables
const toast = useToast();
const confirm = useConfirm();

// State
const users = ref();
const loading = ref(false);
const updating = ref(false);
const showDetailDialog = ref(false);
const showEditDialog = ref(false);
const selectedUser = ref<any>();

// Form data
const editForm = ref({
  full_name: "",
  email: "",
  nim: "",
  phone_number: "",
});

const editErrors = ref<Record<string, string>>({});

// Filters
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  full_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nim: { value: null, matchMode: FilterMatchMode.CONTAINS },
  phone_number: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Lifecycle
onMounted(() => {
  fetchUsers();
});

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true;
    const { data } = await $fetch("/api/user");
    users.value = data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal memuat data user",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  fetchUsers();
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
  });
};

const getUserStatus = (user: any) => {
  // Bisa disesuaikan dengan logic status yang diinginkan
  const joinDate = new Date(user.created_at);
  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff < 7) return "Baru";
  return "Aktif";
};

const getStatusSeverity = (user: any) => {
  const status = getUserStatus(user);
  return status === "Baru" ? "info" : "success";
};

const viewUser = (user: any) => {
  selectedUser.value = user;
  showDetailDialog.value = true;
};

const editUser = (user: any) => {
  selectedUser.value = user;
  editForm.value = {
    full_name: user.full_name || "",
    email: user.email || "",
    nim: user.nim || "",
    phone_number: user.phone_number || "",
  };
  editErrors.value = {};
  showEditDialog.value = true;
  showDetailDialog.value = false;
};

const updateUser = async () => {
  try {
    updating.value = true;
    editErrors.value = {};

    // Validasi sederhana
    if (!editForm.value.full_name.trim()) {
      editErrors.value.full_name = "Nama lengkap wajib diisi";
      return;
    }
    if (!editForm.value.email.trim()) {
      editErrors.value.email = "Email wajib diisi";
      return;
    }

    // Panggil API update (perlu dibuat)
    // await $fetch(`/api/user/${selectedUser.value.user_id}`, {
    //   method: 'PUT',
    //   body: editForm.value
    // });

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Data user berhasil diperbarui",
      life: 3000,
    });

    showEditDialog.value = false;
    await fetchUsers();
  } catch (error) {
    console.error("Error updating user:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal memperbarui data user",
      life: 3000,
    });
  } finally {
    updating.value = false;
  }
};

const confirmDelete = (user: any) => {
  confirm.require({
    message: `Apakah Anda yakin ingin menghapus user "${user.full_name}"?`,
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
      deleteUser(user);
    },
  });
};

const deleteUser = async (user: any) => {
  try {
    // Panggil API delete (perlu dibuat)
    // await $fetch(`/api/user/${user.user_id}`, {
    //   method: 'DELETE'
    // });

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "User berhasil dihapus",
      life: 3000,
    });

    await fetchUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal menghapus user",
      life: 3000,
    });
  }
};

// Meta & Layout
definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

useSeoMeta({
  title: "Manajemen User | Mediawi",
  description: "Halaman manajemen user",
  ogTitle: "Manajemen User | Mediawi",
});
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>

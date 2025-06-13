<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-5">
      <h1 class="text-lg md:text-2xl font-bold text-gray-900">Profil Admin</h1>
      <p class="text-sm md:text-base text-gray-600">
        Kelola informasi profil dan pengaturan akun Anda
      </p>
    </div>

    <!-- Profile Card -->
    <Card class="mb-5 shadow-sm">
      <template #content>
        <div class="flex flex-col md:flex-row gap-5 items-center">
          <!-- Avatar Section -->
          <div class="flex flex-col items-center gap-2">
            <div class="">
              <Avatar
                v-if="!profileData.imgUrl"
                :label="getInitials(profileData.full_name)"
                size="xlarge"
                shape="circle"
                style="
                  background-color: #c74375;
                  color: white;
                  width: 120px;
                  height: 120px;
                  font-size: 2rem;
                "
              />
              <NuxtImg
                v-else
                :src="profileData.imgUrl"
                alt="Profile"
                class="w-30 h-30 rounded-full object-cover object-center"
              />
            </div>
            <div class="w-full max-w-xs relative">
              <ImageUpload
                ref="imageUploadRef"
                v-model="profileImageUrl"
                folder="p"
                alt-text="Foto profil admin"
                @upload-success="onImageUploadSuccess"
                @upload-error="onImageUploadError"
                @file-removed="onImageRemoved"
                :max-file-size="1048576"
                :showPreview="false"
              />
            </div>
            <p class="text-sm text-gray-500 mt-2 text-center">
              Pilih gambar untuk merubah foto profi
            </p>
          </div>

          <!-- Profile Info -->
          <div class="flex-1">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600"
                  >Nama Lengkap</label
                >
                <p class="text-lg">{{ profileData.full_name }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Email</label>
                <p class="text-lg">{{ profileData.email }}</p>
              </div>
              <div class="flex flex-col gap-2.5">
                <label class="text-sm font-medium text-gray-600">Role</label>
                <Tag
                  class="w-"
                  :value="formatRole(profileData.role)"
                  :severity="getRoleSeverity(profileData.role)"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600"
                  >Login Terakhir</label
                >
                <p>{{ formatDate(profileData.last_login) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600"
                  >Bergabung</label
                >
                <p>{{ formatDate(profileData.createdAt) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600"
                  >ID Admin</label
                >
                <p class="font-mono text-sm">{{ profileData.admin_id }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Settings Tabs -->
    <TabView>
      <!-- Account Settings Tab -->
      <TabPanel header="Pengaturan Akun" value="account">
        <Card class="shadow-none">
          <template #content>
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FloatLabel>
                    <InputText
                      id="full_name"
                      v-model="editForm.full_name"
                      class="w-full"
                      :invalid="!!errors.full_name"
                    />
                    <label for="full_name">Nama Lengkap</label>
                  </FloatLabel>
                  <small v-if="errors.full_name" class="text-red-500">
                    {{ errors.full_name }}
                  </small>
                </div>

                <div>
                  <FloatLabel>
                    <InputText
                      id="email"
                      v-model="editForm.email"
                      type="email"
                      class="w-full"
                      :invalid="!!errors.email"
                    />
                    <label for="email">Email</label>
                  </FloatLabel>
                  <small v-if="errors.email" class="text-red-500">
                    {{ errors.email }}
                  </small>
                </div>
              </div>

              <div class="flex justify-end">
                <Button
                  type="submit"
                  label="Simpan Perubahan"
                  icon="i-material-symbols:save"
                  :loading="updating"
                />
              </div>
            </form>
          </template>
        </Card>
      </TabPanel>

      <!-- Change Password Tab -->
      <TabPanel header="Ubah Password" value="password">
        <Card class="shadow-none">
          <template #content>
            <form @submit.prevent="changePassword" class="space-y-6">
              <div class="space-y-5">
                <div>
                  <FloatLabel>
                    <Password
                      id="current_password"
                      v-model="passwordForm.current_password"
                      class="w-full"
                      inputClass="w-full"
                      :invalid="!!passwordErrors.current_password"
                      :feedback="false"
                      toggleMask
                    />
                    <label for="current_password">Password Saat Ini</label>
                  </FloatLabel>
                  <small
                    v-if="passwordErrors.current_password"
                    class="text-red-500"
                  >
                    {{ passwordErrors.current_password }}
                  </small>
                </div>

                <div>
                  <FloatLabel>
                    <Password
                      id="new_password"
                      v-model="passwordForm.new_password"
                      class="w-full"
                      inputClass="w-full"
                      :invalid="!!passwordErrors.new_password"
                      toggleMask
                    />
                    <label for="new_password">Password Baru</label>
                  </FloatLabel>
                  <small
                    v-if="passwordErrors.new_password"
                    class="text-red-500"
                  >
                    {{ passwordErrors.new_password }}
                  </small>
                </div>

                <div>
                  <FloatLabel>
                    <Password
                      id="confirm_password"
                      v-model="passwordForm.confirm_password"
                      class="w-full"
                      inputClass="w-full"
                      :invalid="!!passwordErrors.confirm_password"
                      :feedback="false"
                      toggleMask
                    />
                    <label for="confirm_password"
                      >Konfirmasi Password Baru</label
                    >
                  </FloatLabel>
                  <small
                    v-if="passwordErrors.confirm_password"
                    class="text-red-500"
                  >
                    {{ passwordErrors.confirm_password }}
                  </small>
                </div>
              </div>

              <div class="flex justify-end">
                <Button
                  type="submit"
                  label="Ubah Password"
                  icon="i-material-symbols:lock"
                  :loading="changingPassword"
                />
              </div>
            </form>
          </template>
        </Card>
      </TabPanel>
    </TabView>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script lang="ts" setup>
// Composables
const toast = useToast();
const adminStore = useAdminStore();
const imageUploadRef = ref();

// State
const profileData = ref<any>({});
const updating = ref(false);
const changingPassword = ref(false);
const profileImageUrl = ref<string | null>(null);

// Form data
const editForm = ref({
  full_name: "",
  email: "",
});

const passwordForm = ref({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

// Errors
const errors = ref<Record<string, string>>({});
const passwordErrors = ref<Record<string, string>>({});

// Lifecycle
onMounted(async () => {
  await fetchProfile();
});

// Methods
const fetchProfile = async () => {
  try {
    await $fetch(`/api/admin/${adminStore.admin.id}`).then((res: any) => {
      profileData.value = res.data;
      profileImageUrl.value = res.data.imgUrl;
      editForm.value = {
        full_name: res.data.full_name || "",
        email: res.data.email || "",
      };
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal memuat data profil",
      life: 3000,
    });
  }
};

const updateProfile = async () => {
  try {
    updating.value = true;
    errors.value = {};

    // Validasi
    if (!editForm.value.full_name.trim()) {
      errors.value.full_name = "Nama lengkap wajib diisi";
      return;
    }
    if (!editForm.value.email.trim()) {
      errors.value.email = "Email wajib diisi";
      return;
    }

    // Update profile data including image
    const updateData = {
      ...editForm.value,
      imgUrl: profileImageUrl.value,
    };

    await $fetch(`/api/admin/${adminStore.admin.id}`, {
      method: "PUT",
      body: updateData,
    });

    // Confirm uploaded image
    if (imageUploadRef.value) {
      imageUploadRef.value.confirmFile();
    }

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Profil berhasil diperbarui",
      life: 3000,
    });

    await fetchProfile();
  } catch (error: any) {
    console.error("Error updating profile:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.data?.message || "Gagal memperbarui profil",
      life: 3000,
    });
  } finally {
    updating.value = false;
  }
};

const changePassword = async () => {
  try {
    changingPassword.value = true;
    passwordErrors.value = {};

    // Validasi
    if (!passwordForm.value.current_password) {
      passwordErrors.value.current_password = "Password saat ini wajib diisi";
      return;
    }
    if (!passwordForm.value.new_password) {
      passwordErrors.value.new_password = "Password baru wajib diisi";
      return;
    }
    if (passwordForm.value.new_password.length < 6) {
      passwordErrors.value.new_password = "Password baru minimal 6 karakter";
      return;
    }
    if (
      passwordForm.value.new_password !== passwordForm.value.confirm_password
    ) {
      passwordErrors.value.confirm_password = "Konfirmasi password tidak cocok";
      return;
    }

    await $fetch(`/api/admin/change-password?id=${adminStore.admin.id}`, {
      method: "PUT",
      body: {
        current_password: passwordForm.value.current_password,
        new_password: passwordForm.value.new_password,
      },
    });

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Password berhasil diubah",
      life: 3000,
    });

    // Reset form
    passwordForm.value = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    };
  } catch (error: any) {
    console.error("Error changing password:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.data?.message || "Gagal mengubah password",
      life: 3000,
    });
  } finally {
    changingPassword.value = false;
  }
};

// Handle image upload events
const onImageUploadSuccess = (data: { url: string; key: string }) => {
  profileData.value.imgUrl = data.url;
  console.log("Image uploaded successfully:", data);
};

const onImageUploadError = (error: string) => {
  console.error("Image upload error:", error);
};

const onImageRemoved = () => {
  profileData.value.imgUrl = null;
  console.log("Image removed");
};

// Utility functions
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
    month: "long",
    day: "numeric",
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

// Page meta
definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

useSeoMeta({
  title: "Profil Admin | Mediawi",
  description: "Halaman profil dan pengaturan admin",
});

// Cleanup on unmount
onBeforeUnmount(async () => {
  if (imageUploadRef.value) {
    await imageUploadRef.value.cleanupTempFile();
  }
});
</script>

<style scoped></style>

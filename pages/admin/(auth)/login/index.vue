<template>
  <div class="h-screen flex justify-center items-center">
    <div class="py-5 px-10 w-75 md:w-100 bg-[#eee] gap-5 rounded shadow">
      <NuxtImg width="1600" height="475" src="/logowi.png" />
      <h2 class="text-center text-base md:text-xl font-bold my-5">
        Masuk Admin
      </h2>
      <form class="flex flex-col gap-5" @submit.prevent="login">
        <InputText v-model="email" type="text" placeholder="Email" required />
        <Password
          v-model="password"
          placeholder="Password"
          :feedback="false"
          input-class="w-100"
          required
          toggleMask
        />
        <Button
          type="submit"
          :unstyled="true"
          class="px-5 py-3 bg-fuchsia-600 text-white font-bold rounded cursor-pointer transition-all duration-300 ease-in-out"
          hover="bg-fuchsia-700"
          label="Masuk"
          input-class="w-100"
          required
        />
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { adminData } from "~/types/auth";

const toast = useToast();

// Variabel
const email = ref("");
const password = ref("");

// Pinia
const store = useAdminStore();

// Gunakan composable validasi
const { errors, validateLoginForm } = useValidation();

const login = async () => {
  // Validasi
  const isValid = validateLoginForm(email.value, password.value);

  if (!isValid) {
    if (errors.email) {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: errors.email,
        life: 3000,
      });
    } else if (errors.password) {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: errors.password,
        life: 3000,
      });
    }
    return;
  }

  // Panggil API login
  await $fetch<{
    statusCode: number;
    message: string;
    data?: adminData;
  }>("/api/admin/login", {
    method: "POST",
    body: { email: email.value, password: password.value },
  })
    .then((res) => {
      if (res.statusCode === 200) {
        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Berhasi login admin",
          life: 3000,
        });

        if (res.data) {
          store.login(res.data);
        }

        // Redirect ke halaman admin
        navigateTo("/admin");
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: err.data?.message,
        life: 3000,
      });
    });
};

definePageMeta({
  layout: "default",
});
// SEO Meta
useSeoMeta({
  title: "Login Admin | Mediawi",
  description: "Login untuk admin",
  ogTitle: "Login Admin | Mediawi",
});
</script>

<style></style>

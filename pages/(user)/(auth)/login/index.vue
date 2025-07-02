<template>
  <div class="h-screen flex justify-center items-center">
    <div class="py-5 px-10 w-75 md:w-100 bg-[#eee] gap-5 rounded shadow">
      <NuxtImg width="1600" height="475" src="/logowi.png" />
      <h2 class="text-center text-xl font-bold my-5">Masuk</h2>
      <Form class="flex flex-col gap-5" @submit="login">
        <InputText v-model="email" type="text" placeholder="Email" required />
        <Password
          v-model="password"
          placeholder="Password"
          :feedback="false"
          input-class="w-full sm:w-100"
          toggleMask
          required
        />
        <Button
          id="submitButton"
          type="submit"
          :unstyled="true"
          class="px-5 py-3 bg-fuchsia-600 text-white font-bold rounded cursor-pointer transition-all duration-300 ease-in-out"
          hover="bg-fuchsia-700"
          label="Masuk"
        />
      </Form>
      <div class="mt-5">
        <p class="text-center text-sm">
          Belum punya akun?
          <NuxtLink to="/register" class="text-fuchsia-600 font-semibold"
            >Daftar</NuxtLink
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { InputText, Password, Button } from "primevue";
import { useUserStore } from "~/stores/user";
import type { userData } from "~/types/auth";

const toast = useToast();

// Variabel
const email = ref("");
const password = ref("");

// Pinia
const store = useUserStore();

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
    data?: userData;
  }>("/api/user/login", {
    method: "POST",
    body: { email: email.value, password: password.value },
  })
    .then((res) => {
      if (res.statusCode === 200 && res.data) {
        store.login(res.data);

        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Login berhasil",
          life: 3000,
        });

        navigateTo("/");
      } else {
        toast.add({
          severity: "error",
          summary: "Gagal",
          detail: "Login gagal, silahkan coba lagi",
          life: 3000,
        });
      }
    })
    .catch((error) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: error?.data?.message || "Terjadi kesalahan, silakan coba lagi",
        life: 3000,
      });
    });
};

useSeoMeta({
  title: "Login | Mediawi",
  description: "Register to my website",
  ogTitle: "Login | Mediawi",
});
</script>

<style></style>

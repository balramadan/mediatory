<template>
  <div class="h-screen flex justify-center items-center">
    <div class="py-5 px-10 w-100 bg-[#eee] gap-5 rounded shadow">
      <NuxtImg width="1600" height="475" src="/logowi.png" />
      <h2 class="text-center text-xl font-bold my-5">Daftar</h2>
      <form class="flex flex-col gap-5" @submit.prevent="register">
        <InputText v-model="name" type="text" placeholder="Nama" required />
        <InputText v-model="email" type="text" placeholder="Email" required />
        <Password
          v-model="password"
          placeholder="Password"
          input-class="w-100"
          required
        />
        <Password
          v-model="confirmPassword"
          placeholder="Confirm Password"
          :feedback="false"
          input-class="w-100"
          required
        />
        <Button
          type="submit"
          :unstyled="true"
          class="px-5 py-3 bg-fuchsia-600 text-white font-bold rounded cursor-pointer transition-all duration-300 ease-in-out"
          hover="bg-fuchsia-700"
          label="Daftar"
        />
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { InputText, Password, Button } from "primevue";

const toast = useToast()

// Variabel
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

// Gunakan composable validasi
const { errors, validateRegistrationForm } = useValidation();

const register = async () => {
  // Validasi
  const isValid = validateRegistrationForm(
    email.value,
    password.value,
    confirmPassword.value
  );

  if (!isValid) {
    if (errors.email) alert(errors.email);
    else if (errors.password) alert(errors.password);
    else if (errors.confirmPassword) alert(errors.confirmPassword);
    return;
  }
   
  await $fetch("/api/admin/register", {
      method: "POST",
      body: {
        full_name: name.value,
        email: email.value,
        password: password.value,
      },
    }).then((res) => {
      if (res.statusCode === 200) {
        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Berhasil mendaftarkan admin",
          life: 3000,
        });

        navigateTo("/admin/login")
      } else {
        toast.add({
          severity: "error",
          summary: "Gagal",
          detail: `Gagal mendaftarkan admin: ${res.message}`,
          life: 3000,
        })
      }
    }).catch((err) => {
      toast.add({
          severity: "error",
          summary: "Gagal",
          detail: `Gagal mendaftarkan admin: ${err}`,
          life: 3000,
        })
    });
};

definePageMeta({
  layout: 'default',
})
// SEO Meta
useSeoMeta({
  title: "Register | Mediawi",
  description: "Register to my website",
  ogTitle: "Register | Mediawi",
});
</script>

<style></style>

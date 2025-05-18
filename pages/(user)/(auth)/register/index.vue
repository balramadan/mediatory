<template>
  <div class="h-screen flex justify-center items-center">
    <div class="py-5 px-10 w-100 bg-[#eee] gap-5 rounded shadow">
      <NuxtImg width="1600" height="475" src="/logowi.png" />
      <h2 class="text-center text-xl font-bold my-5">Daftar</h2>
      <Form class="flex flex-col gap-5" @submit="register">
        <InputText v-model="name" type="text" placeholder="Nama" required />
        <InputText v-model="email" type="text" placeholder="Email" required />
        <InputText
          v-model="phone"
          type="text"
          placeholder="Phone Number"
          required
        />
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
      </Form>
      <div class="mt-5">
        <p class="text-center text-sm">
          Sudah punya akun?
          <NuxtLink
            to="/login"
            class="text-fuchsia-600 font-semibold"
            >Masuk</NuxtLink
          ></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { InputText, Password, Button } from "primevue";

const toast = useToast();

// Variabel
const name = ref("");
const phone = ref("");
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

  // Kirim data ke API
  await $fetch("/api/user/register", {
    method: "POST",
    body: {
      full_name: name.value,
      email: email.value,
      password: password.value,
      phone: phone.value,
    },
  })
    .then((res) => {
      if (res.statusCode === 200) {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Registration successful",
          life: 3000,
        });
        // Redirect ke halaman login
        setTimeout(() => {
          navigateTo("/login");
        }, 3000);
      } else {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: res.message,
          life: 3000,
        });
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    });
};

useSeoMeta({
  title: "Register | Mediadesk",
  description: "Register to my website",
  ogTitle: "Register | Mediadesk",
});
</script>

<style></style>

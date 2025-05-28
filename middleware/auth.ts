export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();

  if (!to.path.startsWith("/")) {
    return;
  }

  // Mendapatkan path saat ini
  const isLoginPath = to.path === "/login" || to.path === "/login/";
  const isRegisterPath = to.path === "/register" || to.path === "/register/";
  const isAuthPath = isLoginPath || isRegisterPath;

  // Cek apakah user sudah login
  // Jika belum login dan mencoba akses halaman yang membutuhkan auth
  if (!userStore.isLoggedIn && !isAuthPath && !to.path.startsWith("/public")) {
    return navigateTo("/login");
  }

  // Jika sudah login dan mencoba akses halaman login/register
  if (userStore.isLoggedIn && isAuthPath) {
    return navigateTo("/");
  }
});

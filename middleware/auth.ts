export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();

  if (to.path.startsWith("/admin")) {
    return;
  }

  // Mendapatkan path saat ini
  const authPath = ["/login", "/register"];
  const isAuthPath = authPath.includes(to.path);

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

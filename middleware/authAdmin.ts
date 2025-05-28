export default defineNuxtRouteMiddleware((to, from) => {
  const adminStore = useAdminStore();

  if (!to.path.startsWith('/admin')) {
    return
  }

  // Mendapatkan path saat ini
  const isLoginPath = to.path === "/admin/login" || to.path === "/admin/login/";
  const isRegisterPath = to.path === "/admin/register" || to.path === "/admin/register/";
  const isAuthPath = isLoginPath || isRegisterPath;

  // Cek apakah admin sudah login
  if (!adminStore.isLoggedIn && to.path.startsWith("/admin") && !isAuthPath) {
    return navigateTo("/admin/login");
  }

  if (adminStore.isLoggedIn && isAuthPath) {
    console.log('sudah login');
    return navigateTo("/admin");
  }
});

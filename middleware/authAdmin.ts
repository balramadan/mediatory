export default defineNuxtRouteMiddleware((to, from) => {
  const adminStore = useAdminStore();

  if (!to.path.startsWith('/admin')) {
    return
  }

  // Mendapatkan path saat ini
  const authPaths = ["/admin/login", "admin/register"];
  const isAuthPath = authPaths.includes(to.path);

  // Cek apakah admin sudah login
  if (!adminStore.isLoggedIn && to.path.startsWith("/admin") && !isAuthPath) {
    return navigateTo("/admin/login");
  }

  if (adminStore.isLoggedIn && isAuthPath) {
    console.log('sudah login');
    return navigateTo("/admin");
  }
});

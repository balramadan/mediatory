// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxt/fonts",
    "@nuxt/image",
    // "@nuxt/eslint",
    "@primevue/nuxt-module",
    "@unocss/nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt",
  ],
  css: ["~/assets/css/global.css"],
  unocss: {
    nuxtLayers: true,
  },
  image: {
    provider: "ipx",
    dir: "public",
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          prefix: "p",
          darkModeSelector: "light",
          cssLayer: false,
        },
      },
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["js-cookie"],
    },
    build: {
      cssCodeSplit: false,
    },
    cacheDir: ".nuxt/.vite",
    clearScreen: false,
  },
  nitro: {
    storage: {
      cache: {
        driver: "fs",
        base: ".nuxt/cache",
      },
    },
    runtimeConfig: {
      fetch: {
        connectTimeout: 60000,
        socketTimeout: 60000,
      },
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
});

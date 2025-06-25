// https://nuxt.com/docs/api/configuration/nuxt-config
import { myPreset } from "./lib/preset";

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
    "@nuxt/test-utils/module",
  ],
  build: {
    transpile: ["primevue"],
  },
  css: ["~/assets/css/global.css"],
  unocss: {
    nuxtLayers: true,
  },
  image: {
    provider: "static",
    dir: "public",
  },
  primevue: {
    options: {
      theme: {
        preset: myPreset,
        options: {
          prefix: "p",
          darkModeSelector: "light",
          cssLayer: false,
        },
      },
      ripple: true,
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
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
    },
  },
});

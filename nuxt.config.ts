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
    transpile: ["primevue", "prisma", "@prisma/client"],
  },
  css: ["~/assets/css/global.css"],
  unocss: {
    nuxtLayers: true,
  },
  image: {
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
  nitro: {
    replace: {
      "import * as process": "import * as processUnused",
    }
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
  typescript: {
    strict: true,
    typeCheck: false,
  },
});

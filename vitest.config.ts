import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
        provider: "v8"
    },
    globals: true,
  },
});

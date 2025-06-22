import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "happy-dom", // cocok untuk test komponen Vue
    globals: true,
    include: ["tests/**/*.test.ts", "components/**/*.test.ts"],
    server: {
      deps: {
        inline: ["@vue", "primevue"],
      }
    },
    env: {
      NODE_ENV: "test",
    },
    setupFiles: ['./tests/setup.ts'],
  },
});

/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      exclude: ["src/test/**/*", "src/main.ts", "src/counter.ts"],
      include: ["src/**/*"],
    },
  },
});

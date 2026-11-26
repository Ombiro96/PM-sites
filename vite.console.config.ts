import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * The console: where a manager signs in and sets up their website. It is a
 * separate app from the site in `src/`, with its own build, so a site build
 * never carries it.
 */
export default defineConfig({
  root: "console",
  base: "/",
  envDir: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5174 },
  build: {
    outDir: "../dist-console",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        console: fileURLToPath(
          new URL("./console/index.html", import.meta.url),
        ),
        preview: fileURLToPath(
          new URL("./console/preview.html", import.meta.url),
        ),
      },
    },
    assetsDir: "assets",
    sourcemap: false,
  },
  test: { environment: "jsdom", include: ["src/**/*.test.ts"] },
});

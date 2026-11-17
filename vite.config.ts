import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * `index.html` keeps two placeholders that the backend fills when it publishes
 * a site. The dev server has no backend in front of it, so it blanks them; the
 * build leaves them exactly as written.
 */
function blankPlaceholdersInDev(): Plugin {
  return {
    name: "pm-sites:blank-placeholders",
    apply: "serve",
    transformIndexHtml: (html) =>
      html
        .replace("%SITE_HEAD%", "")
        .replace("%SITE_DATA%", ""),
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), blankPlaceholdersInDev()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: { outDir: "dist", assetsDir: "assets", sourcemap: false },
  test: { environment: "jsdom", include: ["src/**/*.test.ts"] },
});

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import fs from "fs";

/** Writes public/version.json at build time with unique build hash */
function versionPlugin() {
  const buildId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return {
    name: "omzone-version",
    config() {
      return { define: { __APP_BUILD_ID__: JSON.stringify(buildId) } };
    },
    writeBundle() {
      fs.writeFileSync(
        path.resolve(__dirname, "dist/version.json"),
        JSON.stringify({ buildId }),
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["APPWRITE_", "VITE_APP_"]);

  const mapped = {};
  for (const [key, val] of Object.entries(env)) {
    if (key.startsWith("APPWRITE_") && !key.startsWith("VITE_")) {
      mapped[`import.meta.env.VITE_${key}`] = JSON.stringify(val);
    }
    mapped[`import.meta.env.${key}`] = JSON.stringify(val);
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      versionPlugin(),
      mode === "analyze" &&
        visualizer({
          open: true,
          filename: "dist/bundle-stats.html",
          gzipSize: true,
        }),
    ].filter(Boolean),
    define: mapped,
    envPrefix: "__OMZONE_ENV_DISABLED__",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-query": ["@tanstack/react-query"],
            "vendor-appwrite": ["appwrite"],
            "vendor-helmet": ["react-helmet-async"],
          },
        },
      },
    },
  };
});

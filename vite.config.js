import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

/** Writes public/version.json at build time with unique build hash */
function versionPlugin() {
  const buildId = process.env.OMZONE_BUILD_ID || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return {
    name: "omzone-version",
    apply: "build",
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

export default defineConfig(async ({ mode, isSsrBuild }) => {
  const visualizer =
    mode === "analyze"
      ? (await import("rollup-plugin-visualizer")).visualizer
      : null;
  const env = loadEnv(mode, process.cwd(), ["APPWRITE_", "VITE_"]);

  const mapped = {};
  for (const [key, val] of Object.entries(env)) {
    // APPWRITE_* includes API keys locally. Only identifiers/config reach JS.
    if (key.startsWith("APPWRITE_") && !/^APPWRITE_(ENDPOINT|PROJECT_ID|DATABASE_ID|COLLECTION_\w+|BUCKET_\w+|FUNCTION_\w+)$/.test(key)) continue;
    if (key.startsWith("APPWRITE_") && !key.startsWith("VITE_")) {
      mapped[`import.meta.env.VITE_${key}`] = JSON.stringify(val);
    }
    // Only expose APPWRITE_ and VITE_ prefixed vars to the frontend
    if (key.startsWith("APPWRITE_") || key.startsWith("VITE_")) {
      mapped[`import.meta.env.${key}`] = JSON.stringify(val);
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "omzone-preview-robots",
        transformIndexHtml() {
          const project = env.VITE_APPWRITE_PROJECT_ID || env.APPWRITE_PROJECT_ID || "omzone-dev";
          return project === "omzone" ? [] : [{
            tag: "meta", attrs: { name: "robots", content: "noindex,nofollow" }, injectTo: "head",
          }];
        },
      },
      !isSsrBuild && versionPlugin(),
      mode === "analyze" &&
        visualizer({
          open: true,
          filename: "dist/bundle-stats.html",
          gzipSize: true,
        }),
    ].filter(Boolean),
    define: { ...mapped, ...(isSsrBuild ? { __APP_BUILD_ID__: JSON.stringify(process.env.OMZONE_BUILD_ID || "server") } : {}) },
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
          manualChunks: isSsrBuild ? undefined : {
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

import { build, loadEnv } from "vite";

const mode = process.argv[2] || "production";
if (mode === "prod") {
  const vars = loadEnv(mode, process.cwd(), "");
  if ((vars.VITE_APPWRITE_PROJECT_ID || vars.APPWRITE_PROJECT_ID) !== "omzone") {
    throw new Error("Production build requires project omzone in .env.prod (or the build environment)");
  }
  if (vars.VITE_UNDER_CONSTRUCTION === "true") throw new Error("Disable VITE_UNDER_CONSTRUCTION for Home SSR");
}
process.env.OMZONE_BUILD_ID = Date.now().toString(36);
await build({ mode });
await build({ mode, build: { ssr: "src/entry-server.jsx", outDir: "dist-ssr", copyPublicDir: false } });

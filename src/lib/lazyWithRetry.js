import { lazy } from "react";

const RELOAD_KEY = "omzone_chunk_reload";

/**
 * Wraps React.lazy to handle chunk-load failures after a deploy.
 * On first failure it triggers a hard reload (once) so the browser
 * fetches the new asset manifest. If it already reloaded, it throws
 * so the error boundary can show a message.
 */
export default function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn().catch((error) => {
      const isChunkError =
        error?.name === "ChunkLoadError" ||
        /loading.*chunk|dynamically imported module|failed to fetch/i.test(
          error?.message,
        );

      if (!isChunkError) throw error;

      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
        // Return a never-resolving promise so React doesn't render stale UI
        return new Promise(() => {});
      }

      // Already tried reloading — clear flag and let error propagate
      sessionStorage.removeItem(RELOAD_KEY);
      throw error;
    }),
  );
}

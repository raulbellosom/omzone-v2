import { useState, useEffect, useCallback } from "react";

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Polls /version.json to detect when a newer build has been deployed.
 * Returns { updateAvailable, currentVersion, latestVersion, dismiss }.
 *
 * __APP_BUILD_ID__ is injected at build time by the versionPlugin in vite.config.js.
 * In dev mode it's undefined so the hook stays inert.
 */
export default function useAppVersion() {
  const currentVersion =
    typeof __APP_BUILD_ID__ !== "undefined" ? __APP_BUILD_ID__ : null;
  const [latestVersion, setLatestVersion] = useState(currentVersion);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/version.json", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.buildId) setLatestVersion(data.buildId);
    } catch {
      // Network error or dev mode — ignore
    }
  }, []);

  useEffect(() => {
    if (!currentVersion) return; // dev mode
    // Initial check after a short delay so it doesn't fire on first paint
    const initial = setTimeout(check, 10_000);
    const interval = setInterval(check, POLL_INTERVAL);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [currentVersion, check]);

  const updateAvailable =
    !dismissed &&
    currentVersion != null &&
    latestVersion != null &&
    currentVersion !== latestVersion;

  return {
    updateAvailable,
    currentVersion,
    latestVersion,
    dismiss: () => setDismissed(true),
  };
}

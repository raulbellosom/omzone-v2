import { useEffect, useRef, useState, useId, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, SwitchCamera } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/components/common/Button";
import { cn } from "@/lib/utils";

const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;

export default function ScannerCard({ onSubmitCode, disabled = false, focusToken = 0 }) {
  const { t } = useLanguage();
  const elementId = useId().replace(/:/g, "");
  const [code, setCode] = useState("");
  const [cameraState, setCameraState] = useState("starting"); // starting | active | error
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const inputRef = useRef(null);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: "", at: 0 });

  // Refocus the manual/HID input whenever the parent asks (e.g. modal closed).
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [focusToken]);

  // Discover available cameras once. html5-qrcode's facingMode constraint
  // only accepts a plain string or { exact }, both of which fail outright
  // when the requested facing direction doesn't exist (e.g. a laptop with
  // only a front-facing webcam) — enumerate real devices instead and default
  // to a rear-facing one when present, but let the operator switch manually.
  useEffect(() => {
    let cancelled = false;
    Html5Qrcode.getCameras()
      .then((list) => {
        if (cancelled) return;
        if (!list || list.length === 0) {
          throw new Error("No camera devices found");
        }
        setCameras(list);
        const rearCamera = list.find((c) => /back|rear|environment/i.test(c.label));
        setActiveCameraId((rearCamera || list[0]).id);
      })
      .catch((err) => {
        console.error("ScannerCard: failed to list cameras:", err);
        if (!cancelled) setCameraState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Start/stop the scanner whenever the active camera changes.
  useEffect(() => {
    if (!activeCameraId) return;

    let cancelled = false;
    setCameraState("starting");
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    function onDecoded(decodedText) {
      const sanitized = decodedText.trim().toUpperCase();
      const now = Date.now();
      // Debounce: ignore the same code re-fired within 3s (camera scans continuously).
      if (
        lastScannedRef.current.code === sanitized &&
        now - lastScannedRef.current.at < 3000
      ) {
        return;
      }
      lastScannedRef.current = { code: sanitized, at: now };
      if (TICKET_CODE_PATTERN.test(sanitized)) {
        onSubmitCode(sanitized);
      }
    }

    const startPromise = scanner
      .start(
        activeCameraId,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onDecoded,
        () => {
          /* per-frame decode failures are expected while no code is in view — ignore */
        },
      )
      .then(() => {
        if (!cancelled) setCameraState("active");
      })
      .catch((err) => {
        // Surface the real reason (permission denied, camera busy, etc.)
        // instead of swallowing it — the UI only shows a generic fallback
        // message, but this makes the actual cause debuggable.
        console.error("ScannerCard: camera failed to start:", err);
        if (!cancelled) setCameraState("error");
      });

    return () => {
      cancelled = true;
      // Wait for start() to settle (resolve or reject) before stopping —
      // calling stop() while start() is still in-flight (e.g. React
      // StrictMode's mount->cleanup->remount cycle, or switching cameras
      // quickly) can leave the camera stream stuck.
      startPromise
        .then(() => scanner.stop())
        .catch(() => {})
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, [activeCameraId, elementId, onSubmitCode]);

  const switchCamera = useCallback(() => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex((c) => c.id === activeCameraId);
    const next = cameras[(currentIndex + 1) % cameras.length];
    setActiveCameraId(next.id);
  }, [cameras, activeCameraId]);

  const submitManual = () => {
    const sanitized = code.trim().toUpperCase();
    if (!sanitized) return;
    onSubmitCode(sanitized);
    setCode("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitManual();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-charcoal">
          {t("admin.checkin.scanTitle")}
        </h2>
        <p className="text-sm text-charcoal-muted mt-1">{t("admin.checkin.scanSubtitle")}</p>
      </div>

      <div className="relative h-64 rounded-2xl overflow-hidden bg-charcoal">
        <div id={elementId} className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />
        {cameraState !== "active" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sand-light bg-charcoal/80 pointer-events-none">
            <ScanLine className="h-8 w-8" />
            <span className="text-xs">
              {cameraState === "error" ? t("admin.checkin.cameraError") : t("admin.checkin.cameraStarting")}
            </span>
          </div>
        )}
        {cameraState === "active" && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-charcoal/70 px-3 py-1.5 text-xs text-sand-light">
            <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
            {t("admin.checkin.cameraActive")}
          </div>
        )}
        {cameras.length > 1 && (
          <button
            type="button"
            onClick={switchCamera}
            aria-label={t("admin.checkin.switchCamera")}
            title={t("admin.checkin.switchCamera")}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-charcoal/70 text-sand-light flex items-center justify-center cursor-pointer hover:bg-charcoal/90 transition-colors"
          >
            <SwitchCamera className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <label
          htmlFor="ticket-code-input"
          className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-2"
        >
          {t("admin.checkin.manualSectionLabel")}
        </label>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            id="ticket-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("admin.checkin.placeholder")}
            autoFocus
            autoComplete="off"
            disabled={disabled}
            className={cn(
              "flex-1 h-12 rounded-xl border border-sand-dark bg-white px-4 text-charcoal font-mono text-sm uppercase tracking-wide placeholder:text-charcoal-muted/40 placeholder:normal-case focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
              disabled && "opacity-50",
            )}
          />
          <Button type="button" size="lg" disabled={disabled || !code.trim()} onClick={submitManual}>
            {t("admin.checkin.validate")}
          </Button>
        </div>
      </div>
    </div>
  );
}

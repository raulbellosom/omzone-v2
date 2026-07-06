import { useEffect, useRef, useState, useId, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, SwitchCamera, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;

// html5-qrcode sets the injected <video>'s width in fixed pixels (computed
// once, at start time) and never sets a height or re-measures on resize —
// its own inline style always beats our Tailwind classes, and rotating a
// tablet never fixes it.
//
// Neither `width/height: 100%` nor `position: absolute; inset: 0` alone
// reliably resolves here: the mount element sits inside an aspect-ratio
// sized ancestor, and that ancestor's height — though it clearly renders
// with a real size on screen — isn't treated as "definite" for a
// descendant's stretch/percentage sizing at this nesting depth in this
// browser, so both approaches silently collapse the video to 0 height
// (invisible, despite the stream playing correctly). Instead, measure the
// container's actual rendered box in JS and set explicit pixel
// dimensions on the video, bypassing that CSS ambiguity entirely. A
// ResizeObserver keeps this correct across window resize/tablet rotation
// (the exact scenario this exists for), since pixel values (unlike
// percentages) don't auto-update.
function forceResponsiveVideoSizing(mountElementId) {
  const mount = document.getElementById(mountElementId);
  const video = mount?.querySelector("video");
  if (!mount || !video) return () => {};

  // html5-qrcode injects its own "shaded region" overlay (a semi-transparent
  // black border around the qrbox, plus white corner indicator lines) when a
  // qrbox size is configured — it has a fixed, library-wide id. We render
  // our own vignette + green corner UI instead, so hide the library's to
  // avoid double-darkening the feed and showing mismatched white indicators
  // on top of ours. It's inserted asynchronously (on the video's "playing"
  // event, which fires *after* start() already resolved), so a one-time
  // check right here is too early — watch for it with a MutationObserver
  // instead of guessing the timing.
  const hideShadedRegion = () => {
    const shadedRegion = document.getElementById("qr-shaded-region");
    if (shadedRegion) {
      shadedRegion.style.setProperty("display", "none", "important");
    }
  };
  hideShadedRegion();
  const shadeObserver = new MutationObserver(hideShadedRegion);
  shadeObserver.observe(mount, { childList: true });

  const container = mount.parentElement || mount;

  const applySize = () => {
    const rect = container.getBoundingClientRect();
    video.style.setProperty("position", "absolute", "important");
    video.style.setProperty("top", "0", "important");
    video.style.setProperty("left", "0", "important");
    video.style.setProperty("width", `${rect.width}px`, "important");
    video.style.setProperty("height", `${rect.height}px`, "important");
    video.style.setProperty("object-fit", "cover", "important");
  };

  applySize();
  const resizeObserver = new ResizeObserver(applySize);
  resizeObserver.observe(container);
  return () => {
    shadeObserver.disconnect();
    resizeObserver.disconnect();
  };
}

// Serializes camera start/stop across mounts (Kiosk mode fully unmounts and
// remounts ScannerCard on toggle; switching cameras remounts the effect too)
// so two Html5Qrcode instances can never hold the same physical camera
// device concurrently — that race is what makes the feed go black on some
// tablet camera drivers even though start() itself resolves without error.
let pendingCameraTeardown = Promise.resolve();

export default function ScannerCard({ onSubmitCode }) {
  const { t } = useLanguage();
  const elementId = useId().replace(/:/g, "");
  const [cameraState, setCameraState] = useState("starting"); // starting | active | error
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: "", at: 0 });

  // Discover available cameras once.
  useEffect(() => {
    let cancelled = false;
    Html5Qrcode.getCameras()
      .then((list) => {
        if (cancelled) return;
        if (!list || list.length === 0)
          throw new Error("No camera devices found");
        setCameras(list);
        const rearCamera = list.find((c) =>
          /back|rear|environment/i.test(c.label),
        );
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

  // Start/stop scanner on camera change.
  useEffect(() => {
    if (!activeCameraId) return;
    let cancelled = false;
    setCameraState("starting");
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    function onDecoded(decodedText) {
      const sanitized = decodedText.trim().toUpperCase();
      const now = Date.now();
      if (
        lastScannedRef.current.code === sanitized &&
        now - lastScannedRef.current.at < 3000
      )
        return;
      lastScannedRef.current = { code: sanitized, at: now };
      if (TICKET_CODE_PATTERN.test(sanitized)) onSubmitCode(sanitized);
    }

    let disconnectVideoSizing = () => {};

    const startPromise = pendingCameraTeardown.then(() =>
      scanner.start(
        activeCameraId,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onDecoded,
        () => {},
      ),
    );

    startPromise
      .then(() => {
        if (!cancelled) {
          disconnectVideoSizing = forceResponsiveVideoSizing(elementId);
          setCameraState("active");
        }
      })
      .catch((err) => {
        console.error("ScannerCard: camera failed to start:", err);
        if (!cancelled) setCameraState("error");
      });

    return () => {
      cancelled = true;
      disconnectVideoSizing();
      pendingCameraTeardown = startPromise
        .catch(() => {})
        .then(() => scanner.stop())
        .catch(() => {})
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, [activeCameraId, elementId, onSubmitCode]);

  const switchCamera = useCallback(() => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex((c) => c.id === activeCameraId);
    setActiveCameraId(cameras[(currentIndex + 1) % cameras.length].id);
  }, [cameras, activeCameraId]);

  const isActive = cameraState === "active";
  const isError = cameraState === "error";

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm overflow-hidden">
      {/* ── Camera ─────────────────────────────────────────────── */}
      <div className="relative w-full aspect-4/3 bg-[#0c0e13] overflow-hidden">
        {/* html5-qrcode mount */}
        <div
          id={elementId}
          className="absolute inset-0 [&_video]:absolute [&_video]:inset-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Targeting frame */}
        {isActive && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="relative h-55 w-55">
              <span className="absolute top-0 left-0 h-7 w-7 border-t-[3px] border-l-[3px] border-sage rounded-tl-sm" />
              <span className="absolute top-0 right-0 h-7 w-7 border-t-[3px] border-r-[3px] border-sage rounded-tr-sm" />
              <span className="absolute bottom-0 left-0 h-7 w-7 border-b-[3px] border-l-[3px] border-sage rounded-bl-sm" />
              <span className="absolute bottom-0 right-0 h-7 w-7 border-b-[3px] border-r-[3px] border-sage rounded-br-sm" />
              <div
                className="absolute left-3 right-3 h-0.5 rounded-full bg-linear-to-r from-transparent via-sage to-transparent"
                style={{ animation: "scan-line 2.2s ease-in-out infinite" }}
              />
            </div>
          </div>
        )}

        {/* Starting / Error overlay */}
        {!isActive && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#0c0e13]/95">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {isError ? (
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              ) : (
                <ScanLine className="h-7 w-7 text-sage animate-pulse" />
              )}
            </div>
            <p className="text-sm text-white/60 text-center px-8 leading-relaxed">
              {isError
                ? t("admin.checkin.cameraError")
                : t("admin.checkin.cameraStarting")}
            </p>
          </div>
        )}

        {/* Active status pill */}
        {isActive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-xs text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
              {t("admin.checkin.cameraActive")}
            </div>
          </div>
        )}

        {/* Camera switch */}
        {cameras.length > 1 && (
          <button
            type="button"
            onClick={switchCamera}
            aria-label={t("admin.checkin.switchCamera")}
            title={t("admin.checkin.switchCamera")}
            className="absolute top-4 right-4 z-20 h-12 w-12 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

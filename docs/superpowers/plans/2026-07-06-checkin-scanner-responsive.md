# Check-in Scanner: Camera Fix + Tablet-Responsive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the check-in scanner's black-camera bug and rebuild its layout to be genuinely responsive for tablets (portrait and landscape), in both normal admin mode and full-screen Kiosk mode, per [docs/superpowers/specs/2026-07-06-checkin-scanner-responsive-design.md](../specs/2026-07-06-checkin-scanner-responsive-design.md).

**Architecture:** `ScannerCard.jsx` becomes camera-only; the manual code input and session history list are extracted into their own small components (`ManualCodeInput.jsx`, `SessionHistoryList.jsx`) so `CheckInPage.jsx` and `KioskOverlay.jsx` can each compose them into a responsive grid (single column under `lg`, camera + side panel at `lg` and up) instead of duplicating markup. The camera fix itself is two independent, localized changes inside `ScannerCard.jsx`'s existing start/stop effect: force the injected `<video>` to responsive (percentage) sizing after start, and serialize camera start/stop across mounts with a module-level lock so Kiosk toggling or switching cameras can never open the same physical device twice at once.

**Tech Stack:** React 19, Vite, Tailwind (utility classes, existing `Button` component's `xl` size for touch targets), `html5-qrcode` (already a dependency, no version change).

## Global Constraints

- No unit-test framework exists for React components in this repo (confirmed in the original [2026-07-04-checkin-access.md](2026-07-04-checkin-access.md) plan). All verification here is manual: Vite dev server + browser (devtools device toolbar for tablet widths at minimum; a real tablet is recommended before calling this done).
- Follow existing conventions: Tailwind utility classes, `@/lib/utils` `cn()` helper, `lucide-react` icons, `useLanguage()` for all user-facing strings, the shared `Button` component ([src/components/common/Button.jsx](../../../src/components/common/Button.jsx)) which already defines an `xl` size (`h-14 px-8 text-lg`, 56px) — use that instead of inventing new heights.
- No i18n keys change in this plan — all existing `admin.checkin.*` strings are reused as-is.
- Do not touch `useTicketCheckIn.js` or the `validate-ticket` backend function — out of scope per the spec.

---

## File Structure

**Modify:**
- `src/components/admin/checkin/ScannerCard.jsx` — camera-sizing fix, start/stop lock, drop manual input (moves out), bump camera-switch button touch target.
- `src/pages/admin/CheckInPage.jsx` — responsive grid composition, pass scanner/manualInput/history into `KioskOverlay`.
- `src/components/admin/checkin/KioskOverlay.jsx` — accept `scanner`/`manualInput`/`history` props, responsive grid, bigger exit button.
- `src/components/admin/checkin/CheckInResultModal.jsx` — bump action button touch targets.

**Create:**
- `src/components/admin/checkin/ManualCodeInput.jsx` — manual/HID code entry, extracted from `ScannerCard.jsx`.
- `src/components/admin/checkin/SessionHistoryList.jsx` — session history list, extracted from `CheckInPage.jsx`.

---

### Task 1: Camera fix — force responsive video sizing

**Files:**
- Modify: `src/components/admin/checkin/ScannerCard.jsx`

**Interfaces:** No prop or exported-signature changes. Purely internal to the start/stop effect.

- [ ] **Step 1: Add a helper that forces the injected `<video>` to fill its container responsively**

In `src/components/admin/checkin/ScannerCard.jsx`, after the `TICKET_CODE_PATTERN` constant (currently line 8), add:

```jsx
const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;

// html5-qrcode sets the injected <video>'s width in fixed pixels (computed
// once, at start time) and never sets a height or re-measures on resize —
// its own inline style always beats our Tailwind classes, and rotating a
// tablet never fixes it. Force it to responsive sizing right after start.
function forceResponsiveVideoSizing(mountElementId) {
  const video = document.querySelector(`#${mountElementId} video`);
  if (!video) return;
  video.style.setProperty("position", "absolute", "important");
  video.style.setProperty("inset", "0", "important");
  video.style.setProperty("width", "100%", "important");
  video.style.setProperty("height", "100%", "important");
  video.style.setProperty("object-fit", "cover", "important");
}
```

- [ ] **Step 2: Call it once the camera actually starts**

Find this block (currently lines 74-87):

```jsx
    const startPromise = scanner
      .start(
        activeCameraId,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onDecoded,
        () => {},
      )
      .then(() => {
        if (!cancelled) setCameraState("active");
      })
      .catch((err) => {
        console.error("ScannerCard: camera failed to start:", err);
        if (!cancelled) setCameraState("error");
      });
```

Change the `.then()` to:

```jsx
      .then(() => {
        if (!cancelled) {
          forceResponsiveVideoSizing(elementId);
          setCameraState("active");
        }
      })
```

- [ ] **Step 3: Manually verify**

Run `npm run dev`, open `/admin/check-in`, grant camera access. Open browser devtools → toggle device toolbar → set a tablet size (e.g. 1024×768) → confirm the video fills the dark camera box edge-to-edge. Resize the devtools viewport (simulating rotation) while the camera is active — confirm the video keeps filling the box at the new size, rather than staying pinned to its original pixel dimensions.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/checkin/ScannerCard.jsx
git commit -m "fix(check-in): force responsive video sizing to stop html5-qrcode's black camera"
```

---

### Task 2: Camera fix — serialize start/stop across mounts

**Files:**
- Modify: `src/components/admin/checkin/ScannerCard.jsx`

**Interfaces:** No prop or exported-signature changes.

- [ ] **Step 1: Add a module-level teardown lock**

At the top of `src/components/admin/checkin/ScannerCard.jsx`, after the `forceResponsiveVideoSizing` function added in Task 1, add:

```jsx
// Serializes camera start/stop across mounts (Kiosk mode fully unmounts and
// remounts ScannerCard on toggle; switching cameras remounts the effect too)
// so two Html5Qrcode instances can never hold the same physical camera
// device concurrently — that race is what makes the feed go black on some
// tablet camera drivers even though start() itself resolves without error.
let pendingCameraTeardown = Promise.resolve();
```

- [ ] **Step 2: Wait on the lock before starting, and update it on cleanup**

Find the effect (currently lines 55-97). Replace:

```jsx
    const startPromise = scanner
      .start(
        activeCameraId,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onDecoded,
        () => {},
      )
      .then(() => {
        if (!cancelled) {
          forceResponsiveVideoSizing(elementId);
          setCameraState("active");
        }
      })
      .catch((err) => {
        console.error("ScannerCard: camera failed to start:", err);
        if (!cancelled) setCameraState("error");
      });

    return () => {
      cancelled = true;
      startPromise
        .then(() => scanner.stop())
        .catch(() => {})
        .then(() => scanner.clear())
        .catch(() => {});
    };
```

with:

```jsx
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
          forceResponsiveVideoSizing(elementId);
          setCameraState("active");
        }
      })
      .catch((err) => {
        console.error("ScannerCard: camera failed to start:", err);
        if (!cancelled) setCameraState("error");
      });

    return () => {
      cancelled = true;
      pendingCameraTeardown = startPromise
        .catch(() => {})
        .then(() => scanner.stop())
        .catch(() => {})
        .then(() => scanner.clear())
        .catch(() => {});
    };
```

- [ ] **Step 3: Manually verify**

With `npm run dev` running and the camera active on `/admin/check-in`, click "Modo Kiosko" then "Salir" several times in a row, and use the camera-switch button (if more than one camera is available) several times in a row. Confirm the feed never sticks on black and the "Iniciando cámara…" state always resolves to "Cámara activa" within a couple seconds each time. Check the browser console for no "camera failed to start" errors during this.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/checkin/ScannerCard.jsx
git commit -m "fix(check-in): serialize camera start/stop across remounts to avoid black-screen race"
```

---

### Task 3: Extract `ManualCodeInput.jsx`

**Files:**
- Create: `src/components/admin/checkin/ManualCodeInput.jsx`
- Modify: `src/components/admin/checkin/ScannerCard.jsx`

**Interfaces:**
- Produces (used by Task 5 and Task 6): `<ManualCodeInput onSubmitCode={(code: string) => void} disabled={boolean} focusToken={number} />` — same `focusToken` re-focus contract `ScannerCard` used to have (increment it to refocus the input, e.g. after the result modal closes).
- `ScannerCard.jsx` no longer accepts `focusToken` — it isn't a manual-input host anymore.

- [ ] **Step 1: Create the component**

Create `src/components/admin/checkin/ManualCodeInput.jsx`:

```jsx
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/components/common/Button";
import { cn } from "@/lib/utils";

export default function ManualCodeInput({
  onSubmitCode,
  disabled = false,
  focusToken = 0,
}) {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const inputRef = useRef(null);

  // Refocus whenever the parent asks (e.g. modal closed).
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [focusToken]);

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
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
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
            "flex-1 h-14 rounded-xl border border-sand-dark bg-white px-4 text-charcoal font-mono text-sm uppercase tracking-wide placeholder:text-charcoal-muted/40 placeholder:normal-case focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-shadow",
            disabled && "opacity-50",
          )}
        />
        <Button
          type="button"
          size="xl"
          disabled={disabled || !code.trim()}
          onClick={submitManual}
        >
          {t("admin.checkin.validate")}
        </Button>
      </div>
    </div>
  );
}
```

Note the input height grows from `h-12` (48px) to `h-14` (56px) and the button from `size="lg"` (48px) to `size="xl"` (56px) — the touch-target bump for this control.

- [ ] **Step 2: Remove the manual input and its supporting state from `ScannerCard.jsx`**

In `src/components/admin/checkin/ScannerCard.jsx`:

Remove these imports (no longer used in this file): `Button` and `cn`. The top of the file changes from:

```jsx
import { useEffect, useRef, useState, useId, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, SwitchCamera, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/components/common/Button";
import { cn } from "@/lib/utils";
```

to:

```jsx
import { useEffect, useRef, useState, useId, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, SwitchCamera, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
```

Change the component signature from:

```jsx
export default function ScannerCard({
  onSubmitCode,
  disabled = false,
  focusToken = 0,
}) {
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

```

to:

```jsx
export default function ScannerCard({ onSubmitCode, disabled = false }) {
  const { t } = useLanguage();
  const elementId = useId().replace(/:/g, "");
  const [cameraState, setCameraState] = useState("starting"); // starting | active | error
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: "", at: 0 });

```

Remove the `submitManual` and `handleKeyDown` functions entirely (currently between `switchCamera` and the `return`):

```jsx
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

```

Change the return statement's outer wrapper and remove the manual-input section. Replace:

```jsx
  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm overflow-hidden max-w-2xl mx-auto">
      {/* ── Camera ─────────────────────────────────────────────── */}
```

with:

```jsx
  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm overflow-hidden">
      {/* ── Camera ─────────────────────────────────────────────── */}
```

And remove the entire "Manual input" section plus its closing tag, i.e. delete from the `{/* ── Manual input ── */}` comment through the `</div>` right before the final `</div>` of the component (currently lines 199-233):

```jsx
      {/* ── Manual input ──────────────────────────────────────── */}
      <div className="p-5">
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
              "flex-1 h-12 rounded-xl border border-sand-dark bg-white px-4 text-charcoal font-mono text-sm uppercase tracking-wide placeholder:text-charcoal-muted/40 placeholder:normal-case focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-shadow",
              disabled && "opacity-50",
            )}
          />
          <Button
            type="button"
            size="lg"
            disabled={disabled || !code.trim()}
            onClick={submitManual}
          >
            {t("admin.checkin.validate")}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

so the file now ends with just the closing tags for the camera `<div>` and the component:

```jsx
      </div>
    </div>
  );
}
```

(The `</div>` that closes the outer wrapper now directly follows the camera box's closing `</div>` — there's exactly one `<div>` left inside the component's return.)

- [ ] **Step 3: Verify the file has no leftover references**

```bash
grep -n "code\b\|inputRef\|submitManual\|handleKeyDown\|focusToken\|cn(\|Button" src/components/admin/checkin/ScannerCard.jsx
```

Expected: no output (all of those were manual-input-only and have been removed; `cameras`/`activeCameraId`/`cameraState` etc. don't match this pattern).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/checkin/ManualCodeInput.jsx src/components/admin/checkin/ScannerCard.jsx
git commit -m "refactor(check-in): extract ManualCodeInput from ScannerCard"
```

---

### Task 4: Extract `SessionHistoryList.jsx`

**Files:**
- Create: `src/components/admin/checkin/SessionHistoryList.jsx`

**Interfaces:**
- Produces (used by Task 5 and Task 6): `<SessionHistoryList history={Array<{ ticketCode: string, outcome: string }>} />`. Renders nothing when `history` is empty.

- [ ] **Step 1: Create the component**

Create `src/components/admin/checkin/SessionHistoryList.jsx`:

```jsx
import { useLanguage } from "@/hooks/useLanguage";

export default function SessionHistoryList({ history }) {
  const { t } = useLanguage();

  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
        {t("admin.checkin.sessionHistory")}
      </h2>
      <div className="space-y-2">
        {history.map((entry, idx) => (
          <div
            key={`${entry.ticketCode}-${idx}`}
            className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between ${
              entry.outcome === "valid" || entry.outcome === "entered"
                ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-800"
                : "bg-red-50/50 border-red-200/60 text-red-800"
            }`}
          >
            <span className="font-mono text-xs">{entry.ticketCode}</span>
            <span className="text-xs">{entry.outcome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

This is a direct extraction of the existing markup in `CheckInPage.jsx` (Task 5 removes it from there) — no visual change yet.

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/checkin/SessionHistoryList.jsx
git commit -m "refactor(check-in): extract SessionHistoryList component"
```

---

### Task 5: Rewire `CheckInPage.jsx` into a responsive grid

**Files:**
- Modify: `src/pages/admin/CheckInPage.jsx`

**Interfaces:**
- Consumes: `ScannerCard` (Task 3, now camera-only), `ManualCodeInput` (Task 3), `SessionHistoryList` (Task 4), `KioskOverlay` (Task 6 changes its props — this task and Task 6 must land together or `KioskOverlay` will receive props it doesn't yet understand; land both before the next manual verification pass).
- Produces: the page rendered at `/admin/check-in` — unchanged route, unchanged external behavior, new internal layout.

- [ ] **Step 1: Replace the file**

Replace the entire contents of `src/pages/admin/CheckInPage.jsx` with:

```jsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketCheckIn } from "@/hooks/useTicketCheckIn";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import ScannerCard from "@/components/admin/checkin/ScannerCard";
import ManualCodeInput from "@/components/admin/checkin/ManualCodeInput";
import SessionHistoryList from "@/components/admin/checkin/SessionHistoryList";
import CheckInResultModal from "@/components/admin/checkin/CheckInResultModal";
import KioskOverlay from "@/components/admin/checkin/KioskOverlay";
import Button from "@/components/common/Button";
import { ScanLine, Maximize2 } from "lucide-react";

const MAX_HISTORY = 10;

export default function CheckInPage() {
  const { state, checkTicket, confirmEntry, reset } = useTicketCheckIn();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [kioskMode, setKioskMode] = useState(false);
  const [focusToken, setFocusToken] = useState(0);

  const bumpFocus = useCallback(() => setFocusToken((n) => n + 1), []);

  const handleSubmitCode = useCallback(
    (code) => {
      checkTicket(code);
    },
    [checkTicket],
  );

  const handleConfirm = useCallback(
    async (ticketCode) => {
      const method = kioskMode ? "kiosk" : "manual";
      const result = await confirmEntry(ticketCode, method);
      if (result) {
        setHistory((prev) => [result, ...prev].slice(0, MAX_HISTORY));
      }
    },
    [confirmEntry, kioskMode],
  );

  const handleScanAnother = useCallback(() => {
    // Record failed/terminal outcomes in session history too, before resetting.
    if (state.phase === "result" && state.data) {
      setHistory((prev) => [state.data, ...prev].slice(0, MAX_HISTORY));
    }
    reset();
    bumpFocus();
  }, [state, reset, bumpFocus]);

  const handleViewDetails = useCallback(
    (ticketId) => {
      navigate(ROUTES.ADMIN_TICKET_DETAIL.replace(":ticketId", ticketId));
    },
    [navigate],
  );

  const handleSearchClient = useCallback(() => {
    navigate(ROUTES.ADMIN_CLIENTS);
  }, [navigate]);

  const disabled = state.phase === "loading" || state.phase === "confirming";

  const scanner = <ScannerCard onSubmitCode={handleSubmitCode} disabled={disabled} />;

  const manualInput = (
    <ManualCodeInput
      onSubmitCode={handleSubmitCode}
      disabled={disabled}
      focusToken={focusToken}
    />
  );

  const modal = (
    <CheckInResultModal
      state={state}
      onConfirm={handleConfirm}
      onScanAnother={handleScanAnother}
      onViewDetails={handleViewDetails}
      onSearchClient={handleSearchClient}
    />
  );

  if (kioskMode) {
    return (
      <KioskOverlay
        onExit={() => setKioskMode(false)}
        scanner={scanner}
        manualInput={manualInput}
        history={history}
      >
        {modal}
      </KioskOverlay>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sage/10 flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-sage" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
              {t("admin.checkin.title")}
            </h1>
            <p className="text-sm text-charcoal-muted">{t("admin.checkin.subtitle")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setKioskMode(true)}>
          <Maximize2 className="h-4 w-4 mr-1.5" />
          {t("admin.checkin.kioskEnter")}
        </Button>
      </div>

      {/* Camera on top under lg, side-by-side with manual input + history at lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
        {scanner}
        <div className="flex flex-col gap-6">
          {manualInput}
          <SessionHistoryList history={history} />
        </div>
      </div>

      {modal}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/CheckInPage.jsx
git commit -m "feat(check-in): responsive grid layout for CheckInPage (camera + side panel at lg)"
```

---

### Task 6: Rewire `KioskOverlay.jsx` into a responsive grid

**Files:**
- Modify: `src/components/admin/checkin/KioskOverlay.jsx`

**Interfaces:**
- Consumes: `SessionHistoryList` (Task 4).
- Produces: `<KioskOverlay onExit={() => void} scanner={ReactNode} manualInput={ReactNode} history={Array} >{children}</KioskOverlay>` — `children` (Task 5 passes the result modal) render after the grid, `scanner`/`manualInput` are placed in the grid, `history` renders in the side panel only at `lg` and up (matches the spec: Kiosk stays camera+input-only below `lg`).

- [ ] **Step 1: Replace the file**

Replace the entire contents of `src/components/admin/checkin/KioskOverlay.jsx` with:

```jsx
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import SessionHistoryList from "@/components/admin/checkin/SessionHistoryList";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function KioskOverlay({
  onExit,
  scanner,
  manualInput,
  history,
  children,
}) {
  const { t, language } = useLanguage();
  const now = useClock();

  const clock = now.toLocaleTimeString(language === "es" ? "es-MX" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateLabel = now.toLocaleDateString(language === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#F4F1EA]">
      <div className="flex items-center justify-between px-8 py-5 border-b border-sand-dark/40 bg-white/70 backdrop-blur">
        <span className="font-display text-2xl font-semibold tracking-wide text-charcoal">
          OMZONE
        </span>
        <div className="text-center">
          <div className="font-display text-3xl font-semibold text-charcoal leading-none">
            {clock}
          </div>
          <div className="text-xs text-charcoal-muted mt-1 capitalize">{dateLabel}</div>
        </div>
        <button
          onClick={onExit}
          className="h-14 px-6 rounded-xl border border-sand-dark bg-white text-sm font-semibold text-charcoal hover:bg-warm-gray transition-colors cursor-pointer"
        >
          {t("admin.checkin.kioskExit")}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
          {scanner}
          <div className="flex flex-col gap-6">
            {manualInput}
            <div className="hidden lg:block">
              <SessionHistoryList history={history} />
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
```

Changes from the previous version: `onExit` button grows from `h-10 px-4` to `h-14 px-6` (touch target); the single centered `max-w-xl` column is replaced by the same `lg`-responsive grid used in `CheckInPage.jsx`; `history` only renders (via `SessionHistoryList`) inside a `hidden lg:block` wrapper, so it's invisible below `lg` and visible in the side panel at `lg` and up, per the approved spec.

- [ ] **Step 2: Manually verify both pages together**

With `npm run dev` running:
1. At a desktop-width viewport, open `/admin/check-in`, confirm camera + manual input + (once you scan something) history all render stacked in one column same as before visually (single-column grid).
2. Resize devtools to a landscape-tablet width (≥1024px), confirm the layout switches to two columns: camera on the left, manual input + history stacked on the right.
3. Click "Modo Kiosco" at the landscape width — confirm the Kiosk overlay shows the same two-column layout with history visible in the side panel.
4. Shrink to a portrait-tablet width (<1024px) while still in Kiosk mode — confirm it collapses to camera-then-manual-input, with history hidden (not just scrolled off — actually absent from the DOM output visually, i.e. no empty gap).
5. Exit Kiosk mode, confirm you land back on the normal page with the grid still correct at whatever width you're at.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/checkin/KioskOverlay.jsx
git commit -m "feat(check-in): responsive grid layout for KioskOverlay, show session history at lg"
```

---

### Task 7: Touch targets — camera switch button and result modal actions

**Files:**
- Modify: `src/components/admin/checkin/ScannerCard.jsx`
- Modify: `src/components/admin/checkin/CheckInResultModal.jsx`

**Interfaces:** No signature changes — purely visual sizing.

- [ ] **Step 1: Bump the camera-switch button in `ScannerCard.jsx`**

Find (currently near the end of the component, in the "Camera switch" section):

```jsx
            className="absolute top-4 right-4 z-20 h-9 w-9 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          >
            <SwitchCamera className="h-4 w-4" />
```

Replace with:

```jsx
            className="absolute top-4 right-4 z-20 h-12 w-12 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          >
            <SwitchCamera className="h-5 w-5" />
```

- [ ] **Step 2: Bump the result-modal action buttons in `CheckInResultModal.jsx`**

Find the "entered" phase's scan-another button:

```jsx
                <button
                  onClick={onScanAnother}
                  className="w-full h-12 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors cursor-pointer"
                >
                  {t("admin.checkin.scanAnother")}
                </button>
```

Change `h-12` to `h-14`.

Find the "valid" group's confirm-entry button:

```jsx
                    {group === "valid" && (
                      <button
                        onClick={() => onConfirm(data.ticketCode)}
                        className="w-full h-12 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors cursor-pointer"
                      >
                        {t("admin.checkin.confirmEntry")}
                      </button>
                    )}
```

Change `h-12` to `h-14`.

Find the button group wrapper and its two/three buttons:

```jsx
                    <div className="flex gap-2.5">
                      {group === "valid" && data.ticket?.ticketId && (
                        <button
                          onClick={() => onViewDetails(data.ticket.ticketId)}
                          className="flex-1 h-11 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                        >
                          {t("admin.checkin.viewDetails")}
                        </button>
                      )}
                      {group === "invalid" && (
                        <button
                          onClick={onSearchClient}
                          className="flex-1 h-11 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                        >
                          {t("admin.checkin.searchClient")}
                        </button>
                      )}
                      <button
                        onClick={onScanAnother}
                        className="flex-1 h-11 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                      >
                        {t("admin.checkin.scanAnother")}
                      </button>
                    </div>
```

Replace with (gap widened `2.5`→`3`, all three buttons `h-11`→`h-14`):

```jsx
                    <div className="flex gap-3">
                      {group === "valid" && data.ticket?.ticketId && (
                        <button
                          onClick={() => onViewDetails(data.ticket.ticketId)}
                          className="flex-1 h-14 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                        >
                          {t("admin.checkin.viewDetails")}
                        </button>
                      )}
                      {group === "invalid" && (
                        <button
                          onClick={onSearchClient}
                          className="flex-1 h-14 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                        >
                          {t("admin.checkin.searchClient")}
                        </button>
                      )}
                      <button
                        onClick={onScanAnother}
                        className="flex-1 h-14 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                      >
                        {t("admin.checkin.scanAnother")}
                      </button>
                    </div>
```

Also widen the outer button-column gap right above it — find:

```jsx
                  <div className="flex flex-col gap-2.5 pt-2">
```

Change to:

```jsx
                  <div className="flex flex-col gap-3 pt-2">
```

- [ ] **Step 3: Manually verify**

At a tablet-width viewport with devtools' touch emulation on, confirm the camera-switch icon button and every result-modal action button now measure at least 48px tall (use devtools' element inspector box size) and have visibly more breathing room between adjacent buttons.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/checkin/ScannerCard.jsx src/components/admin/checkin/CheckInResultModal.jsx
git commit -m "feat(check-in): bigger touch targets for camera switch and result modal actions"
```

---

### Task 8: Full manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Regression-check the existing check-in flows**

Using real ticket codes/status from `omzone-dev` (same procedure as the original [2026-07-04-checkin-access.md](2026-07-04-checkin-access.md) plan's Task 8), confirm every outcome still works after this refactor: valid → confirm entry → entered; already-used; cancelled; expired; not-found; outside schedule window. Confirm "Ver detalles" and "Buscar cliente" still navigate correctly.

- [ ] **Step 2: Camera fix verification**

On an actual tablet (or, at minimum, devtools device emulation plus one real mobile/tablet device if available): load `/admin/check-in` fresh, grant camera permission, confirm the feed shows a live image (not black) within a couple seconds. Physically rotate the tablet (or resize the emulated viewport) while the camera is active and confirm the picture keeps filling the frame correctly at the new orientation. Enter and exit Kiosk mode 3+ times in a row and switch cameras (if the device has more than one) 3+ times in a row — confirm the feed never sticks on black in any of these transitions.

- [ ] **Step 3: Responsive layout verification**

At portrait-tablet width (<1024px, both in normal mode and Kiosk mode): confirm camera on top, manual input below it, session history further below (hidden entirely in Kiosk mode per design) — no horizontal scrolling, no clipped content.
At landscape-tablet width (≥1024px, both modes): confirm the two-column grid — camera left, manual input + history right, both fully visible without scrolling in a typical tablet viewport height.

- [ ] **Step 4: Report results to the user**

Summarize which scenarios passed/failed before considering this plan complete. If a real tablet wasn't available for Step 2, say so explicitly rather than claiming it was verified.

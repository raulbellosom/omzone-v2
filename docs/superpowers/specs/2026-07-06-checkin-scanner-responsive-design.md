# Check-in scanner: camera fix + tablet-responsive redesign

**Date:** 2026-07-06
**Status:** Approved

## Context

The check-in module ([docs/superpowers/specs/2026-07-04-checkin-access-design.md](2026-07-04-checkin-access-design.md)) ships [ScannerCard.jsx](../../../src/components/admin/checkin/ScannerCard.jsx), [CheckInPage.jsx](../../../src/pages/admin/CheckInPage.jsx), and [KioskOverlay.jsx](../../../src/components/admin/checkin/KioskOverlay.jsx). It will be used primarily on tablets, in both portrait and landscape, and users report the camera preview showing solid black even after granting camera permission — reproducible on first load, on camera switch, and on Kiosk toggle, in both dev and production builds.

**Root cause (verified in `node_modules/html5-qrcode/src/camera/core-impl.ts`):** `RenderedCameraImpl.createVideoElement()` sets `videoElement.style.width = "${parentElement.clientWidth}px"` once, at construction time, and never sets a height or re-measures on resize. This inline style always wins over the Tailwind classes on the mount div ([ScannerCard.jsx:129](../../../src/components/admin/checkin/ScannerCard.jsx#L129): `[&_video]:w-full [&_video]:h-full [&_video]:object-cover`), since inline `style` beats a class selector regardless of Tailwind's arbitrary-variant syntax. If the container's width at the moment `Html5Qrcode.start()` resolves doesn't match its later rendered width — layout not yet settled, or (more importantly) a tablet rotation after mount — the actual `<video>` only fills a fixed pixel box while the rest of the frame shows the container's own near-black background (`bg-[#0c0e13]`), which reads as "the camera is black." Rotating the tablet never fixes this, since nothing re-measures the video afterward.

A second, related defect: [ScannerCard.jsx:89-96](../../../src/components/admin/checkin/ScannerCard.jsx#L89-L96) sequences `scanner.stop()` after `startPromise` settles on cleanup, but doesn't block the *next* effect run's `new Html5Qrcode(...).start()` from beginning concurrently (React doesn't await cleanup functions). `CheckInPage.jsx`'s Kiosk toggle ([CheckInPage.jsx:81-88](../../../src/pages/admin/CheckInPage.jsx#L81-L88)) renders a structurally different JSX root depending on `kioskMode`, so `ScannerCard` fully unmounts and remounts on every Kiosk enter/exit — the exact scenario that triggers this race, on real devices, not just under React StrictMode's dev-only double-invoke.

Separately, the module needs a genuine responsive redesign: it currently assumes a desktop-width, mouse-driven layout (`max-w-2xl mx-auto`, default-size buttons) with no adaptation for tablet touch targets, portrait vs. landscape space, or a side-by-side layout when width allows it. Kiosk mode currently never shows the session history list (it's normal-mode-only, in `CheckInPage.jsx`'s non-kiosk branch).

## Decision

### 1. Camera fix — force responsive video sizing + lock the start/stop lifecycle

> **Update (post-ship):** the fix actually shipped differs from what's described below — see the "Post-ship correction" note at the end of this section. The original plan (forcing `width/height: 100%` or relying on `position: absolute; inset: 0` alone) turned out to be insufficient: live DOM inspection on a real device showed the video's `getBoundingClientRect().height` collapsing to exactly `0` even with those styles applied, because the mount element's own height — inherited via `inset: 0` from an `aspect-ratio`-sized ancestor — isn't treated as "definite" for a descendant's stretch/percentage sizing at this nesting depth in the browsers tested, despite that ancestor clearly rendering with a real size on screen. The stream itself was always healthy (`videoWidth`/`videoHeight`/`readyState` all correct) — only the CSS-derived box height was broken.

In `ScannerCard.jsx`, right after `scanner.start(...)` resolves (before `setCameraState("active")`), query the mount element for the `<video>` html5-qrcode inserted and force, via `element.style.setProperty(prop, value, "important")`:
```
position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
```
Using `!important` on an inline style beats html5-qrcode's own inline `width: Npx`. Because these are percentage/keyword values (not pixels), the video stays correctly sized across any container resize — including tablet rotation — with no resize listener needed.

**Post-ship correction:** the shipped fix measures the container's real rendered box with `getBoundingClientRect()` in JS and sets explicit **pixel** `width`/`height` on the video (bypassing the percentage/stretch ambiguity entirely), kept in sync across resizes/rotation via a `ResizeObserver` that's disconnected in the effect's cleanup. This was reached by testing the percentage and inset-only approaches live on a real device via the browser console — both left `getBoundingClientRect().height === 0` on the actual video element — before landing on direct pixel measurement as the reliable fix. See `ScannerCard.jsx`'s `forceResponsiveVideoSizing` for the final implementation.

Harden the start/stop lifecycle with a module-external or ref-based async lock: track an in-flight teardown promise in a ref that persists across the `activeCameraId`/mount effect; before calling `new Html5Qrcode(elementId).start(...)`, `await` any pending teardown from a previous instance so two `Html5Qrcode` instances can never hold the same physical camera device concurrently. This applies uniformly to first mount, camera switch, and Kiosk mode's full remount.

### 2. Responsive layout system

Breakpoints are driven by **container width**, not `orientation:` media queries — this correctly handles normal mode (admin sidebar eats horizontal space even in device-landscape) and Kiosk mode (truly full-screen) with the same rules:
- `< md` (~768px, e.g. phone or a squeezed window): single column, camera on top, manual input below, then history — scrollable.
- `md` (portrait tablet, ~768–1024px, or a narrow normal-mode window): same single-column stack, but larger camera area and touch-sized controls.
- `≥ lg` (landscape tablet ~1024px+, or Kiosk in landscape, or a wide normal-mode window): two-column grid — camera in a fixed-ratio left column, a persistent right side panel (manual input + session history) that never requires scrolling to reach.

This applies identically in `CheckInPage.jsx`'s normal-mode branch and inside `KioskOverlay.jsx`.

### 3. Component changes

- **`ScannerCard.jsx`**: drop the fixed `max-w-2xl mx-auto` wrapper (sizing now comes from the parent grid). Split the manual-input block out into a new `ManualCodeInput.jsx` (props: `code`, `onChange`, `onSubmit`, `disabled`, `inputRef`) so it can be composed either below the camera (stacked layouts) or inside the side panel (`lg` layout), without duplicating markup.
- **New `src/components/admin/checkin/SessionHistoryList.jsx`**: extracted from the inline history block currently in `CheckInPage.jsx` ([CheckInPage.jsx:115-136](../../../src/pages/admin/CheckInPage.jsx#L115-L136)), taking `history: Array<result>` as a prop. Used by both `CheckInPage.jsx` (normal mode) and `KioskOverlay.jsx` (Kiosk mode, `lg` side panel only — Kiosk's narrower/portrait layout stays camera+input only, no history, to avoid crowding a stacked touch layout).
- **`CheckInPage.jsx`**: `history` state is lifted so it's readable regardless of `kioskMode` (it already lives in this component — no relocation needed, just passed down to `KioskOverlay` too). Layout becomes a responsive grid: `grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6`, left = `ScannerCard`'s camera, right (only at `lg`) = `ManualCodeInput` + `SessionHistoryList`. Below `lg`, `ManualCodeInput` stays attached under the camera (inside `ScannerCard`'s own stacked layout) and `SessionHistoryList` renders full-width beneath.
- **`KioskOverlay.jsx`**: gains a `history` prop, passed from `CheckInPage.jsx`. Applies the same `lg` two-column grid inside its centered content area; below `lg` it keeps today's single centered column (camera + manual input, no history).

### 4. Touch targets

All interactive controls in this module (confirm/scan-another/view-details/search-client buttons in `CheckInResultModal.jsx`, the camera-switch button, Kiosk's exit button, the manual-input submit button) grow to a minimum ~48–56px hit area with increased spacing between adjacent controls, replacing the current desktop-sized (`h-9`–`h-11`) controls. This applies in both normal and Kiosk mode, since both are in scope for tablet use.

### 5. Out of scope

- No changes to `useTicketCheckIn.js` or the `validate-ticket` backend function — this is a frontend rendering/layout/reliability fix only.
- No change to the physical HID scanner flow (manual input already handles it; unaffected by this work).
- Not swapping `html5-qrcode` for a different camera library — the DOM-override fix is lower-risk and sufficient (see the two approaches weighed with the user; a library swap was explicitly declined as higher-risk for this iteration).

## Verification

No test framework exists for frontend components in this repo (confirmed by the original check-in spec). Verification is manual: run the Vite dev server, exercise `/admin/check-in` in both normal and Kiosk mode, at both portrait and landscape tablet widths (via browser devtools device toolbar at minimum; a real tablet smoke test is recommended before considering this done, per the user's primary complaint being tablet-specific). Confirm the camera fills its container at every breakpoint, survives a simulated rotation (resize while active), and that toggling Kiosk mode or switching cameras repeatedly never leaves the feed black.

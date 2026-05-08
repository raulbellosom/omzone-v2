import { useCallback, useState } from "react";

// sage: #7c8c6e, charcoal: #2c2c2c

function roundedRect(ctx, x, y, w, h, r) {
  const safeR = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeR, y);
  ctx.arcTo(x + w, y, x + w, y + h, safeR);
  ctx.arcTo(x + w, y + h, x, y + h, safeR);
  ctx.arcTo(x, y + h, x, y, safeR);
  ctx.arcTo(x, y, x + w, y, safeR);
  ctx.closePath();
}

/**
 * Draw text with wrapping. Returns the Y position after the last line.
 */
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
  }
  return currentY;
}

/**
 * Draw a small info row with a square dot accent.
 */
function drawInfoRow(ctx, value, x, y, W) {
  if (!value) return y;
  ctx.font = '13px "Inter", -apple-system, Arial, sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.60)";
  ctx.textAlign = "center";
  // Truncate if too wide
  let text = value;
  while (ctx.measureText(text).width > W - 48 && text.length > 10) {
    text = text.slice(0, -4) + "…";
  }
  ctx.fillText(text, x, y);
  return y + 22;
}

export function useTicketPassDownload() {
  const [downloading, setDownloading] = useState(false);

  /**
   * @param {object} ticket  - Appwrite ticket document
   * @param {object} snap    - Parsed ticketSnapshot object
   * @param {string} language - "en" | "es"
   */
  const downloadPass = useCallback(async (ticket, snap, language = "en") => {
    if (!ticket?.ticketCode) return;
    setDownloading(true);

    try {
      const W = 390;
      const H = 730;
      const DPR = 2;

      const canvas = document.createElement("canvas");
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      const ctx = canvas.getContext("2d");
      ctx.scale(DPR, DPR);

      // ── BACKGROUND ────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#1a1e1b");
      bg.addColorStop(0.4, "#1e2520");
      bg.addColorStop(1, "#141714");
      roundedRect(ctx, 0, 0, W, H, 22);
      ctx.fillStyle = bg;
      ctx.fill();

      // Subtle radial glow
      const glow = ctx.createRadialGradient(W / 2, 260, 0, W / 2, 260, 300);
      glow.addColorStop(0, "rgba(124, 140, 110, 0.07)");
      glow.addColorStop(1, "rgba(124, 140, 110, 0)");
      roundedRect(ctx, 0, 0, W, H, 22);
      ctx.fillStyle = glow;
      ctx.fill();

      // ── TOP SAGE BAR ──────────────────────────────────────────
      roundedRect(ctx, 28, 0, W - 56, 3, 1.5);
      ctx.fillStyle = "#7c8c6e";
      ctx.fill();

      // ── WORDMARK ──────────────────────────────────────────────
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = 'bold 19px "Playfair Display", Georgia, serif';
      ctx.fillText("OMZONE", W / 2, 46);

      ctx.font = '11px "Inter", -apple-system, Arial, sans-serif';
      ctx.fillStyle = "#7c8c6e";
      ctx.fillText("Wellness Experience Pass", W / 2, 65);

      // ── SEPARATOR ─────────────────────────────────────────────
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(32, 80);
      ctx.lineTo(W - 32, 80);
      ctx.stroke();

      // ── EXPERIENCE NAME ───────────────────────────────────────
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = 'bold 23px "Playfair Display", Georgia, serif';
      ctx.textAlign = "center";
      const expName = snap?.experienceName || "Experience";
      const nameEndY = drawWrappedText(ctx, expName, W / 2, 113, W - 56, 31);

      // ── INFO ROWS ─────────────────────────────────────────────
      let infoY = nameEndY + 26;

      if (snap?.editionName) {
        ctx.font = '13px "Inter", -apple-system, Arial, sans-serif';
        ctx.fillStyle = "#7c8c6e";
        ctx.textAlign = "center";
        ctx.fillText(snap.editionName, W / 2, infoY);
        infoY += 22;
      }

      const dateISO =
        snap?.slotStartDatetime || snap?.slotDate || snap?.editionDate;
      if (dateISO) {
        const d = new Date(dateISO);
        const locale = language === "es" ? "es-MX" : "en-US";
        const dateStr = d.toLocaleDateString(locale, {
          weekday: "short",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        infoY = drawInfoRow(ctx, dateStr, W / 2, infoY, W);
      }

      const slotTime =
        snap?.slotTime ||
        (() => {
          const dtISO = snap?.slotStartDatetime || snap?.slotDate;
          if (!dtISO) return null;
          try {
            return new Date(dtISO).toLocaleTimeString(
              language === "es" ? "es-MX" : "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              },
            );
          } catch {
            return null;
          }
        })();
      if (slotTime) {
        infoY = drawInfoRow(ctx, slotTime, W / 2, infoY, W);
      }

      if (snap?.locationName) {
        ctx.font = '12px "Inter", -apple-system, Arial, sans-serif';
        ctx.fillStyle = "rgba(255,255,255,0.42)";
        ctx.textAlign = "center";
        const locationLine = snap.roomName
          ? `${snap.locationName} · ${snap.roomName}`
          : snap.locationName;
        ctx.fillText(locationLine, W / 2, infoY);
        infoY += 20;
      }

      const participant = ticket.participantName || snap?.participantName;
      if (participant) {
        ctx.font = '12px "Inter", -apple-system, Arial, sans-serif';
        ctx.fillStyle = "rgba(255,255,255,0.38)";
        ctx.textAlign = "center";
        ctx.fillText(participant, W / 2, infoY);
        infoY += 20;
      }

      // ── QR SECTION ────────────────────────────────────────────
      const qrSize = 172;
      const qrPad = 18;
      const qrCardW = qrSize + qrPad * 2;
      const qrCardX = (W - qrCardW) / 2;
      const qrCardY = Math.max(infoY + 18, 272);

      // White card shadow
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 6;
      roundedRect(ctx, qrCardX, qrCardY, qrCardW, qrSize + qrPad * 2, 18);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      // Draw QR code
      try {
        const { default: QRCodeLib } = await import("qrcode");
        const qrDataUrl = await QRCodeLib.toDataURL(ticket.ticketCode, {
          width: qrSize * DPR,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#1a1e1b", light: "#FFFFFF" },
        });
        const qrImg = new Image();
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrDataUrl;
        });
        ctx.drawImage(qrImg, qrCardX + qrPad, qrCardY + qrPad, qrSize, qrSize);
      } catch {
        // Fallback: grey placeholder
        ctx.fillStyle = "#e8e8e8";
        ctx.fillRect(qrCardX + qrPad, qrCardY + qrPad, qrSize, qrSize);
      }

      // Ticket code below QR card
      const codeY = qrCardY + qrSize + qrPad * 2 + 24;
      ctx.font =
        '12px "Courier New", "Courier", "SFMono-Regular", Consolas, monospace';
      ctx.fillStyle = "rgba(255,255,255,0.50)";
      ctx.textAlign = "center";
      ctx.fillText(ticket.ticketCode, W / 2, codeY);

      // ── TEAR LINE ─────────────────────────────────────────────
      const tearY = H - 82;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(38, tearY);
      ctx.lineTo(W - 38, tearY);
      ctx.stroke();
      ctx.restore();

      // Perforation circles
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(-1, tearY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W + 1, tearY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── FOOTER ────────────────────────────────────────────────
      ctx.textAlign = "center";
      ctx.font = '10px "Inter", -apple-system, Arial, sans-serif';
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillText("OMZONE · Wellness Experiences", W / 2, tearY + 20);
      ctx.fillText("omzone.mx", W / 2, tearY + 38);

      // Bottom sage bar
      roundedRect(ctx, 28, H - 4, W - 56, 3, 1.5);
      ctx.fillStyle = "#7c8c6e";
      ctx.fill();

      // ── DOWNLOAD ──────────────────────────────────────────────
      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve();
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `omzone-ticket-${ticket.ticketCode}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        }, "image/png");
      });
    } finally {
      setDownloading(false);
    }
  }, []);

  return { downloadPass, downloading };
}

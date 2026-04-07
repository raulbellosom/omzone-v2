import { QRCodeSVG } from "qrcode.react";

/**
 * Shared QR code component for ticket codes.
 * Renders an SVG QR code with OMZONE branding colors.
 *
 * @param {string} value - The ticket code to encode
 * @param {number} size - QR code size in px (default 200)
 * @param {string} className - Additional CSS classes
 */
export default function TicketQR({ value, size = 200, className = "" }) {
  if (!value) return null;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        bgColor="#FFFFFF"
        fgColor="#2D2D2D"
        includeMargin
      />
    </div>
  );
}

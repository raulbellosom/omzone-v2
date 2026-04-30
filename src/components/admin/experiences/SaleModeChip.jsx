import { useLanguage } from "@/hooks/useLanguage";

export default function SaleModeChip({ saleMode }) {
  const { t } = useLanguage();
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warm-gray-dark/20 text-charcoal-muted border border-warm-gray-dark/35">
      {t(`admin.experienceSaleModes.${saleMode}`) || saleMode}
    </span>
  );
}

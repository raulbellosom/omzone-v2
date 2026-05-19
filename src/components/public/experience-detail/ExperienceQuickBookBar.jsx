import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useLanguage, localizedField } from "@/hooks/useLanguage";

const SALE_MODE_CONFIG = {
  direct: {
    ctaKey: "experienceCTA.bookNow",
    icon: ArrowRight,
    action: "checkout",
  },
  request: {
    ctaKey: "experienceCTA.requestInfo",
    icon: MessageCircle,
    action: "scroll",
    scrollTarget: "booking-request-form",
  },
};

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ExperienceQuickBookBar({
  experience,
  pricingTiers = [],
  hasEditions = false,
}) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [visible, setVisible] = useState(false);

  const config =
    SALE_MODE_CONFIG[experience?.saleMode] ?? SALE_MODE_CONFIG.direct;
  const Icon = config.icon;

  const minTier =
    pricingTiers.length > 0
      ? pricingTiers.reduce(
          (min, tier) => (tier.basePrice < min.basePrice ? tier : min),
          pricingTiers[0],
        )
      : null;

  // Show bar after the user scrolls ~120px — early enough to be useful
  // throughout the whole reading experience, not just near the bottom.
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 120);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleCTA() {
    if (config.action === "checkout") {
      if (hasEditions) {
        const target = document.getElementById("editions");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      navigate(
        `${ROUTES.CHECKOUT}?experienceId=${experience.$id}&slug=${experience.slug}`,
      );
    } else if (config.action === "scroll") {
      const target = document.getElementById(config.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // fallback scroll to bottom
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }

  const experienceName = experience
    ? localizedField(experience, "publicName", language)
    : "";

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        // Only on mobile — desktop has sticky sidebar
        "lg:hidden fixed bottom-0 inset-x-0 z-40",
        // Transition: slide up from bottom
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      {/* Ambient blur backdrop */}
      <div className="bg-white/90 backdrop-blur-md border-t border-sand shadow-[0_-4px_24px_rgba(44,44,44,0.08)]">
        {/* Safe area padding for bottom notch */}
        <div className="px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            {/* Left: name + price */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold text-charcoal leading-tight truncate"
                title={experienceName}
              >
                {experienceName}
              </p>
              {minTier ? (
                <p className="text-xs text-charcoal-muted mt-0.5">
                  <span className="text-charcoal-subtle">
                    {language === "es" ? "Desde" : "From"}
                  </span>{" "}
                  <span className="font-semibold text-charcoal">
                    {formatPrice(minTier.basePrice, minTier.currency)}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-charcoal-subtle mt-0.5 italic">
                  {language === "es"
                    ? "Consultar precio"
                    : "Inquire for pricing"}
                </p>
              )}
            </div>

            {/* Right: CTA */}
            <Button
              type="button"
              variant="default"
              size="md"
              onClick={handleCTA}
              className="shrink-0 gap-1.5 pl-5 pr-4"
              aria-label={t(config.ctaKey)}
            >
              {t(config.ctaKey)}
              <Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

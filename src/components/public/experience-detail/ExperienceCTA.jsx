import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useLanguage, localizedField } from "@/hooks/useLanguage";

const CTA_CONFIG = {
  direct: {
    labelKey: "experienceCTA.bookNow",
    sublabelKey: "experienceCTA.bookNowSub",
    icon: ArrowRight,
    variant: "default",
    action: "checkout",
  },
  request: {
    labelKey: "experienceCTA.requestInfo",
    sublabelKey: "experienceCTA.requestInfoSub",
    icon: MessageCircle,
    variant: "outline",
    action: "placeholder",
  },
  assisted: {
    labelKey: "experienceCTA.checkAvailability",
    sublabelKey: "experienceCTA.checkAvailabilitySub",
    icon: Calendar,
    variant: "outline",
    action: "placeholder",
  },
  pass: {
    labelKey: "experienceCTA.viewPasses",
    sublabelKey: "experienceCTA.viewPassesSub",
    icon: Ticket,
    variant: "outline",
    action: "passes",
  },
};

export default function ExperienceCTA({
  experience,
  className,
}) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const config = CTA_CONFIG[experience.saleMode] ?? CTA_CONFIG.direct;
  const Icon = config.icon;

  function handleClick() {
    if (config.action === "checkout") {
      navigate(
        `${ROUTES.CHECKOUT}?experienceId=${experience.$id}&slug=${experience.slug}`,
      );
    } else if (config.action === "passes") {
      navigate(`${ROUTES.PASSES}?experience=${experience.$id}`);
    }
    // Other modes are placeholders for now
  }

  return (
    <section
      className={cn(
        "py-12 md:py-16 bg-sage/5 border-t border-sage/20",
        className,
      )}
    >
      <div className="container-shell text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-2">
          {t("experienceCTA.readyTo").replace(
            "{name}",
            localizedField(experience, "publicName", language),
          )}
        </h2>
        <p className="text-charcoal-muted mb-8 max-w-xl mx-auto">
          {t(config.sublabelKey)}
        </p>

        <Button
          type="button"
          variant={config.variant}
          size="lg"
          onClick={handleClick}
          className="min-w-48"
        >
          <Icon className="h-5 w-5" />
          {t(config.labelKey)}
        </Button>
      </div>
    </section>
  );
}

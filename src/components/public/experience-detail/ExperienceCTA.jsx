import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const CTA_CONFIG = {
  direct: {
    label: "Book Now",
    sublabel: "Secure your spot today",
    icon: ArrowRight,
    variant: "default",
    action: "checkout",
  },
  request: {
    label: "Request Information",
    sublabel: "We'll get back to you shortly",
    icon: MessageCircle,
    variant: "outline",
    action: "placeholder",
  },
  assisted: {
    label: "Check Availability",
    sublabel: "Speak with our team",
    icon: Calendar,
    variant: "outline",
    action: "placeholder",
  },
  pass: {
    label: "View Available Passes",
    sublabel: "Use your existing pass",
    icon: Ticket,
    variant: "outline",
    action: "placeholder",
  },
};

export default function ExperienceCTA({ experience, className }) {
  const navigate = useNavigate();
  const config = CTA_CONFIG[experience.saleMode] ?? CTA_CONFIG.direct;
  const Icon = config.icon;

  function handleClick() {
    if (config.action === "checkout") {
      navigate(`${ROUTES.CHECKOUT}?experienceId=${experience.$id}&slug=${experience.slug}`);
    }
    // Other modes are placeholders for now
  }

  return (
    <section className={cn("py-12 md:py-16 bg-sage/5 border-t border-sage/20", className)}>
      <div className="container-shell text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-2">
          Ready to experience {experience.publicName}?
        </h2>
        <p className="text-charcoal-muted mb-8 max-w-xl mx-auto">{config.sublabel}</p>

        <Button
          type="button"
          variant={config.variant}
          size="lg"
          onClick={handleClick}
          className="min-w-48"
        >
          <Icon className="h-5 w-5" />
          {config.label}
        </Button>
      </div>
    </section>
  );
}

import { useLanguage } from "@/hooks/useLanguage";
import { Mail, MapPin, Instagram, Facebook } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Instagram, href: "https://instagram.com/omzone.wellness", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/omzone.wellness", label: "Facebook" },
];

export default function ContactInfo() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <h2 className="font-display text-xl font-semibold text-charcoal">
        {t("contact.info.title")}
      </h2>

      {/* Email */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sage/10 flex items-center justify-center">
          <Mail className="h-5 w-5 text-sage" />
        </div>
        <div>
          <p className="text-sm font-medium text-charcoal">{t("contact.info.emailLabel")}</p>
          <a
            href={`mailto:${t("contact.info.email")}`}
            className="text-sm text-charcoal-muted hover:text-sage transition-colors"
          >
            {t("contact.info.email")}
          </a>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sage/10 flex items-center justify-center">
          <MapPin className="h-5 w-5 text-sage" />
        </div>
        <div>
          <p className="text-sm font-medium text-charcoal">{t("contact.info.locationLabel")}</p>
          <p className="text-sm text-charcoal-muted">
            {t("contact.info.location")}
          </p>
        </div>
      </div>

      {/* Social */}
      <div>
        <p className="text-sm font-medium text-charcoal mb-3">{t("contact.info.socialLabel")}</p>
        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="h-10 w-10 rounded-full border border-sand bg-white flex items-center justify-center text-charcoal-muted hover:text-sage hover:border-sage/40 transition-colors"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

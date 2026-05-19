import { useNavigate } from "react-router-dom";
import { Calendar, Users, Clock } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import { useLanguage, localizedField } from "@/hooks/useLanguage";

function formatDateRange(startDate, endDate, language) {
  if (!startDate) return null;
  const locale = language === "es" ? "es-MX" : "en-US";
  const start = new Date(startDate);
  const startStr = start.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!endDate) return startStr;
  const end = new Date(endDate);
  const sameYear = start.getFullYear() === end.getFullYear();
  const endStr = end.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
  return `${startStr} — ${endStr}`;
}

function isRegistrationOpenNow(opens, closes) {
  const now = Date.now();
  if (opens && new Date(opens).getTime() > now) return false;
  if (closes && new Date(closes).getTime() < now) return false;
  return true;
}

export default function EditionCard({ edition, experience }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const name = localizedField(edition, "name", language) || edition.name;
  const description =
    localizedField(edition, "description", language) || edition.description;
  const dateRange = formatDateRange(
    edition.startDate,
    edition.endDate,
    language,
  );
  const heroFileId = edition.heroImageId || experience.heroImageId;
  const regOpen = isRegistrationOpenNow(
    edition.registrationOpens,
    edition.registrationCloses,
  );

  const handleBook = () => {
    navigate(
      `${ROUTES.CHECKOUT}?experienceId=${experience.$id}&editionId=${edition.$id}&slug=${experience.slug}`,
    );
  };

  return (
    <article className="group flex flex-col rounded-2xl bg-white border border-warm-gray-dark/30 shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <OptimizedImage
        fileId={heroFileId}
        widths={[400, 800]}
        alt={name}
        className="aspect-video"
        imgClass="transition-transform duration-500 group-hover:scale-105"
      />

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display text-lg font-semibold text-charcoal leading-tight line-clamp-2">
          {name}
        </h3>

        {description && (
          <p className="mt-2 text-sm text-charcoal-muted leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        <dl className="mt-4 space-y-2 text-sm">
          {dateRange && (
            <div className="flex items-center gap-2 text-charcoal-muted">
              <Calendar className="w-4 h-4 text-sage shrink-0" />
              <span>{dateRange}</span>
            </div>
          )}

          {Number.isFinite(Number(edition.capacity)) &&
            edition.capacity > 0 && (
              <div className="flex items-center gap-2 text-charcoal-muted">
                <Users className="w-4 h-4 text-sage shrink-0" />
                <span>
                  {edition.capacity} {t("experienceDetail.people")}
                </span>
              </div>
            )}

          {!regOpen && edition.registrationOpens && (
            <div className="flex items-center gap-2 text-charcoal-subtle">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-xs italic">
                {t("editions.registrationOpensSoon")}
              </span>
            </div>
          )}
        </dl>

        <div className="mt-auto pt-4 border-t border-warm-gray-dark/20">
          <Button
            type="button"
            variant="default"
            size="md"
            className="w-full"
            onClick={handleBook}
            disabled={!regOpen}
          >
            {regOpen
              ? t("editions.bookEdition")
              : t("editions.registrationClosed")}
          </Button>
        </div>
      </div>
    </article>
  );
}

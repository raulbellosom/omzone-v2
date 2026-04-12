import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { getPublicationPreviewUrl } from "@/hooks/usePublicationBySlug";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseJsonSafe(str, fallback = []) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function parseMediaIds(str) {
  return parseJsonSafe(str, []).filter(Boolean);
}

const ALLOWED_VIDEO_HOSTS = ["youtube.com", "www.youtube.com", "youtu.be", "vimeo.com", "player.vimeo.com"];

function isAllowedVideoUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_VIDEO_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

// ─── Section type components ─────────────────────────────────────────────────

function HeroSection({ section, language }) {
  const ids = parseMediaIds(section.mediaIds);
  const imageId = ids[0];
  const imageUrl = getPublicationPreviewUrl(imageId, { width: 1600, height: 900 });

  return (
    <section className="relative w-full">
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-warm-gray">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={localizedField(section, "title", language) || ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sage/20 via-warm-gray to-sand/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container-shell">
            {localizedField(section, "title", language) && (
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
                {localizedField(section, "title", language)}
              </h2>
            )}
            {localizedField(section, "content", language) && (
              <p className="mt-3 text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
                {localizedField(section, "content", language)}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TextSection({ section, language }) {
  const content = localizedField(section, "content", language);
  if (!content) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="container-shell max-w-3xl">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-6">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <div className="prose prose-charcoal max-w-none text-charcoal-muted leading-relaxed">
          <Markdown rehypePlugins={[rehypeSanitize]}>{content}</Markdown>
        </div>
      </div>
    </section>
  );
}

function GallerySection({ section, language }) {
  const ids = parseMediaIds(section.mediaIds);
  if (ids.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="container-shell">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-6">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <div
          className={cn(
            "grid gap-3",
            ids.length === 1 && "grid-cols-1 max-w-2xl",
            ids.length === 2 && "grid-cols-1 sm:grid-cols-2",
            ids.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {ids.map((fileId, idx) => {
            const url = getPublicationPreviewUrl(fileId, { width: 800, height: 600 });
            return (
              <div
                key={fileId || idx}
                className="aspect-4/3 overflow-hidden rounded-xl bg-warm-gray"
              >
                {url && (
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HighlightsSection({ section, language }) {
  const items =
    parseJsonSafe(section.metadata)?.items ||
    parseJsonSafe(section.content, []);
  const list = Array.isArray(items)
    ? items
    : (section.content || "").split("\n").filter(Boolean);
  if (list.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-sage/5">
      <div className="container-shell">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-8">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
          {list.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sage flex items-center justify-center mt-0.5">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-charcoal leading-relaxed">
                {typeof item === "string"
                  ? item
                  : item.text || item.label || JSON.stringify(item)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ section, language }) {
  const items =
    parseJsonSafe(section.metadata)?.faqs ||
    parseJsonSafe(section.content, []);
  const faqs = Array.isArray(items) ? items : [];
  const [openIndex, setOpenIndex] = useState(null);
  if (faqs.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="container-shell max-w-3xl">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-8">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <div className="divide-y divide-warm-gray-dark/20">
          {faqs.map((faq, i) => {
            const q =
              typeof faq === "string" ? faq : faq.question || faq.q || "";
            const a =
              typeof faq === "string" ? "" : faq.answer || faq.a || "";
            const open = openIndex === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-start justify-between gap-4 py-5 text-left min-h-[44px]"
                >
                  <span className="text-base font-semibold text-charcoal">
                    {q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "flex-shrink-0 h-5 w-5 text-charcoal-subtle transition-transform mt-0.5",
                      open && "rotate-180",
                    )}
                  />
                </button>
                {open && a && (
                  <p className="pb-5 text-base text-charcoal-muted leading-relaxed">
                    {a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ItinerarySection({ section, language }) {
  const items =
    parseJsonSafe(section.metadata)?.days ||
    parseJsonSafe(section.content, []);
  const days = Array.isArray(items) ? items : [];
  if (days.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="container-shell max-w-3xl">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-8">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <div className="relative space-y-6 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-sage/30">
          {days.map((day, i) => {
            const label =
              typeof day === "string"
                ? day
                : day.day || day.title || `Day ${i + 1}`;
            const desc =
              typeof day === "string" ? "" : day.description || day.desc || "";
            return (
              <div key={i} className="relative">
                <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-sage/20 border-2 border-sage flex items-center justify-center">
                  <span className="text-xs font-bold text-sage">{i + 1}</span>
                </div>
                <h4 className="text-base font-semibold text-charcoal">
                  {label}
                </h4>
                {desc && (
                  <p className="mt-1 text-sm text-charcoal-muted leading-relaxed">
                    {desc}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ section, language }) {
  const items =
    parseJsonSafe(section.metadata)?.testimonials ||
    parseJsonSafe(section.content, []);
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-sand/30">
      <div className="container-shell">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-8 text-center">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {list.map((t, i) => {
            const quote =
              typeof t === "string" ? t : t.quote || t.text || "";
            const author =
              typeof t === "string" ? "" : t.author || t.name || "";
            return (
              <blockquote
                key={i}
                className="bg-white rounded-2xl p-6 shadow-card"
              >
                <p className="text-sm text-charcoal-muted leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </p>
                {author && (
                  <footer className="mt-4 text-xs font-semibold text-charcoal">
                    — {author}
                  </footer>
                )}
              </blockquote>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InclusionsSection({ section, language }) {
  const items = parseJsonSafe(
    section.content,
    (section.content || "").split("\n").filter(Boolean),
  );
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-cream/60">
      <div className="container-shell max-w-3xl">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-6">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <ul className="grid sm:grid-cols-2 gap-2">
          {list.map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-charcoal">
              <svg
                className="w-4 h-4 text-sage flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {typeof item === "string"
                ? item
                : item.text || JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RestrictionsSection({ section, language }) {
  const items = parseJsonSafe(
    section.content,
    (section.content || "").split("\n").filter(Boolean),
  );
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="container-shell max-w-3xl">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-6">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <ul className="grid sm:grid-cols-2 gap-2">
          {list.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 text-sm text-charcoal-muted"
            >
              <svg
                className="w-4 h-4 text-charcoal-subtle flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {typeof item === "string"
                ? item
                : item.text || JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CtaSection({ section, experience, language }) {
  const content = localizedField(section, "content", language);
  const meta = parseJsonSafe(section.metadata);
  const linkTo = experience ? `/experiences/${experience.slug}` : meta?.link || null;
  const buttonLabel = meta?.buttonLabel || (experience ? "Explore Experience" : null);

  return (
    <section className="py-12 md:py-16 bg-sage/10">
      <div className="container-shell text-center max-w-2xl">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-3">
            {localizedField(section, "title", language)}
          </h2>
        )}
        {content && (
          <p className="text-charcoal-muted leading-relaxed mb-6">{content}</p>
        )}
        {linkTo && buttonLabel && (
          <Button asChild size="lg">
            <Link to={linkTo}>
              {buttonLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}

function VideoSection({ section, language }) {
  const meta = parseJsonSafe(section.metadata);
  const rawUrl = meta?.url || section.content || "";
  if (!rawUrl || !isAllowedVideoUrl(rawUrl)) return null;

  const embedUrl = rawUrl
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/")
    .replace("vimeo.com/", "player.vimeo.com/video/");

  return (
    <section className="py-10 md:py-14">
      <div className="container-shell max-w-4xl">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-6">
            {localizedField(section, "title", language)}
          </h2>
        )}
        <div className="aspect-video rounded-2xl overflow-hidden bg-warm-gray">
          <iframe
            src={embedUrl}
            title={localizedField(section, "title", language) || "Video"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

// ─── Section map ────────────────────────────────────────────────────────────

const SECTION_MAP = {
  hero: HeroSection,
  text: TextSection,
  gallery: GallerySection,
  highlights: HighlightsSection,
  faq: FaqSection,
  itinerary: ItinerarySection,
  testimonials: TestimonialsSection,
  inclusions: InclusionsSection,
  restrictions: RestrictionsSection,
  cta: CtaSection,
  video: VideoSection,
};

// ─── Main renderer ────────────────────────────────────────────────────────────

export default function PublicationSectionRenderer({ sections, experience }) {
  const { language } = useLanguage();
  if (!sections || sections.length === 0) return null;

  return (
    <div>
      {sections.map((section) => {
        const Component = SECTION_MAP[section.sectionType];
        if (!Component) return null;
        return (
          <Component
            key={section.$id}
            section={section}
            experience={experience}
            language={language}
          />
        );
      })}
    </div>
  );
}

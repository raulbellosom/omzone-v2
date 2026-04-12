import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useLanguage, localizedField } from "@/hooks/useLanguage";

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

// ─── Section type components ─────────────────────────────────────────────────

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
        <div className="prose prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-wrap">
          {content}
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
            ids.length === 1
              ? "grid-cols-1 max-w-2xl"
              : ids.length === 2
                ? "grid-cols-2"
                : ids.length === 3
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
          )}
        >
          {ids.map((fileId, idx) => (
            <OptimizedImage
              key={fileId || idx}
              fileId={fileId}
              widths={[400, 800]}
              alt=""
              className="aspect-4/3 rounded-xl"
              imgClass="hover:scale-105 transition-transform duration-500"
            />
          ))}
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
    parseJsonSafe(section.metadata)?.faqs || parseJsonSafe(section.content, []);
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
            const a = typeof faq === "string" ? "" : faq.answer || faq.a || "";
            const open = openIndex === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-start justify-between gap-4 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-charcoal">
                    {q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "flex-shrink-0 h-4 w-4 text-charcoal-subtle transition-transform mt-0.5",
                      open && "rotate-180",
                    )}
                  />
                </button>
                {open && a && (
                  <p className="pb-4 text-sm text-charcoal-muted leading-relaxed">
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
    parseJsonSafe(section.metadata)?.days || parseJsonSafe(section.content, []);
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
                <h4 className="text-sm font-semibold text-charcoal">{label}</h4>
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
            <li
              key={i}
              className="flex items-center gap-2.5 text-sm text-charcoal"
            >
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
            const quote = typeof t === "string" ? t : t.quote || t.text || "";
            const author =
              typeof t === "string" ? "" : t.author || t.name || "";
            return (
              <blockquote
                key={i}
                className="bg-white rounded-2xl p-6 shadow-card"
              >
                <p className="text-sm text-charcoal-muted leading-relaxed italic">
                  "{quote}"
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

function CtaSection({ section, language }) {
  const content = localizedField(section, "content", language);
  return (
    <section className="py-10 md:py-14 bg-sage/10">
      <div className="container-shell text-center max-w-2xl">
        {localizedField(section, "title", language) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-3">
            {localizedField(section, "title", language)}
          </h2>
        )}
        {content && (
          <p className="text-charcoal-muted leading-relaxed">{content}</p>
        )}
      </div>
    </section>
  );
}

function VideoSection({ section, language }) {
  const meta = parseJsonSafe(section.metadata);
  const url = meta?.url || section.content || "";
  if (!url) return null;

  // Convert to embed URL (YouTube / Vimeo basic)
  const embedUrl = url
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

// ─── Main renderer ────────────────────────────────────────────────────────────

const SECTION_MAP = {
  text: TextSection,
  gallery: GallerySection,
  highlights: HighlightsSection,
  faq: FaqSection,
  itinerary: ItinerarySection,
  inclusions: InclusionsSection,
  restrictions: RestrictionsSection,
  testimonials: TestimonialsSection,
  cta: CtaSection,
  video: VideoSection,
};

export default function SectionRenderer({ sections }) {
  const { language } = useLanguage();
  if (!sections || sections.length === 0) return null;

  return (
    <div>
      {sections.map((section) => {
        const Component = SECTION_MAP[section.sectionType];
        if (!Component) return null; // unknown type — ignore silently
        return <Component key={section.$id} section={section} language={language} />;
      })}
    </div>
  );
}

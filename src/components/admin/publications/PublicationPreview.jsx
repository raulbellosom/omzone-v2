import { Card } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import { useImageUpload } from "@/hooks/useImageUpload";

const TYPE_LABELS = {
  hero: "Hero",
  text: "Texto",
  gallery: "Galería",
  highlights: "Highlights",
  faq: "FAQ",
  itinerary: "Itinerario",
  testimonials: "Testimonios",
  inclusions: "Inclusiones",
  restrictions: "Restricciones",
  cta: "Call to Action",
  video: "Video",
};

function HeroSection({ section, getPreviewUrl }) {
  const mediaIds = parseJson(section.mediaIds, []);
  const imageId = mediaIds[0] || null;
  return (
    <div className="relative rounded-xl overflow-hidden bg-warm-gray aspect-[21/9]">
      {imageId && (
        <img
          src={getPreviewUrl(imageId, { width: 1200, height: 500 })}
          alt=""
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
        {section.title && (
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
            {section.title}
          </h2>
        )}
        {section.content && (
          <p className="text-sm text-white/80 mt-1 max-w-2xl">
            {section.content}
          </p>
        )}
      </div>
    </div>
  );
}

function TextSection({ section }) {
  return (
    <div className="prose prose-charcoal max-w-none">
      {section.title && (
        <h3 className="text-lg font-semibold text-charcoal">{section.title}</h3>
      )}
      {section.content && (
        <div className="text-sm text-charcoal-muted whitespace-pre-line">
          {section.content}
        </div>
      )}
    </div>
  );
}

function GallerySection({ section, getPreviewUrl }) {
  const mediaIds = parseJson(section.mediaIds, []);
  if (mediaIds.length === 0) return null;
  return (
    <div>
      {section.title && (
        <h3 className="text-lg font-semibold text-charcoal mb-3">
          {section.title}
        </h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {mediaIds.map((id) => (
          <div
            key={id}
            className="rounded-xl overflow-hidden bg-warm-gray aspect-square"
          >
            <img
              src={getPreviewUrl(id, { width: 400, height: 400 })}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqSection({ section }) {
  const items = parseJson(section.metadata, []);
  return (
    <div>
      {section.title && (
        <h3 className="text-lg font-semibold text-charcoal mb-3">
          {section.title}
        </h3>
      )}
      {Array.isArray(items) && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-warm-gray-dark/40 rounded-xl p-4">
              <p className="font-medium text-charcoal text-sm">
                {item.question || item.q}
              </p>
              <p className="text-xs text-charcoal-muted mt-1">
                {item.answer || item.a}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-charcoal-subtle italic">
          {section.content || "Sin contenido FAQ"}
        </p>
      )}
    </div>
  );
}

function GenericSection({ section }) {
  return (
    <div>
      {section.title && (
        <h3 className="text-lg font-semibold text-charcoal">{section.title}</h3>
      )}
      {section.content && (
        <div className="text-sm text-charcoal-muted whitespace-pre-line mt-1">
          {section.content}
        </div>
      )}
    </div>
  );
}

function parseJson(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function renderSection(section, getPreviewUrl) {
  if (!section.isVisible) return null;
  const key = section.$id;
  switch (section.sectionType) {
    case "hero":
      return <HeroSection key={key} section={section} getPreviewUrl={getPreviewUrl} />;
    case "text":
      return <TextSection key={key} section={section} />;
    case "gallery":
      return <GallerySection key={key} section={section} getPreviewUrl={getPreviewUrl} />;
    case "faq":
      return <FaqSection key={key} section={section} />;
    default:
      return <GenericSection key={key} section={section} />;
  }
}

export default function PublicationPreview({ publication, sections }) {
  const { getPreviewUrl } = useImageUpload();

  const visibleSections = (sections || []).filter((s) => s.isVisible);

  return (
    <Card className="overflow-hidden">
      <div className="bg-charcoal text-white px-4 py-2 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Preview
      </div>
      <div className="p-5 md:p-8 space-y-8">
        {/* Publication header */}
        <div className="space-y-2">
          <Badge variant="sage" size="sm">
            {publication.category}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-charcoal">
            {publication.title}
          </h1>
          {publication.subtitle && (
            <p className="text-base text-charcoal-muted">
              {publication.subtitle}
            </p>
          )}
        </div>

        {/* Sections */}
        {visibleSections.length === 0 ? (
          <p className="text-sm text-charcoal-subtle italic text-center py-8">
            Sin secciones visibles para previsualizar.
          </p>
        ) : (
          visibleSections.map((section) =>
            renderSection(section, getPreviewUrl),
          )
        )}
      </div>
    </Card>
  );
}

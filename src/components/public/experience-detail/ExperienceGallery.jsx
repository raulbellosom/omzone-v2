import OptimizedImage from "@/components/common/OptimizedImage";
import { useLanguage } from "@/hooks/useLanguage";

export default function ExperienceGallery({ imageIds, alt = "", bucketId }) {
  const { t } = useLanguage();
  if (!imageIds || imageIds.length === 0) return null;

  // Single image — full width
  if (imageIds.length === 1) {
    return (
      <section className="py-8 md:py-12">
        <div className="rounded-2xl overflow-hidden">
          <OptimizedImage
            fileId={imageIds[0]}
            widths={[600, 900, 1200]}
            quality={85}
            alt={`${alt} — 1`}
            className="w-full aspect-video"
            {...(bucketId && { bucketId })}
          />
        </div>
      </section>
    );
  }

  // Two images — side by side on sm+
  if (imageIds.length === 2) {
    return (
      <section className="py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {imageIds.map((id, i) => (
            <div key={id} className="rounded-2xl overflow-hidden">
              <OptimizedImage
                fileId={id}
                widths={[400, 600, 800]}
                quality={85}
                alt={`${alt} — ${i + 1}`}
                className="w-full aspect-4/3"
                {...(bucketId && { bucketId })}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 3+ images — masonry-style grid
  return (
    <section className="py-8 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* First image takes full width on sm+ */}
        <div className="sm:col-span-2 rounded-2xl overflow-hidden">
          <OptimizedImage
            fileId={imageIds[0]}
            widths={[600, 900, 1200]}
            quality={85}
            alt={`${alt} — 1`}
            className="w-full aspect-video"
            {...(bucketId && { bucketId })}
          />
        </div>
        {/* Remaining images in 2-column grid */}
        {imageIds.slice(1).map((id, i) => (
          <div key={id} className="rounded-2xl overflow-hidden">
            <OptimizedImage
              fileId={id}
              widths={[400, 600, 800]}
              quality={85}
              alt={`${alt} — ${i + 2}`}
              className="w-full aspect-4/3"
              {...(bucketId && { bucketId })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

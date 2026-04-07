import { storage } from "@/lib/appwrite";
import env from "@/config/env";

/**
 * Standard breakpoint widths for responsive srcSet generation.
 * thumbnail → card listings, card → mobile cards, medium → tablet,
 * hero → desktop hero, full → retina/wide.
 */
const SIZES = {
  thumbnail: 200,
  card: 400,
  medium: 800,
  hero: 1200,
  full: 1600,
};

/**
 * Build an Appwrite Storage preview URL for a given fileId.
 *
 * @param {string} fileId
 * @param {Object}  opts
 * @param {string}  opts.bucketId  — default: experience_media
 * @param {number}  opts.width     — pixel width
 * @param {number}  opts.height    — pixel height (auto-scaled if omitted)
 * @param {number}  opts.quality   — 0-100, default 80
 * @returns {string|null}
 */
export function getPreviewUrl(
  fileId,
  {
    bucketId = env.bucketExperienceMedia,
    width = 800,
    height,
    quality = 80,
  } = {},
) {
  if (!fileId) return null;
  try {
    return height
      ? storage.getFilePreview(
          bucketId,
          fileId,
          width,
          height,
          undefined,
          quality,
        )
      : storage.getFilePreview(
          bucketId,
          fileId,
          width,
          undefined,
          undefined,
          quality,
        );
  } catch {
    return null;
  }
}

/**
 * Generate a srcSet string with multiple sizes for responsive images.
 *
 * @param {string} fileId
 * @param {Object}  opts
 * @param {string}  opts.bucketId
 * @param {number}  opts.quality
 * @param {number[]} opts.widths  — custom widths (default: [400, 800, 1200])
 * @returns {{ src: string|null, srcSet: string|null, sizes: string }}
 */
export function getResponsiveSrcSet(
  fileId,
  {
    bucketId = env.bucketExperienceMedia,
    quality = 80,
    widths = [SIZES.card, SIZES.medium, SIZES.hero],
  } = {},
) {
  if (!fileId) return { src: null, srcSet: null, sizes: "" };

  const urls = widths.map((w) => {
    const url = getPreviewUrl(fileId, { bucketId, width: w, quality });
    return `${url} ${w}w`;
  });

  const fallbackWidth = widths[Math.floor(widths.length / 2)];
  const src = getPreviewUrl(fileId, {
    bucketId,
    width: fallbackWidth,
    quality,
  });

  const sizes = [
    `(max-width: 640px) ${widths[0]}px`,
    widths.length > 2 ? `(max-width: 1024px) ${widths[1]}px` : null,
    `${widths[widths.length - 1]}px`,
  ]
    .filter(Boolean)
    .join(", ");

  return { src, srcSet: urls.join(", "), sizes };
}

export { SIZES as IMAGE_SIZES };

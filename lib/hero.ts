import type { HeroMedia, PageData } from './types'

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/**
 * Resolves the home-page opening visual from the `home` page row.
 *
 * This is the single place where image ↔ video is decided — to swap the hero,
 * change `hero_media_type` in the admin panel, or change the precedence here.
 *
 * The visual is language-agnostic, so callers should always pass the Hebrew row
 * (`homeContent.he`), matching how the About page reads its headshot.
 */
export function resolveHeroMedia(page: PageData | null): HeroMedia {
  const content = (page?.content_json ?? {}) as Record<string, unknown>
  const images = (page?.images_json ?? {}) as Record<string, unknown>

  const declared = str(content.hero_media_type)
  const focal = str(content.hero_focal) || 'center'
  const alt = str(content.hero_alt)
  const video = str(images.hero_video_url)
  const poster = str(images.hero_poster_url)
  const image = str(images.hero_image_url)

  // An explicit 'none' hides the visual without deleting the uploaded files.
  if (declared === 'none') return { type: 'none' }

  if (video && declared !== 'image') {
    return { type: 'video', src: video, poster: poster || image || null, alt, focal }
  }

  const still = image || poster
  if (still) return { type: 'image', src: still, alt, focal }

  return { type: 'none' }
}

export type Lang = 'he' | 'en'

export interface ContactInfo {
  phone: string | null
  email: string | null
}

export interface SocialLink {
  platform: string
  url: string
}

export interface PageData {
  content_json: Record<string, unknown>
  images_json: Record<string, unknown>
}

export interface PageContent {
  he: PageData | null
  en: PageData | null
}

export interface GalleryItem {
  id: string
  title: string
  description: string | null
  image_url: string | null
  category: string | null
  language: string
  order_index: number
}

export interface GalleryPreviewItem {
  id: string
  title: string
  image_url: string | null
  category: string | null
}

/** A single knit. One row per physical piece — bilingual columns, not per-language rows. */
export interface Knit {
  id: string
  slug: string
  title_he: string
  title_en: string
  description_he: string | null
  description_en: string | null
  alt_he: string | null
  alt_en: string | null
  cover_image: string | null
  images: string[]
  rotation_frames: string[]
  model_3d: string | null
  order_index: number
}

/**
 * The home-page opening visual. `none` keeps the original typographic hero,
 * so the page is never broken while no asset has been uploaded.
 */
export type HeroMedia =
  | { type: 'none' }
  | { type: 'image'; src: string; alt: string; focal: string }
  | { type: 'video'; src: string; poster: string | null; alt: string; focal: string }

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

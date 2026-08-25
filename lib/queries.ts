import { unstable_cache } from 'next/cache'
import { createPublicClient } from './supabase/public'
import type { Knit } from './types'

const TTL = 3600

/** jsonb columns arrive untyped — keep only non-empty strings so the UI can trust them. */
function urlList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
}

function normalizeKnit(row: Record<string, unknown>): Knit {
  return {
    ...(row as unknown as Knit),
    images: urlList(row.images),
    rotation_frames: urlList(row.rotation_frames),
    // Absent before 0005_knits_model_viewer.sql has been run.
    use_model_3d: row.use_model_3d === true,
  }
}

const KNIT_COLUMNS =
  'id, slug, title_he, title_en, description_he, description_en, alt_he, alt_en, cover_image, images, rotation_frames, model_3d, order_index'

/**
 * Selecting a column Postgres does not have fails the WHOLE query, which would
 * empty every knit surface on the site. So `use_model_3d` is asked for
 * optionally: if 0005 has not been run yet, fall back to the 0004 column list
 * and let normalizeKnit default the flag to false.
 */
async function fetchKnits(
  supabase: ReturnType<typeof createPublicClient>
): Promise<Record<string, unknown>[] | null> {
  // A runtime column list defeats supabase-js's row typing, so the rows come
  // back opaque and normalizeKnit is what gives them a shape.
  const query = (columns: string) =>
    supabase.from('knits').select(columns).eq('is_published', true).order('order_index')

  const withFlag = await query(`${KNIT_COLUMNS}, use_model_3d`)
  if (!withFlag.error) return withFlag.data as unknown as Record<string, unknown>[] | null

  const legacy = await query(KNIT_COLUMNS)
  return legacy.data as unknown as Record<string, unknown>[] | null
}

export const getPageContent = unstable_cache(
  async (pageName: string) => {
    const supabase = createPublicClient()
    const [{ data: he }, { data: en }] = await Promise.all([
      supabase.from('pages').select('content_json, images_json').eq('page_name', pageName).eq('language', 'he').single(),
      supabase.from('pages').select('content_json, images_json').eq('page_name', pageName).eq('language', 'en').single(),
    ])
    return { he, en }
  },
  ['page-content'],
  { revalidate: TTL, tags: ['pages'] }
)

export const getGalleryItems = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('gallery_items')
      .select('id, title, description, image_url, category, language, order_index')
      .order('order_index')
    return data ?? []
  },
  ['gallery-items'],
  { revalidate: TTL, tags: ['gallery'] }
)

export const getGalleryPreview = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('gallery_items')
      .select('id, title, image_url, category')
      .order('order_index')
      .limit(6)
    return data ?? []
  },
  ['gallery-preview'],
  { revalidate: TTL, tags: ['gallery'] }
)

export const getContactData = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const [{ data: contactInfo }, { data: socialLinks }] = await Promise.all([
      supabase.from('contact_info').select('phone, email').single(),
      supabase.from('social_links').select('platform, url').order('order_index'),
    ])
    return { contactInfo, socialLinks: socialLinks ?? [] }
  },
  ['contact-data'],
  { revalidate: TTL, tags: ['contact'] }
)

// Fetches all public site data in a single cached call.
// Used by the public layout so every page gets its data from context —
// client-side navigation never triggers a data fetch.
export const getPublicSiteData = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const [
      { data: heHome }, { data: enHome },
      { data: heAbout }, { data: enAbout },
      { data: heContact }, { data: enContact },
      { data: galleryItemsData },
      { data: galleryPreviewData },
      { data: contactInfo },
      { data: socialLinks },
      knitsData,
    ] = await Promise.all([
      supabase.from('pages').select('content_json, images_json').eq('page_name', 'home').eq('language', 'he').single(),
      supabase.from('pages').select('content_json, images_json').eq('page_name', 'home').eq('language', 'en').single(),
      supabase.from('pages').select('content_json, images_json').eq('page_name', 'about').eq('language', 'he').single(),
      supabase.from('pages').select('content_json, images_json').eq('page_name', 'about').eq('language', 'en').single(),
      supabase.from('pages').select('content_json, images_json').eq('page_name', 'contact').eq('language', 'he').single(),
      supabase.from('pages').select('content_json, images_json').eq('page_name', 'contact').eq('language', 'en').single(),
      supabase.from('gallery_items').select('id, title, description, image_url, category, language, order_index').order('order_index'),
      supabase.from('gallery_items').select('id, title, image_url, category').order('order_index').limit(6),
      supabase.from('contact_info').select('phone, email').single(),
      supabase.from('social_links').select('platform, url').order('order_index'),
      fetchKnits(supabase),
    ])
    return {
      homeContent: { he: heHome, en: enHome },
      aboutContent: { he: heAbout, en: enAbout },
      contactContent: { he: heContact, en: enContact },
      galleryItems: galleryItemsData ?? [],
      galleryPreview: galleryPreviewData ?? [],
      contactInfo: contactInfo ?? null,
      socialLinks: socialLinks ?? [],
      // `?? []` also covers the window before 0004_knits.sql has been run,
      // where the table does not exist yet and Supabase returns null.
      knits: (knitsData ?? []).map(normalizeKnit),
    }
  },
  ['public-site-data'],
  { revalidate: TTL, tags: ['pages', 'gallery', 'contact', 'knits'] }
)

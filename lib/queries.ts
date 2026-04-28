import { unstable_cache } from 'next/cache'
import { createPublicClient } from './supabase/public'

const TTL = 3600

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
  { revalidate: TTL }
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
  { revalidate: TTL }
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
  { revalidate: TTL }
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
  { revalidate: TTL }
)

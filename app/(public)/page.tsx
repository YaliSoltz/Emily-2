import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import HomeClient from '@/components/public/HomeClient'

export const metadata: Metadata = {
  title: 'Emily Tal — Textile Design Portfolio',
  description: 'תיק עבודות של אמילי טל — עיצוב טקסטיל, סריגה והדפסי רשת',
  alternates: { languages: { he: '/', en: '/' } },
}

export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: heContent }, { data: enContent }, { data: galleryPreview }] = await Promise.all([
    supabase.from('pages').select('content_json, images_json').eq('page_name', 'home').eq('language', 'he').single(),
    supabase.from('pages').select('content_json, images_json').eq('page_name', 'home').eq('language', 'en').single(),
    supabase.from('gallery_items').select('id, title, image_url, category').order('order_index').limit(6),
  ])

  return (
    <HomeClient
      heContent={heContent?.content_json ?? {}}
      enContent={enContent?.content_json ?? {}}
      galleryPreview={galleryPreview ?? []}
    />
  )
}

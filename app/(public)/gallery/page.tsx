import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import GalleryClient from '@/components/public/GalleryClient'

export const metadata: Metadata = {
  title: 'גלריה — Emily Tal',
  description: 'תיק עבודות — עיצוב טקסטיל, סריגה והדפסי רשת',
}

export default async function GalleryPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .order('order_index')

  return <GalleryClient items={items ?? []} />
}

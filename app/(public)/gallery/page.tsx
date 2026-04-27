import { createPublicClient } from '@/lib/supabase/public'
import type { Metadata } from 'next'
import GalleryClient from '@/components/public/GalleryClient'

export const metadata: Metadata = {
  title: 'גלריה — Emily Tal',
  description: 'תיק עבודות — עיצוב טקסטיל, סריגה והדפסי רשת',
}

export const revalidate = 3600

export default async function GalleryPage() {
  const supabase = createPublicClient()

  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .order('order_index')

  return <GalleryClient items={items ?? []} />
}

import type { Metadata } from 'next'
import GalleryClient from '@/components/public/GalleryClient'
import { Suspense } from 'react'
import { getGalleryItems } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'גלריה — Emily Tal',
  description: 'תיק עבודות — עיצוב טקסטיל, סריגה והדפסי רשת',
}

export const revalidate = 3600

export default async function GalleryPage() {
  const items = await getGalleryItems()

  return (
    <Suspense>
      <GalleryClient items={items} />
    </Suspense>
  )
}

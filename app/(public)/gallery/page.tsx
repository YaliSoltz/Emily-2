import type { Metadata } from 'next'
import GalleryClient from '@/components/public/GalleryClient'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'גלריה — Emily Tal',
  description: 'תיק עבודות — עיצוב טקסטיל, סריגה והדפסי רשת',
}

export default function GalleryPage() {
  return (
    <Suspense>
      <GalleryClient />
    </Suspense>
  )
}

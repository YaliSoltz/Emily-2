import type { Metadata } from 'next'
import HomeClient from '@/components/public/HomeClient'
import { getPageContent, getGalleryPreview } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Emily Tal — Textile Design Portfolio',
  description: 'תיק עבודות של אמילי טל — עיצוב טקסטיל, סריגה והדפסי רשת',
  alternates: { languages: { he: '/', en: '/' } },
}

export const revalidate = 3600

export default async function HomePage() {
  const [{ he, en }, galleryPreview] = await Promise.all([
    getPageContent('home'),
    getGalleryPreview(),
  ])

  return (
    <HomeClient
      heContent={he?.content_json ?? {}}
      enContent={en?.content_json ?? {}}
      galleryPreview={galleryPreview}
    />
  )
}

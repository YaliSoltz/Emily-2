import type { Metadata } from 'next'
import AboutClient from '@/components/public/AboutClient'
import { getPageContent } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'אודות — Emily Tal',
  description: 'מעצבת טקסטיל — סריגה, עיצוב טקסטיל והדפסי רשת',
}

export const revalidate = 3600

export default async function AboutPage() {
  const { he, en } = await getPageContent('about')

  return (
    <AboutClient
      heContent={he?.content_json ?? {}}
      enContent={en?.content_json ?? {}}
      heImages={he?.images_json ?? {}}
    />
  )
}

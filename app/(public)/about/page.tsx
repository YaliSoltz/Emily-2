import type { Metadata } from 'next'
import AboutClient from '@/components/public/AboutClient'

export const metadata: Metadata = {
  title: 'אודות — Emily Tal',
  description: 'מעצבת טקסטיל — סריגה, עיצוב טקסטיל והדפסי רשת',
}

export default function AboutPage() {
  return <AboutClient />
}

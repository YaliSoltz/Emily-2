import type { Metadata } from 'next'
import HomeClient from '@/components/public/HomeClient'

export const metadata: Metadata = {
  title: 'Emily Tal — Textile Design Portfolio',
  description: 'תיק עבודות של אמילי טל — עיצוב טקסטיל, סריגה והדפסי רשת',
  alternates: { languages: { he: '/', en: '/' } },
}

export default function HomePage() {
  return <HomeClient />
}

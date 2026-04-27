import type { Metadata } from 'next'
import { Heebo, Cormorant_Garamond, Inter } from 'next/font/google'
import { Suspense } from 'react'
import NavigationProgress from '@/components/public/NavigationProgress'
import './globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Emily Tal — Textile Design Portfolio', template: '%s — Emily Tal' },
  description: 'Portfolio of Emily Tal — textile design, knitting, and screen printing.',
  openGraph: {
    title: 'Emily Tal — Textile Design Portfolio',
    description: 'Portfolio of Emily Tal — textile design, knitting, and screen printing.',
    type: 'website',
    locale: 'he_IL',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emily Tal — Textile Design Portfolio',
    description: 'Portfolio of Emily Tal — textile design, knitting, and screen printing.',
  },
  alternates: {
    languages: { 'he': '/', 'en': '/' },
  },
  keywords: ['Emily Tal', 'textile design', 'עיצוב טקסטיל', 'portfolio', 'knitting', 'screen printing'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#3D2519]">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  )
}

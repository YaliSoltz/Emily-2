import type { Metadata } from 'next'
import { Heebo, Cormorant_Garamond, Inter } from 'next/font/google'
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import Script from 'next/script'
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const lang = langCookie === 'en' ? 'en' : 'he'

  return (
    <html
      lang={lang}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className={`${heebo.variable} ${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#3D2519]">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <Script
          src="https://widget.tabnav.com/limited-widget.min.js.gz?req=2_moKYQatPe9KAb17b9WLrdO6vnQnxyE"
          strategy="afterInteractive"
          {...{ 'tnv-data-config': '{"language":"he","color":"#405ec3","buttonColor":"#405ec3","buttonSize":"small","widgetSize":"small","widgetLocation":"right","buttonLocation":"bottom"}' }}
        />
        <noscript>
          פתרונות נגישות לאתרי אינטרנט לפי התקן הישראלי 5568{' '}
          <a href="https://tabnav.com/he">הנגשת אתרים</a>
        </noscript>
      </body>
    </html>
  )
}

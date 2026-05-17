'use client'

import { useSiteData } from '@/lib/context/SiteDataContext'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import ScrollToTop from './ScrollToTop'

function ShellInner({ children }: { children: React.ReactNode }) {
  const { lang } = useSiteData()

  return (
    <>
      <a href="#main-content" className="skip-nav">
        {lang === 'he' ? 'דלג לתוכן הראשי' : 'Skip to main content'}
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  )
}

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return <ShellInner>{children}</ShellInner>
}

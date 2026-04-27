'use client'

import { LangProvider, useLang } from './LangProvider'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import ScrollToTop from './ScrollToTop'
import AccessibilityWidget from './AccessibilityWidget'

interface Props {
  children: React.ReactNode
  contactInfo: { phone: string | null; email: string | null } | null
  socialLinks: { platform: string; url: string }[]
  initialLang?: 'he' | 'en'
}

function ShellInner({ children, contactInfo, socialLinks }: Props) {
  const { lang, setLang } = useLang()

  return (
    <>
      <a href="#main-content" className="skip-nav">
        {lang === 'he' ? 'דלג לתוכן הראשי' : 'Skip to main content'}
      </a>
      <Header lang={lang} onLangChange={setLang} />
      <main id="main-content" className="flex-1 pt-16">
        {children}
      </main>
      <Footer lang={lang} contactInfo={contactInfo} socialLinks={socialLinks} />
      <WhatsAppButton />
      <ScrollToTop />
      <AccessibilityWidget />
    </>
  )
}

export default function PublicShell({ children, contactInfo, socialLinks, initialLang }: Props) {
  return (
    <LangProvider initialLang={initialLang}>
      <ShellInner contactInfo={contactInfo} socialLinks={socialLinks}>
        {children}
      </ShellInner>
    </LangProvider>
  )
}

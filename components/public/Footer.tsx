import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface FooterProps {
  lang: 'he' | 'en'
  contactInfo?: { phone: string | null; email: string | null } | null
  socialLinks?: { platform: string; url: string }[]
}

const text = {
  he: {
    rights: 'כל הזכויות שמורות',
    design: 'עיצוב טקסטיל, סריגה, הדפסי רשת',
    terms: 'תקנון', accessibility: 'נגישות', privacy: 'פרטיות',
    nav: 'ניווט',
    links: [
      { href: '/', label: 'בית' },
      { href: '/about', label: 'אודות' },
      { href: '/gallery', label: 'גלריה' },
      { href: '/contact', label: 'יצירת קשר' },
    ],
  },
  en: {
    rights: 'All rights reserved',
    design: 'Textile Design, Knitting, Screen Printing',
    terms: 'Terms', accessibility: 'Accessibility', privacy: 'Privacy',
    nav: 'Navigation',
    links: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/contact', label: 'Contact' },
    ],
  },
}

export default function Footer({ lang, contactInfo, socialLinks }: FooterProps) {
  const t = text[lang]
  const instagram = socialLinks?.find(s => s.platform === 'instagram')

  return (
    <footer className="bg-[#5C3D2E] text-[#F5F0E8] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div>
            <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light tracking-[0.15em]">
              EMILY TAL
            </p>
            <p className="text-[#F5F0E8]/60 text-xs tracking-widest mt-1 uppercase">
              {t.design}
            </p>
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-[0.2em] uppercase text-[#F5F0E8]/40 mb-1">{t.nav}</p>
            {t.links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#F5F0E8]/70 hover:text-[#F5F0E8] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            {contactInfo?.email && (
              <a
                href={`mailto:${contactInfo.email}`}
                className="inline-flex items-center gap-2 text-sm text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-colors"
              >
                <Mail size={14} />
                {contactInfo.email}
              </a>
            )}
            {contactInfo?.phone && (
              <a
                href={`tel:${contactInfo.phone}`}
                className="inline-flex items-center gap-2 text-sm text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-colors"
              >
                <Phone size={14} />
                {contactInfo.phone}
              </a>
            )}
            {instagram && (
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @emily_kryzewski
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-[#F5F0E8]/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#F5F0E8]/40 tracking-wider">
            © {new Date().getFullYear()} Emily Tal — {t.rights}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-[#F5F0E8]/60 hover:text-[#F5F0E8] tracking-wider transition-colors">
              {t.privacy}
            </Link>
            <span className="text-[#F5F0E8]/20" aria-hidden="true">|</span>
            <Link href="/terms" className="text-xs text-[#F5F0E8]/60 hover:text-[#F5F0E8] tracking-wider transition-colors">
              {t.terms}
            </Link>
            <span className="text-[#F5F0E8]/20" aria-hidden="true">|</span>
            <Link href="/accessibility" className="text-xs text-[#F5F0E8]/60 hover:text-[#F5F0E8] tracking-wider transition-colors">
              {t.accessibility}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

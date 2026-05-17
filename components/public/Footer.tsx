'use client'

import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { SocialIcon, platformLabel } from '@/lib/social-platforms'
import { useSiteData } from '@/lib/context/SiteDataContext'

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

export default function Footer() {
  const { lang, contactInfo, socialLinks } = useSiteData()
  const t = text[lang]

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
            {socialLinks.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-1">
                {socialLinks.map(link => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platformLabel(link.platform)}
                    className="text-[#F5F0E8]/70 hover:text-[#F5F0E8] transition-colors"
                  >
                    <SocialIcon platform={link.platform} size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#F5F0E8]/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-xs text-[#F5F0E8]/40 tracking-wider">
              © {new Date().getFullYear()} Emily Tal — {t.rights}
            </p>
            <a
              href="https://soltz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#F5F0E8]/30 hover:text-[#F5F0E8]/60 tracking-wider transition-colors"
            >
              נבנה באהבה על ידי SOLtZ
            </a>
          </div>
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

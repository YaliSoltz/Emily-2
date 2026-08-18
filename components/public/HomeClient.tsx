'use client'

import NavLink from './NavLink'
import HomeHero from './HomeHero'
import KnitsCarousel from './KnitsCarousel'
import { useSiteData } from '@/lib/context/SiteDataContext'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function HomeClient() {
  const { lang, homeContent } = useSiteData()
  const c = (lang === 'he' ? homeContent.he?.content_json : homeContent.en?.content_json) as Record<string, string> ?? {}
  const ArrowIcon = lang === 'he' ? ArrowLeft : ArrowRight

  return (
    <div>
      <HomeHero />

      {/* Intro */}
      <section className="py-16 md:py-20 px-6 bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light text-[#3D2519] leading-relaxed">
            {c.intro_text || (lang === 'he'
              ? 'ברוכים הבאים לעולם של אמילי טל — מעצבת טקסטיל עם עין חדה לפרטים ואהבה לחומרים.'
              : "Welcome to Emily Tal's world — a textile designer with a sharp eye for detail and a love for materials.")}
          </p>
        </div>
      </section>

      {/* Knits carousel — renders nothing until knits exist */}
      <KnitsCarousel />

      {/* CTA banner */}
      <section className="py-20 px-6 bg-[#5C3D2E] text-[#F5F0E8] text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-4">
            {lang === 'he' ? 'מעוניינים בשיתוף פעולה?' : 'Interested in collaborating?'}
          </h2>
          <p className="text-[#F5F0E8]/75 text-sm mb-8 tracking-wide">
            {lang === 'he'
              ? 'אשמח לשמוע על הפרויקט שלכם'
              : "I'd love to hear about your project"}
          </p>
          <NavLink
            href="/contact"
            className="inline-flex items-center gap-3 border border-[#F5F0E8]/60 text-[#F5F0E8] px-8 py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-[#F5F0E8] hover:text-[#5C3D2E] transition-colors duration-200"
          >
            {lang === 'he' ? 'יצירת קשר' : 'Get in Touch'}
            <ArrowIcon size={14} />
          </NavLink>
        </div>
      </section>
    </div>
  )
}

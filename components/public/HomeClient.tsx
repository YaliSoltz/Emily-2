'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from './LangProvider'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  image_url: string | null
  category: string | null
}

interface HomeClientProps {
  heContent: Record<string, string>
  enContent: Record<string, string>
  galleryPreview: GalleryItem[]
}

export default function HomeClient({ heContent, enContent, galleryPreview }: HomeClientProps) {
  const { lang } = useLang()
  const c = lang === 'he' ? heContent : enContent
  const isRtl = lang === 'he'
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 bg-[#FAF7F2]">
        <div className="animate-fade-in-up max-w-2xl">
          <p className="text-xs tracking-[0.3em] uppercase text-[#5C3D2E]/50 mb-6">
            {lang === 'he' ? 'תיק עבודות' : 'Portfolio'}
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl font-light text-[#3D2519] leading-tight mb-6">
            {c.hero_title ?? (lang === 'he' ? 'עיצוב שמדבר בשקט' : 'Design That Speaks Quietly')}
          </h1>
          <p className="text-[#5C3D2E]/70 text-sm md:text-base tracking-wide mb-10 max-w-lg mx-auto">
            {c.hero_subtitle ?? (lang === 'he'
              ? 'עיצוב טקסטיל · סריגה · הדפסי רשת'
              : 'Textile Design · Knitting · Screen Printing')}
          </p>
          <Link
            href="/gallery"
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            className="inline-flex items-center gap-3 bg-[#5C3D2E] text-[#F5F0E8] px-8 py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-[#3D2519] transition-colors duration-200"
          >
            {c.hero_cta ?? (lang === 'he' ? 'צפייה בעבודות' : 'View Work')}
            <ArrowIcon size={14} />
          </Link>
        </div>

        {/* Decorative lines */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-12 bg-[#5C3D2E]" />
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 px-6 bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light text-[#3D2519] leading-relaxed">
            {c.intro_text ?? (lang === 'he'
              ? 'ברוכים הבאים לעולם של אמילי טל — מעצבת טקסטיל עם עין חדה לפרטים ואהבה לחומרים.'
              : "Welcome to Emily Tal's world — a textile designer with a sharp eye for detail and a love for materials.")}
          </p>
        </div>
      </section>

      {/* Gallery preview */}
      {galleryPreview.length > 0 && (
        <section className="py-20 px-6 bg-[#FAF7F2]">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-center text-[#3D2519] mb-12 tracking-wide">
              {lang === 'he' ? 'עבודות נבחרות' : 'Selected Works'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryPreview.map(item => (
                <Link key={item.id} href="/gallery" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                  <div className="aspect-square bg-[#E8E0D5] overflow-hidden group relative">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[#5C3D2E]/30 text-xs tracking-widest uppercase">{item.category ?? 'Work'}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#3D2519]/0 group-hover:bg-[#3D2519]/20 transition-colors duration-300" />
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/gallery"
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                className="inline-flex items-center gap-2 text-sm text-[#5C3D2E] border-b border-[#5C3D2E]/40 pb-0.5 hover:border-[#5C3D2E] transition-colors tracking-widest uppercase"
              >
                {lang === 'he' ? 'לכל העבודות' : 'View All Works'}
                <ArrowIcon size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="py-20 px-6 bg-[#5C3D2E] text-[#F5F0E8] text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-4">
            {lang === 'he' ? 'מעוניינים בשיתוף פעולה?' : 'Interested in collaborating?'}
          </h2>
          <p className="text-[#F5F0E8]/70 text-sm mb-8 tracking-wide">
            {lang === 'he'
              ? 'אשמח לשמוע על הפרויקט שלכם'
              : "I'd love to hear about your project"}
          </p>
          <Link
            href="/contact"
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            className="inline-flex items-center gap-3 border border-[#F5F0E8]/60 text-[#F5F0E8] px-8 py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-[#F5F0E8] hover:text-[#5C3D2E] transition-colors duration-200"
          >
            {lang === 'he' ? 'יצירת קשר' : 'Get in Touch'}
            <ArrowIcon size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}

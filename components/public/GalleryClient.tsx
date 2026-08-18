'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useSiteData } from '@/lib/context/SiteDataContext'
import Lightbox, { type LightboxItem } from './Lightbox'
import type { GalleryItem } from '@/lib/types'

const categoryLabels: Record<string, { he: string; en: string }> = {
  textile: { he: 'עיצוב טקסטיל', en: 'Textile Design' },
  knitting: { he: 'סריגה', en: 'Knitting' },
  'screen-printing': { he: 'הדפסי רשת', en: 'Screen Printing' },
}


export default function GalleryClient() {
  const { lang, galleryItems } = useSiteData()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  // `?open=<id>` deep-links straight into the lightbox on first render.
  const [lightboxId, setLightboxId] = useState<string | null>(() => searchParams.get('open'))

  useEffect(() => {
    document.body.style.overflow = lightboxId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxId])

  // Deduplicate by id, prefer current lang
  const deduped = Object.values(
    galleryItems.reduce<Record<string, GalleryItem>>((acc, item) => {
      if (!acc[item.id] || item.language === lang) acc[item.id] = item
      return acc
    }, {})
  )

  const categories = ['all', ...Array.from(new Set(deduped.map(i => i.category).filter(Boolean)))] as string[]
  const filtered = activeCategory === 'all' ? deduped : deduped.filter(i => i.category === activeCategory)

  const categoryLabel = (cat: string) => {
    if (cat === 'all') return lang === 'he' ? 'הכל' : 'All'
    return categoryLabels[cat]?.[lang] ?? cat
  }

  const lightboxItems: LightboxItem[] = filtered.map(item => ({
    id: item.id,
    title: item.title,
    image_url: item.image_url,
    description: item.description,
    caption: item.category ? categoryLabel(item.category) : null,
  }))
  const lightboxItem = lightboxItems.find(i => i.id === lightboxId) ?? null

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="pt-24 pb-10 px-6 text-center border-b border-[#5C3D2E]/10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#5C3D2E]/50 mb-3">
          {lang === 'he' ? 'תיק עבודות' : 'Portfolio'}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#3D2519]">
          {lang === 'he' ? 'גלריה' : 'Gallery'}
        </h1>
      </div>

      {/* Category filter */}
      {categories.length > 2 && (
        <div className="flex justify-center gap-6 py-8 px-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs tracking-[0.2em] uppercase transition-colors pb-0.5 ${
                activeCategory === cat
                  ? 'text-[#5C3D2E] border-b border-[#5C3D2E]'
                  : 'text-[#5C3D2E]/40 hover:text-[#5C3D2E]'
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#5C3D2E]/40 text-sm tracking-widest uppercase">
            {lang === 'he' ? 'עבודות יתווספו בקרוב' : 'Works coming soon'}
          </div>
        ) : (
          <div key={activeCategory} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setLightboxId(item.id)}
                style={{ animationDelay: `${Math.min(i * 50, 350)}ms` }}
                className="animate-gallery-item group text-start bg-white border border-[#5C3D2E]/8 hover:border-[#5C3D2E]/18 hover:shadow-[0_4px_24px_rgba(92,61,46,0.10)] transition-all duration-300 overflow-hidden rounded-[10px]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-[#E8E0D5] overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[#5C3D2E]/20 text-xs tracking-widest uppercase">
                        {categoryLabel(item.category ?? '')}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/6 transition-colors duration-500" />
                </div>

                {/* Info — fixed-height rows, no divider lines */}
                <div className="px-5 pt-4 pb-6">
                  {/* Category chip */}
                  <div className="h-6 overflow-hidden">
                    <span className="inline-block bg-[#5C3D2E]/[0.07] text-[#5C3D2E]/65 text-[9px] tracking-[0.18em] uppercase px-2.5 py-[3px] rounded-sm">
                      {item.category ? categoryLabel(item.category) : '   '}
                    </span>
                  </div>
                  {/* Title — 2 lines reserved */}
                  <h3 className="mt-3 h-14 font-[family-name:var(--font-cormorant)] text-xl font-light text-[#3D2519] leading-snug line-clamp-2 overflow-hidden">
                    {item.title}
                  </h3>
                  {/* Description — 2 lines reserved */}
                  <p className="mt-3 h-10 text-[#5C3D2E]/55 text-xs leading-relaxed line-clamp-2 overflow-hidden">
                    {item.description ?? ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          items={lightboxItems}
          onClose={() => setLightboxId(null)}
          onNavigate={next => setLightboxId(next.id)}
          rtl={lang === 'he'}
        />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useLang } from './LangProvider'

interface GalleryItem {
  id: string
  title: string
  description: string | null
  image_url: string | null
  category: string | null
  language: string
  order_index: number
}

const categoryLabels: Record<string, { he: string; en: string }> = {
  textile: { he: 'עיצוב טקסטיל', en: 'Textile Design' },
  knitting: { he: 'סריגה', en: 'Knitting' },
  'screen-printing': { he: 'הדפסי רשת', en: 'Screen Printing' },
}

interface GalleryClientProps {
  items: GalleryItem[]
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const { lang } = useLang()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)

  // Deduplicate by id, prefer current lang
  const deduped = Object.values(
    items.reduce<Record<string, GalleryItem>>((acc, item) => {
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(item => (
              <button
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="group relative aspect-square bg-[#E8E0D5] overflow-hidden text-start"
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#5C3D2E]/20 text-xs tracking-widest uppercase">
                      {categoryLabel(item.category ?? '')}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-[#3D2519]/0 group-hover:bg-[#3D2519]/40 transition-colors duration-300 flex items-end p-4 opacity-0 group-hover:opacity-100">
                  <span className="text-[#F5F0E8] text-sm font-light tracking-wide">{item.title}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            onClick={() => setLightboxItem(null)}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <div
            className="max-w-3xl w-full max-h-[90vh] bg-[#FAF7F2] overflow-hidden rounded-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {lightboxItem.image_url && (
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={lightboxItem.image_url}
                  alt={lightboxItem.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[#3D2519] mb-2">
                {lightboxItem.title}
              </h3>
              {lightboxItem.description && (
                <p className="text-[#5C3D2E]/70 text-sm leading-relaxed">{lightboxItem.description}</p>
              )}
              {lightboxItem.category && (
                <span className="inline-block mt-3 text-xs tracking-widest uppercase text-[#5C3D2E]/40">
                  {categoryLabel(lightboxItem.category)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

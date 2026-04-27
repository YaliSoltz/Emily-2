'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
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

interface LightboxProps {
  item: GalleryItem
  items: GalleryItem[]
  onClose: () => void
  onNavigate: (item: GalleryItem) => void
  categoryLabel: (cat: string) => string
}

function Lightbox({ item, items, onClose, onNavigate, categoryLabel }: LightboxProps) {
  const idx = items.findIndex(i => i.id === item.id)
  const hasPrev = idx > 0
  const hasNext = idx < items.length - 1

  const prev = useCallback(() => { if (hasPrev) onNavigate(items[idx - 1]) }, [idx, items, hasPrev, onNavigate])
  const next = useCallback(() => { if (hasNext) onNavigate(items[idx + 1]) }, [idx, items, hasNext, onNavigate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') next()
      if (e.key === 'ArrowRight') prev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors p-2 z-10"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Counter */}
      <span className="absolute top-6 left-6 text-white/30 text-xs tracking-widest">
        {idx + 1} / {items.length}
      </span>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="absolute left-4 text-white/40 hover:text-white transition-colors p-3 z-10"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="absolute right-4 text-white/40 hover:text-white transition-colors p-3 z-10"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Panel */}
      <div
        className="flex flex-col md:flex-row w-full max-w-5xl mx-12 shadow-2xl"
        style={{ height: 'min(90vh, 700px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative flex-1 min-h-0 bg-[#1a1a1a]">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 65vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 text-xs tracking-widest uppercase">{item.title}</span>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="w-full md:w-72 bg-[#FAF7F2] flex flex-col justify-between p-8 shrink-0">
          <div>
            {item.category && (
              <span className="text-xs tracking-[0.25em] uppercase text-[#5C3D2E]/40 block mb-4">
                {categoryLabel(item.category)}
              </span>
            )}
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#3D2519] leading-snug mb-4">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-[#5C3D2E]/60 text-sm leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Nav buttons */}
          {items.length > 1 && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={prev}
                disabled={!hasPrev}
                className="flex-1 border border-[#5C3D2E]/20 py-2 text-xs tracking-widest uppercase text-[#5C3D2E]/50 hover:border-[#5C3D2E] hover:text-[#5C3D2E] transition-colors disabled:opacity-20 disabled:cursor-default"
              >
                ←
              </button>
              <button
                onClick={next}
                disabled={!hasNext}
                className="flex-1 border border-[#5C3D2E]/20 py-2 text-xs tracking-widest uppercase text-[#5C3D2E]/50 hover:border-[#5C3D2E] hover:text-[#5C3D2E] transition-colors disabled:opacity-20 disabled:cursor-default"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface GalleryClientProps {
  items: GalleryItem[]
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const { lang } = useLang()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    document.body.style.overflow = lightboxItem ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxItem])

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
        <Lightbox
          item={lightboxItem}
          items={filtered}
          onClose={() => setLightboxItem(null)}
          onNavigate={setLightboxItem}
          categoryLabel={categoryLabel}
        />
      )}
    </div>
  )
}

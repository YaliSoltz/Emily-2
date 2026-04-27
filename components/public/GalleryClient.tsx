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
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={onClose}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/25 text-xs tracking-[0.2em] font-light">
          {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors duration-200 p-1"
          aria-label="Close"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center px-16 min-h-0 relative">
        {hasPrev && (
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/80 transition-colors duration-200 p-2"
            aria-label="Previous"
          >
            <ChevronLeft size={32} strokeWidth={1} />
          </button>
        )}

        <div
          className="relative w-full h-full"
          onClick={e => e.stopPropagation()}
        >
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-contain"
              sizes="90vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 text-xs tracking-widest uppercase">{item.title}</span>
            </div>
          )}
        </div>

        {hasNext && (
          <button
            onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/80 transition-colors duration-200 p-2"
            aria-label="Next"
          >
            <ChevronRight size={32} strokeWidth={1} />
          </button>
        )}
      </div>

      {/* Caption */}
      <div
        className="shrink-0 px-6 py-5 text-center"
        onClick={e => e.stopPropagation()}
      >
        <p className="font-[family-name:var(--font-cormorant)] text-white/80 text-lg font-light tracking-wide">
          {item.title}
        </p>
        {item.category && (
          <p className="text-white/25 text-xs tracking-[0.2em] uppercase mt-1">
            {categoryLabel(item.category)}
          </p>
        )}
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

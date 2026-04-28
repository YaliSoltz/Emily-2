'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
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
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col animate-lightbox-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-xs tracking-[0.2em] font-light">
          {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <button
          onClick={onClose}
          className="text-white/75 hover:text-white transition-colors duration-200 p-2 -me-2"
          aria-label="Close"
        >
          <X size={22} strokeWidth={1.25} />
        </button>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center px-16 min-h-0 relative">
        {hasPrev && (
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white/65 hover:text-white transition-colors duration-200 p-3"
            aria-label="Previous"
          >
            <ChevronLeft size={32} strokeWidth={1} />
          </button>
        )}

        <div
          key={item.id}
          className="relative w-full h-full animate-lightbox-image"
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
              <span className="text-white/30 text-xs tracking-widest uppercase">{item.title}</span>
            </div>
          )}
        </div>

        {hasNext && (
          <button
            onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/65 hover:text-white transition-colors duration-200 p-3"
            aria-label="Next"
          >
            <ChevronRight size={32} strokeWidth={1} />
          </button>
        )}
      </div>

      {/* Caption */}
      <div
        key={`caption-${item.id}`}
        className="shrink-0 px-6 py-5 text-center animate-lightbox-image"
        onClick={e => e.stopPropagation()}
      >
        {item.category && (
          <p className="text-white/55 text-[10px] tracking-[0.25em] uppercase mb-2">
            {categoryLabel(item.category)}
          </p>
        )}
        <p className="font-[family-name:var(--font-cormorant)] text-white/95 text-xl font-light tracking-wide">
          {item.title}
        </p>
      </div>
    </div>
  )
}

interface GalleryClientProps {
  items: GalleryItem[]
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    document.body.style.overflow = lightboxItem ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxItem])

  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId) {
      const target = items.find(i => i.id === openId) ?? null
      setLightboxItem(target)
    }
  }, [searchParams, items])

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map(item => (
              <button
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="group text-start bg-white border border-[#5C3D2E]/8 hover:border-[#5C3D2E]/18 hover:shadow-[0_4px_24px_rgba(92,61,46,0.10)] transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-[#E8E0D5] overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
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
                      {item.category ? categoryLabel(item.category) : '   '}
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
          items={filtered}
          onClose={() => setLightboxItem(null)}
          onNavigate={setLightboxItem}
          categoryLabel={categoryLabel}
        />
      )}
    </div>
  )
}

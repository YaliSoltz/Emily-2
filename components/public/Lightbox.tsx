'use client'

import { useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export interface LightboxItem {
  id: string
  title: string
  image_url: string | null
  description?: string | null
  /** Small label above the title — a category, a collection, anything. */
  caption?: string | null
}

interface LightboxProps {
  item: LightboxItem
  items: LightboxItem[]
  onClose: () => void
  onNavigate: (item: LightboxItem) => void
  rtl: boolean
}

/** Full-screen image viewer with keyboard, swipe and RTL-aware arrows. */
export default function Lightbox({ item, items, onClose, onNavigate, rtl }: LightboxProps) {
  const idx = items.findIndex(i => i.id === item.id)
  const hasPrev = idx > 0
  const hasNext = idx < items.length - 1

  const prev = useCallback(() => { if (hasPrev) onNavigate(items[idx - 1]) }, [idx, items, hasPrev, onNavigate])
  const next = useCallback(() => { if (hasNext) onNavigate(items[idx + 1]) }, [idx, items, hasNext, onNavigate])

  // In RTL: left = forward (next), right = backward (prev)
  const goLeft = rtl ? next : prev
  const goRight = rtl ? prev : next
  const showLeft = rtl ? hasNext : hasPrev
  const showRight = rtl ? hasPrev : hasNext

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goLeft()
      if (e.key === 'ArrowRight') goRight()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, goLeft, goRight])

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) next()
    else prev()
  }, [next, prev])

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col animate-lightbox-in touch-pan-y"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar — fixed height */}
      <div className="h-14 flex items-center justify-between px-6 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-xs tracking-[0.2em] font-light" dir="ltr">
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
        {showLeft && (
          <button
            onClick={e => { e.stopPropagation(); goLeft() }}
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

        {showRight && (
          <button
            onClick={e => { e.stopPropagation(); goRight() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/65 hover:text-white transition-colors duration-200 p-3"
            aria-label="Next"
          >
            <ChevronRight size={32} strokeWidth={1} />
          </button>
        )}
      </div>

      {/* Caption — fixed height so the image area never shifts; scrollable if content is long */}
      <div className="h-44 shrink-0 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div key={`caption-${item.id}`} className="px-6 py-4 text-center animate-lightbox-image">
          {item.caption && (
            <p className="text-white/55 text-[10px] tracking-[0.25em] uppercase mb-2">
              {item.caption}
            </p>
          )}
          <p className="font-[family-name:var(--font-cormorant)] text-white/95 text-xl font-light tracking-wide">
            {item.title}
          </p>
          {item.description && (
            <p className="mt-2 text-white/60 text-xs leading-relaxed max-w-lg mx-auto">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

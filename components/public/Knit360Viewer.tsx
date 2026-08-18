'use client'

import Image from 'next/image'
import { useRef, useState, useEffect, useCallback } from 'react'
import { RotateCw } from 'lucide-react'
import type { Lang } from '@/lib/types'

/** Frames cached before the viewer becomes draggable. */
const READY_THRESHOLD = 6
/** Horizontal pixels of drag per frame step. */
const PX_PER_FRAME = 12

interface Knit360ViewerProps {
  frames: string[]
  /** Shown until enough frames are cached, and the permanent static alternative. */
  cover: string | null
  alt: string
  lang: Lang
}

/**
 * Image-sequence 360° viewer.
 *
 * Mount this only when a knit actually has rotation frames — there is no
 * simulated rotation and no control is rendered without real frames.
 *
 * Frames are fetched in order, starting when the viewer scrolls into view, so
 * a page of knits never downloads every sequence up front.
 */
export default function Knit360Viewer({ frames, cover, alt, lang }: Knit360ViewerProps) {
  const total = frames.length
  const containerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [started, setStarted] = useState(false)
  const [interacted, setInteracted] = useState(false)

  const dragRef = useRef<{ startX: number; startIndex: number } | null>(null)

  const ready = loaded >= Math.min(READY_THRESHOLD, total)

  // Begin preloading once the viewer is on screen.
  useEffect(() => {
    const el = containerRef.current
    if (!el || started) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  // Fetch frames in order; abandon any in flight on unmount.
  useEffect(() => {
    if (!started) return
    let cancelled = false
    const pending: HTMLImageElement[] = []

    const run = async () => {
      for (const src of frames) {
        if (cancelled) return
        await new Promise<void>(resolve => {
          const img = new window.Image()
          pending.push(img)
          img.onload = img.onerror = () => {
            if (!cancelled) setLoaded(n => n + 1)
            resolve()
          }
          img.src = src
        })
      }
    }
    void run()

    return () => {
      cancelled = true
      pending.forEach(img => { img.onload = null; img.onerror = null })
    }
  }, [started, frames])

  const step = useCallback((delta: number) => {
    setIndex(prev => ((prev + delta) % total + total) % total)
    setInteracted(true)
  }, [total])

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ready) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startIndex: index }
    setInteracted(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const frameDelta = Math.round((e.clientX - drag.startX) / PX_PER_FRAME)
    setIndex(((drag.startIndex + frameDelta) % total + total) % total)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
    else if (e.key === 'Home') { e.preventDefault(); setIndex(0); setInteracted(true) }
  }

  const label = lang === 'he'
    ? `סיבוב ${alt} — גררו או השתמשו במקשי החצים`
    : `Rotate ${alt} — drag or use the arrow keys`

  return (
    <div ref={containerRef} className="relative">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-valuetext={lang === 'he' ? `זווית ${index + 1} מתוך ${total}` : `Angle ${index + 1} of ${total}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        // pan-y keeps vertical page scrolling working while a horizontal drag rotates.
        className={`relative aspect-square w-full bg-white select-none touch-pan-y ${
          ready ? 'cursor-ew-resize' : 'cursor-progress'
        }`}
      >
        {/* Static alternative — also the initial state while frames load. */}
        {cover && (
          <Image
            src={cover}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className={`object-contain p-6 md:p-10 transition-opacity duration-300 ${ready ? 'opacity-0' : 'opacity-100'}`}
            priority
          />
        )}

        {ready && (
          // eslint-disable-next-line @next/next/no-img-element -- frames are swapped per pointer move; next/image would re-run the optimizer on every step
          <img
            src={frames[index]}
            alt={alt}
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain p-6 md:p-10 pointer-events-none"
          />
        )}

        {/* Drag hint — sits below the product, never over it */}
        {ready && !interacted && (
          <div
            aria-hidden="true"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#5C3D2E]/85 text-[#FAF7F2] px-3.5 py-1.5 rounded-full text-[11px] tracking-wide whitespace-nowrap"
          >
            <RotateCw size={13} />
            {lang === 'he' ? 'גררו כדי לסובב' : 'Drag to rotate'}
          </div>
        )}
      </div>

      {/* Load progress */}
      {!ready && (
        <div className="mt-3 h-px w-full bg-[#5C3D2E]/10" aria-hidden="true">
          <div
            className="h-full bg-[#5C3D2E]/40 transition-[width] duration-200"
            style={{ width: `${Math.round((loaded / total) * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

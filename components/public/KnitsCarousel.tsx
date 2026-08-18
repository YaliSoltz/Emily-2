'use client'

import Image from 'next/image'
import NavLink from './NavLink'
import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSiteData } from '@/lib/context/SiteDataContext'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { knitAlt, knitTitle } from '@/lib/knit'

export default function KnitsCarousel() {
  const { lang, knits } = useSiteData()
  const reducedMotion = usePrefersReducedMotion()
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  // Track which slide is centred, for the numeric position readout.
  useEffect(() => {
    const track = trackRef.current
    if (!track || knits.length === 0) return

    const slides = Array.from(track.querySelectorAll<HTMLElement>('[data-slide]'))
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const idx = slides.indexOf(visible.target as HTMLElement)
        if (idx >= 0) setActive(idx)
      },
      { root: track, threshold: [0.5, 0.75, 1] }
    )
    slides.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [knits.length])

  /** `dir` is +1 for "later in the list", regardless of writing direction. */
  const scrollByStep = useCallback((dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const slide = track.querySelector<HTMLElement>('[data-slide]')
    const step = slide ? slide.offsetWidth + 24 : track.clientWidth * 0.8
    // In RTL the visual axis is mirrored: "next" means a more negative scrollLeft.
    const rtl = getComputedStyle(track).direction === 'rtl'
    track.scrollBy({
      left: step * dir * (rtl ? -1 : 1),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [reducedMotion])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const rtl = lang === 'he'
    const forward = rtl ? e.key === 'ArrowLeft' : e.key === 'ArrowRight'
    scrollByStep(forward ? 1 : -1)
  }

  if (knits.length === 0) return null

  const heading = lang === 'he' ? 'הסריגים' : 'The Knits'
  const total = String(knits.length).padStart(2, '0')
  const current = String(Math.min(active + 1, knits.length)).padStart(2, '0')

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-light text-[#3D2519] tracking-wide">
            {heading}
          </h2>

          {knits.length > 1 && (
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs tracking-[0.2em] text-[#5C3D2E]/60 tabular-nums" dir="ltr">
                {current} / {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollByStep(lang === 'he' ? 1 : -1)}
                  aria-label={lang === 'he' ? 'הסריג הבא' : 'Previous knit'}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#5C3D2E]/60 hover:text-[#5C3D2E] transition-colors"
                >
                  <ChevronLeft size={22} strokeWidth={1.25} />
                </button>
                <button
                  onClick={() => scrollByStep(lang === 'he' ? -1 : 1)}
                  aria-label={lang === 'he' ? 'הסריג הקודם' : 'Next knit'}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#5C3D2E]/60 hover:text-[#5C3D2E] transition-colors"
                >
                  <ChevronRight size={22} strokeWidth={1.25} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Native scroll-snap track: touch swipe, momentum and RTL come from the browser. */}
      <ul
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="region"
        aria-roledescription={lang === 'he' ? 'קרוסלה' : 'carousel'}
        aria-label={lang === 'he' ? 'קרוסלת סריגים' : 'Knits carousel'}
        className="no-scrollbar flex gap-6 overflow-x-auto snap-x snap-mandatory px-6 md:px-[max(1.5rem,calc((100vw-72rem)/2))] pb-2"
      >
        {knits.map((knit, i) => (
          <li
            key={knit.id}
            data-slide
            className="snap-center shrink-0 w-[78vw] sm:w-[46vw] lg:w-[30%] max-w-[360px]"
          >
            <NavLink href={`/knits/${knit.slug}`} className="group block">
              {/* White, borderless, object-contain — the knit floats and is never cropped */}
              <div className="relative aspect-[3/4] bg-white overflow-hidden">
                {knit.cover_image ? (
                  <Image
                    src={knit.cover_image}
                    alt={knitAlt(knit, lang)}
                    fill
                    loading={i < 2 ? 'eager' : 'lazy'}
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 360px"
                    className="object-contain p-6 md:p-8 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F5F0E8]">
                    <span className="text-[#5C3D2E]/30 text-xs tracking-widest uppercase">
                      {knitTitle(knit, lang)}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-center font-[family-name:var(--font-cormorant)] text-lg font-light text-[#3D2519] group-hover:text-[#5C3D2E] transition-colors">
                {knitTitle(knit, lang)}
              </p>
            </NavLink>
          </li>
        ))}
      </ul>

      <p className="sr-only" aria-live="polite">
        {lang === 'he'
          ? `סריג ${active + 1} מתוך ${knits.length}`
          : `Knit ${active + 1} of ${knits.length}`}
      </p>

      <div className="text-center mt-12">
        <NavLink
          href="/knits"
          className="inline-flex items-center gap-2 text-sm text-[#5C3D2E] border-b border-[#5C3D2E]/40 pb-0.5 hover:border-[#5C3D2E] transition-colors tracking-widest uppercase"
        >
          {lang === 'he' ? 'לכל הסריגים' : 'View All Knits'}
        </NavLink>
      </div>
    </section>
  )
}

'use client'

import Image from 'next/image'
import NavLink from './NavLink'
import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useSiteData } from '@/lib/context/SiteDataContext'
import { resolveHeroMedia } from '@/lib/hero'
import { usePrefersReducedMotion, useSavesData } from '@/lib/hooks'
import type { Lang } from '@/lib/types'

interface HeroCopy {
  eyebrow: string
  title: string
  subtitle: string
  cta: string
}

function copy(c: Record<string, string>, lang: Lang): HeroCopy {
  return {
    eyebrow: lang === 'he' ? 'תיק עבודות' : 'Portfolio',
    title: c.hero_title || (lang === 'he' ? 'עיצוב שמדבר בשקט' : 'Design That Speaks Quietly'),
    subtitle: c.hero_subtitle || (lang === 'he'
      ? 'עיצוב טקסטיל · סריגה · הדפסי רשת'
      : 'Textile Design · Knitting · Screen Printing'),
    cta: c.hero_cta || (lang === 'he' ? 'צפייה בעבודות' : 'View Work'),
  }
}

export default function HomeHero() {
  const { lang, homeContent } = useSiteData()
  const reducedMotion = usePrefersReducedMotion()
  const savesData = useSavesData()
  const [videoFailed, setVideoFailed] = useState(false)

  const c = (lang === 'he' ? homeContent.he?.content_json : homeContent.en?.content_json) as Record<string, string> ?? {}
  const t = copy(c, lang)
  const ArrowIcon = lang === 'he' ? ArrowLeft : ArrowRight

  // The visual is language-agnostic and always lives on the Hebrew row.
  const media = resolveHeroMedia(homeContent.he)

  // Autoplay is skipped for reduced-motion, Data Saver, or a video that failed
  // to load — in each case the poster image is what remains on screen.
  // Both preferences server-render as `false`, so hydration matches.
  const playVideo = media.type === 'video' && !reducedMotion && !savesData && !videoFailed

  const hasMedia = media.type !== 'none'
  const alt = hasMedia ? (media.alt || t.title) : ''
  const stillSrc = media.type === 'video' ? media.poster : media.type === 'image' ? media.src : null

  return (
    <section className="relative min-h-[85svh] md:min-h-[92svh] flex flex-col items-center justify-end overflow-hidden bg-[#FAF7F2]">
      {/* Media layer */}
      {stillSrc && (
        <Image
          src={stillSrc}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: media.type === 'none' ? 'center' : media.focal }}
        />
      )}

      {playVideo && media.type === 'video' && (
        <video
          key={media.src}
          src={media.src}
          poster={media.poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: media.focal }}
        />
      )}

      {/* Scrim — only over media, sized so the text band clears 4.5:1 on any photo */}
      {hasMedia && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10"
          aria-hidden="true"
        />
      )}

      {/* Copy */}
      <div
        className={`relative animate-fade-in-up max-w-2xl text-center px-6 ${
          hasMedia ? 'pb-20 md:pb-28' : 'pb-0 my-auto'
        }`}
      >
        <p className={`text-xs tracking-[0.3em] uppercase mb-6 ${hasMedia ? 'text-white/80' : 'text-[#5C3D2E]/60'}`}>
          {t.eyebrow}
        </p>
        <h1
          className={`font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl font-light leading-tight mb-6 ${
            hasMedia ? 'text-white' : 'text-[#3D2519]'
          }`}
        >
          {t.title}
        </h1>
        <p
          className={`text-sm md:text-base tracking-wide mb-10 max-w-lg mx-auto ${
            hasMedia ? 'text-white/85' : 'text-[#5C3D2E]/70'
          }`}
        >
          {t.subtitle}
        </p>
        <NavLink
          href="/knits"
          className={`inline-flex items-center gap-3 px-8 py-3.5 text-xs tracking-[0.2em] uppercase transition-colors duration-200 ${
            hasMedia
              ? 'bg-[#FAF7F2] text-[#3D2519] hover:bg-white'
              : 'bg-[#5C3D2E] text-[#F5F0E8] hover:bg-[#3D2519]'
          }`}
        >
          {t.cta}
          <ArrowIcon size={14} />
        </NavLink>
      </div>

      {/* Scroll cue */}
      <div
        className={`relative mb-8 w-px h-12 ${hasMedia ? 'bg-white/50' : 'bg-[#5C3D2E]/30'}`}
        aria-hidden="true"
      />
    </section>
  )
}

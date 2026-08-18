'use client'

import Image from 'next/image'
import NavLink from './NavLink'
import Knit360Viewer from './Knit360Viewer'
import Lightbox, { type LightboxItem } from './Lightbox'
import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useSiteData } from '@/lib/context/SiteDataContext'
import { knitAlt, knitTitle, knitDescription, hasRotation } from '@/lib/knit'

export default function KnitDetailClient({ slug }: { slug: string }) {
  const { lang, knits } = useSiteData()
  const [lightboxId, setLightboxId] = useState<string | null>(null)

  const knit = knits.find(k => k.slug === slug) ?? null

  useEffect(() => {
    document.body.style.overflow = lightboxId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxId])

  const BackIcon = lang === 'he' ? ArrowRight : ArrowLeft

  if (!knit) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 text-center">
        <p className="text-[#5C3D2E]/60 text-sm tracking-widest uppercase">
          {lang === 'he' ? 'הסריג לא נמצא' : 'Knit not found'}
        </p>
      </div>
    )
  }

  const title = knitTitle(knit, lang)
  const alt = knitAlt(knit, lang)
  const description = knitDescription(knit, lang)
  const showRotation = hasRotation(knit)

  const lightboxItems: LightboxItem[] = knit.images.map((src, i) => ({
    id: `${knit.id}-${i}`,
    title,
    image_url: src,
    caption: lang === 'he' ? 'סריגים' : 'Knits',
  }))
  const lightboxItem = lightboxItems.find(i => i.id === lightboxId) ?? null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <NavLink
          href="/knits"
          className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#5C3D2E]/70 hover:text-[#5C3D2E] transition-colors mb-10"
        >
          <BackIcon size={13} />
          {lang === 'he' ? 'לכל הסריגים' : 'All knits'}
        </NavLink>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Visual — 360° viewer when frames exist, otherwise the static cover */}
          <div>
            {showRotation ? (
              <Knit360Viewer
                frames={knit.rotation_frames}
                cover={knit.cover_image}
                alt={alt}
                lang={lang}
              />
            ) : (
              <div className="relative aspect-square w-full bg-white">
                {knit.cover_image ? (
                  <Image
                    src={knit.cover_image}
                    alt={alt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="object-contain p-6 md:p-10"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F5F0E8]">
                    <span className="text-[#5C3D2E]/30 text-xs tracking-widest uppercase">{title}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Copy */}
          <div className="md:pt-6">
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#3D2519] leading-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-6 text-[#5C3D2E]/75 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {description}
              </p>
            )}
            {showRotation && (
              <p className="mt-8 text-xs tracking-[0.15em] uppercase text-[#5C3D2E]/60">
                {lang === 'he'
                  ? 'גררו את התמונה או השתמשו במקשי החצים כדי לסובב'
                  : 'Drag the image or use the arrow keys to rotate'}
              </p>
            )}
          </div>
        </div>

        {/* Detail shots */}
        {knit.images.length > 0 && (
          <div className="mt-20">
            <h2 className="sr-only">{lang === 'he' ? 'תמונות נוספות' : 'More images'}</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {knit.images.map((src, i) => (
                <li key={src}>
                  <button
                    onClick={() => setLightboxId(`${knit.id}-${i}`)}
                    aria-label={lang === 'he' ? `הגדלת תמונה ${i + 1}` : `Enlarge image ${i + 1}`}
                    className="group relative block aspect-square w-full bg-white overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt={`${alt} — ${i + 1}`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 45vw, 30vw"
                      className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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

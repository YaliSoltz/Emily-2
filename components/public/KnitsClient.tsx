'use client'

import Image from 'next/image'
import NavLink from './NavLink'
import { useSiteData } from '@/lib/context/SiteDataContext'
import { knitAlt, knitTitle, hasRotation } from '@/lib/knit'
import { RotateCw } from 'lucide-react'

export default function KnitsClient() {
  const { lang, knits } = useSiteData()

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-10 px-6 text-center border-b border-[#5C3D2E]/10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#5C3D2E]/60 mb-3">
          {lang === 'he' ? 'תיק עבודות' : 'Portfolio'}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#3D2519]">
          {lang === 'he' ? 'סריגים' : 'Knits'}
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        {knits.length === 0 ? (
          <div className="text-center py-20 text-[#5C3D2E]/50 text-sm tracking-widest uppercase">
            {lang === 'he' ? 'סריגים יתווספו בקרוב' : 'Knits coming soon'}
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {knits.map((knit, i) => (
              <li key={knit.id}>
                <NavLink href={`/knits/${knit.slug}`} className="group block">
                  <div className="relative aspect-[3/4] bg-white overflow-hidden">
                    {knit.cover_image ? (
                      <Image
                        src={knit.cover_image}
                        alt={knitAlt(knit, lang)}
                        fill
                        loading={i < 3 ? 'eager' : 'lazy'}
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 340px"
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

                  <p className="mt-4 text-center font-[family-name:var(--font-cormorant)] text-xl font-light text-[#3D2519] group-hover:text-[#5C3D2E] transition-colors">
                    {knitTitle(knit, lang)}
                  </p>

                  {hasRotation(knit) && (
                    <p className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-[#5C3D2E]/60">
                      <RotateCw size={11} aria-hidden="true" />
                      {lang === 'he' ? 'תצוגת 360°' : '360° view'}
                    </p>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

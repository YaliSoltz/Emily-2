'use client'

import Image from 'next/image'
import { useSiteData } from '@/lib/context/SiteDataContext'

export default function AboutClient() {
  const { lang, aboutContent } = useSiteData()
  const c = (lang === 'he' ? aboutContent.he?.content_json : aboutContent.en?.content_json) as Record<string, unknown> ?? {}
  const images = (aboutContent.he?.images_json ?? {}) as Record<string, string>

  const title = c.title as string
  const bio = c.bio as string
  const disciplinesTitle = c.disciplines_title as string
  const disciplines = c.disciplines as string[] | undefined
  const profileImage = images.profile_url as string | undefined

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Page header */}
      <div className="pt-24 pb-12 px-6 text-center border-b border-[#5C3D2E]/10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#5C3D2E]/50 mb-3">
          {lang === 'he' ? 'אודות' : 'About'}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#3D2519]">
          Emily Tal
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Photo */}
          <div className="aspect-[3/4] bg-[#E8E0D5] overflow-hidden relative">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Emily Tal"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#5C3D2E]/20 text-xs tracking-widest uppercase">Photo</span>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col gap-8 pt-4">
            <div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#3D2519] mb-5">
                {title ?? (lang === 'he' ? 'אודות' : 'About')}
              </h2>
              <p className="text-[#5C3D2E]/80 leading-relaxed text-base">
                {bio ?? (lang === 'he'
                  ? 'אני אמילי טל, מעצבת טקסטיל בוגרת תואר ראשון. העבודות שלי עוסקות בחקירת חומרים, מרקמים וטכניקות — מסריגה ביד ועד הדפסת מסך.'
                  : "I'm Emily Tal, a textile design graduate. My work explores materials, textures and techniques — from hand knitting to screen printing.")}
              </p>
            </div>

            {/* Disciplines */}
            {disciplines && disciplines.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-[#5C3D2E]/50 mb-4">
                  {disciplinesTitle ?? (lang === 'he' ? 'תחומי עיסוק' : 'Disciplines')}
                </p>
                <ul className="flex flex-col gap-2">
                  {disciplines.map((d: string) => (
                    <li key={d} className="flex items-center gap-3 text-[#3D2519]">
                      <span className="w-8 h-px bg-[#5C3D2E]/40 inline-block" />
                      <span className="text-sm tracking-wide">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact link */}
            <div className="pt-4 border-t border-[#5C3D2E]/10">
              <a
                href="/contact"
                className="text-sm text-[#5C3D2E] tracking-widest uppercase border-b border-[#5C3D2E]/40 pb-0.5 hover:border-[#5C3D2E] transition-colors inline-block"
              >
                {lang === 'he' ? 'יצירת קשר' : 'Get in touch'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

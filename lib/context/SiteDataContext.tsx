'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type {
  Lang,
  ContactInfo,
  SocialLink,
  PageContent,
  GalleryItem,
  GalleryPreviewItem,
  Knit,
} from '@/lib/types'

export interface SiteData {
  lang: Lang
  setLang: (lang: Lang) => void
  contactInfo: ContactInfo | null
  socialLinks: SocialLink[]
  homeContent: PageContent
  aboutContent: PageContent
  contactContent: PageContent
  galleryItems: GalleryItem[]
  galleryPreview: GalleryPreviewItem[]
  knits: Knit[]
}

const SiteDataContext = createContext<SiteData | null>(null)

interface SiteDataProviderProps {
  children: React.ReactNode
  initialLang: Lang
  contactInfo: ContactInfo | null
  socialLinks: SocialLink[]
  homeContent: PageContent
  aboutContent: PageContent
  contactContent: PageContent
  galleryItems: GalleryItem[]
  galleryPreview: GalleryPreviewItem[]
  knits: Knit[]
}

export function SiteDataProvider({
  children,
  initialLang,
  contactInfo,
  socialLinks,
  homeContent,
  aboutContent,
  contactContent,
  galleryItems,
  galleryPreview,
  knits,
}: SiteDataProviderProps) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = useCallback((newLang: Lang) => {
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }, [])

  return (
    <SiteDataContext.Provider
      value={{
        lang,
        setLang,
        contactInfo,
        socialLinks,
        homeContent,
        aboutContent,
        contactContent,
        galleryItems,
        galleryPreview,
        knits,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  )
}

export function useSiteData(): SiteData {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider')
  return ctx
}

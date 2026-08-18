'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { invalidatePages } from '@/lib/actions'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { AdminField, AdminInput, AdminTextarea } from '@/components/admin/AdminField'
import ImageUpload from '@/components/admin/ImageUpload'
import MediaUpload from '@/components/admin/MediaUpload'

type LangContent = {
  hero_title: string
  hero_subtitle: string
  hero_cta: string
  intro_text: string
}

/**
 * The hero visual is language-agnostic and is stored on the Hebrew row only —
 * `resolveHeroMedia` always reads `homeContent.he`.
 */
type HeroMedia = {
  hero_media_type: 'none' | 'image' | 'video'
  hero_focal: string
  hero_alt: string
  hero_image_url: string
  hero_video_url: string
  hero_poster_url: string
}

const empty: LangContent = { hero_title: '', hero_subtitle: '', hero_cta: '', intro_text: '' }

const emptyMedia: HeroMedia = {
  hero_media_type: 'none', hero_focal: 'center', hero_alt: '',
  hero_image_url: '', hero_video_url: '', hero_poster_url: '',
}

const focalOptions = [
  { value: 'center',     label: 'מרכז' },
  { value: 'center top', label: 'למעלה' },
  { value: 'center 30%', label: 'מעט למעלה' },
  { value: 'center 70%', label: 'מעט למטה' },
  { value: 'center bottom', label: 'למטה' },
]

const mediaTypes = [
  { value: 'none',  label: 'ללא — כותרת בלבד' },
  { value: 'image', label: 'תמונה' },
  { value: 'video', label: 'סרטון' },
] as const

export default function AdminHomePage() {
  const [he, setHe] = useState<LangContent>(empty)
  const [en, setEn] = useState<LangContent>(empty)
  const [media, setMedia] = useState<HeroMedia>(emptyMedia)
  const [saved, setSaved] = useState({ he: empty, en: empty, media: emptyMedia })
  const [activeLang, setActiveLang] = useState<'he' | 'en'>('he')
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const [{ data: heData }, { data: enData }] = await Promise.all([
        supabase.from('pages').select('content_json, images_json').eq('page_name', 'home').eq('language', 'he').single(),
        supabase.from('pages').select('content_json, images_json').eq('page_name', 'home').eq('language', 'en').single(),
      ])
      const heJson = (heData?.content_json ?? {}) as Partial<LangContent & HeroMedia>
      const enJson = (enData?.content_json ?? {}) as Partial<LangContent>
      const heImages = (heData?.images_json ?? {}) as Partial<HeroMedia>

      const heC: LangContent = { ...empty, ...pickCopy(heJson) }
      const enC: LangContent = { ...empty, ...pickCopy(enJson) }
      const heM: HeroMedia = {
        ...emptyMedia,
        hero_media_type: heJson.hero_media_type ?? emptyMedia.hero_media_type,
        hero_focal: heJson.hero_focal ?? emptyMedia.hero_focal,
        hero_alt: heJson.hero_alt ?? '',
        hero_image_url: heImages.hero_image_url ?? '',
        hero_video_url: heImages.hero_video_url ?? '',
        hero_poster_url: heImages.hero_poster_url ?? '',
      }

      setHe(heC); setEn(enC); setMedia(heM)
      setSaved({ he: heC, en: enC, media: heM })
      setLoading(false)
    }
    fetch()
  }, [])

  const updateHe = (k: keyof LangContent, v: string) => {
    setHe(p => ({ ...p, [k]: v })); setHasChanges(true)
  }
  const updateEn = (k: keyof LangContent, v: string) => {
    setEn(p => ({ ...p, [k]: v })); setHasChanges(true)
  }
  const updateMedia = (patch: Partial<HeroMedia>) => {
    setMedia(p => ({ ...p, ...patch })); setHasChanges(true)
  }

  const handleSave = async () => {
    const supabase = createClient()
    const { hero_image_url, hero_video_url, hero_poster_url, ...heroCopy } = media

    await Promise.all([
      supabase.from('pages').upsert({
        page_name: 'home',
        language: 'he',
        content_json: { ...he, ...heroCopy },
        images_json: { hero_image_url, hero_video_url, hero_poster_url },
      }, { onConflict: 'page_name,language' }),
      supabase.from('pages').upsert({
        page_name: 'home',
        language: 'en',
        content_json: en,
        images_json: {},
      }, { onConflict: 'page_name,language' }),
    ])
    await invalidatePages()
    setSaved({ he, en, media })
    setHasChanges(false)
  }

  const handleCancel = () => {
    setHe(saved.he); setEn(saved.en); setMedia(saved.media); setHasChanges(false)
  }

  const c = activeLang === 'he' ? he : en
  const update = activeLang === 'he' ? updateHe : updateEn

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  return (
    <AdminTabLayout title="דף הבית" hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel}>
      {/* Lang switcher */}
      <div className="flex gap-2 mb-6">
        {(['he', 'en'] as const).map(l => (
          <button key={l} onClick={() => setActiveLang(l)}
            className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-colors ${activeLang === l ? 'bg-[#5C3D2E] text-[#F5F0E8]' : 'border border-[#5C3D2E]/20 text-[#5C3D2E]/60 hover:border-[#5C3D2E]/50'}`}>
            {l === 'he' ? '🇮🇱 עברית' : '🇺🇸 English'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-5 max-w-2xl" dir={activeLang === 'he' ? 'rtl' : 'ltr'}>
        <AdminField label="כותרת ראשית">
          <AdminInput value={c.hero_title} onChange={e => update('hero_title', e.target.value)} placeholder="עיצוב שמדבר בשקט" />
        </AdminField>
        <AdminField label="תת-כותרת">
          <AdminInput value={c.hero_subtitle} onChange={e => update('hero_subtitle', e.target.value)} placeholder="עיצוב טקסטיל · סריגה · הדפסי רשת" />
        </AdminField>
        <AdminField label='טקסט כפתור "צפייה בעבודות"'>
          <AdminInput value={c.hero_cta} onChange={e => update('hero_cta', e.target.value)} placeholder="צפייה בעבודות" />
        </AdminField>
        <AdminField label="טקסט פתיחה (מתחת ל-Hero)">
          <AdminTextarea rows={3} value={c.intro_text} onChange={e => update('intro_text', e.target.value)} placeholder="ברוכים הבאים לעולם של אמילי טל..." />
        </AdminField>
      </div>

      {/* Hero visual — shared by both languages */}
      <div className="max-w-2xl mt-12 pt-8 border-t border-[#5C3D2E]/10" dir="rtl">
        <h2 className="text-sm tracking-widest uppercase text-[#3D2519] mb-1">ויז&apos;ואל הפתיחה</h2>
        <p className="text-xs text-[#5C3D2E]/50 mb-6">
          התמונה או הסרטון הגדול בראש דף הבית. משותף לשתי השפות. אם לא נבחר כלום — יוצגו הכותרות על רקע בז&apos;.
        </p>

        <div className="flex flex-col gap-5">
          <AdminField label="סוג הוויז'ואל">
            <select
              value={media.hero_media_type}
              onChange={e => updateMedia({ hero_media_type: e.target.value as HeroMedia['hero_media_type'] })}
              className="w-full bg-white border border-[#5C3D2E]/15 px-3 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40"
            >
              {mediaTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </AdminField>

          {media.hero_media_type === 'image' && (
            <AdminField label="תמונת פתיחה" hint="מומלץ: לפחות 2000px רוחב, לרוחב (landscape)">
              <ImageUpload
                currentUrl={media.hero_image_url}
                onUpload={url => updateMedia({ hero_image_url: url })}
                onRemove={() => updateMedia({ hero_image_url: '' })}
                folder="hero"
              />
            </AdminField>
          )}

          {media.hero_media_type === 'video' && (
            <>
              <AdminField label="סרטון פתיחה" hint="מתנגן אוטומטית, ללא קול, בלולאה. מומלץ לדחוס לפני העלאה.">
                <MediaUpload
                  currentUrl={media.hero_video_url}
                  onUpload={url => updateMedia({ hero_video_url: url })}
                  onRemove={() => updateMedia({ hero_video_url: '' })}
                />
              </AdminField>
              <AdminField
                label="תמונת פוסטר"
                hint="פריים מייצג מהסרטון. מוצג עד שהסרטון נטען, וכן למשתמשים שביקשו לצמצם תנועה או שנמצאים בחיבור איטי. חשוב מאוד להעלות."
              >
                <ImageUpload
                  currentUrl={media.hero_poster_url}
                  onUpload={url => updateMedia({ hero_poster_url: url })}
                  onRemove={() => updateMedia({ hero_poster_url: '' })}
                  folder="hero"
                />
              </AdminField>
            </>
          )}

          {media.hero_media_type !== 'none' && (
            <>
              <AdminField label="מוקד התמונה" hint="באיזה חלק של התמונה להתמקד כשהמסך צר או רחב מדי.">
                <select
                  value={media.hero_focal}
                  onChange={e => updateMedia({ hero_focal: e.target.value })}
                  className="w-full bg-white border border-[#5C3D2E]/15 px-3 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40"
                >
                  {focalOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </AdminField>

              <AdminField label="טקסט חלופי לוויז'ואל" hint="תיאור קצר של מה שרואים בתמונה, לקוראי מסך. ריק = הכותרת הראשית.">
                <AdminInput
                  value={media.hero_alt}
                  onChange={e => updateMedia({ hero_alt: e.target.value })}
                  placeholder="סריגים על שפת הים"
                />
              </AdminField>
            </>
          )}
        </div>
      </div>
    </AdminTabLayout>
  )
}

function pickCopy(json: Partial<LangContent>): LangContent {
  return {
    hero_title: json.hero_title ?? '',
    hero_subtitle: json.hero_subtitle ?? '',
    hero_cta: json.hero_cta ?? '',
    intro_text: json.intro_text ?? '',
  }
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { AdminField, AdminInput, AdminTextarea } from '@/components/admin/AdminField'
import ImageUpload from '@/components/admin/ImageUpload'

type AboutContent = { title: string; bio: string; disciplines_title: string; disciplines: string[] }
const empty: AboutContent = { title: '', bio: '', disciplines_title: '', disciplines: [] }

export default function AdminAboutPage() {
  const [he, setHe] = useState<AboutContent>(empty)
  const [en, setEn] = useState<AboutContent>(empty)
  const [profileUrl, setProfileUrl] = useState<string>('')
  const [saved, setSaved] = useState({ he: empty, en: empty, profileUrl: '' })
  const [activeLang, setActiveLang] = useState<'he' | 'en'>('he')
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: heData }, { data: enData }] = await Promise.all([
        supabase.from('pages').select('content_json, images_json').eq('page_name', 'about').eq('language', 'he').single(),
        supabase.from('pages').select('content_json').eq('page_name', 'about').eq('language', 'en').single(),
      ])
      const heC = (heData?.content_json ?? empty) as AboutContent
      const enC = (enData?.content_json ?? empty) as AboutContent
      const url = (heData?.images_json as Record<string, string>)?.profile_url ?? ''
      setHe(heC); setEn(enC); setProfileUrl(url)
      setSaved({ he: heC, en: enC, profileUrl: url })
      setLoading(false)
    }
    load()
  }, [])

  const mark = () => setHasChanges(true)
  const updateHe = (k: keyof AboutContent, v: string | string[]) => { setHe(p => ({ ...p, [k]: v })); mark() }
  const updateEn = (k: keyof AboutContent, v: string | string[]) => { setEn(p => ({ ...p, [k]: v })); mark() }

  const handleSave = async () => {
    const supabase = createClient()
    await Promise.all([
      supabase.from('pages').upsert({ page_name: 'about', language: 'he', content_json: he, images_json: { profile_url: profileUrl } }, { onConflict: 'page_name,language' }),
      supabase.from('pages').upsert({ page_name: 'about', language: 'en', content_json: en, images_json: {} }, { onConflict: 'page_name,language' }),
    ])
    setSaved({ he, en, profileUrl })
    setHasChanges(false)
  }

  const handleCancel = () => { setHe(saved.he); setEn(saved.en); setProfileUrl(saved.profileUrl); setHasChanges(false) }

  const c = activeLang === 'he' ? he : en
  const update = activeLang === 'he' ? updateHe : updateEn

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  return (
    <AdminTabLayout title="אודות" hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel}>
      {/* Lang switcher */}
      <div className="flex gap-2 mb-6">
        {(['he', 'en'] as const).map(l => (
          <button key={l} onClick={() => setActiveLang(l)}
            className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-colors ${activeLang === l ? 'bg-[#5C3D2E] text-[#F5F0E8]' : 'border border-[#5C3D2E]/20 text-[#5C3D2E]/60 hover:border-[#5C3D2E]/50'}`}>
            {l === 'he' ? '🇮🇱 עברית' : '🇺🇸 English'}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <div className="flex flex-col gap-5" dir={activeLang === 'he' ? 'rtl' : 'ltr'}>
          <AdminField label="כותרת">
            <AdminInput value={c.title} onChange={e => update('title', e.target.value)} placeholder="אודות" />
          </AdminField>
          <AdminField label="ביוגרפיה">
            <AdminTextarea rows={6} value={c.bio} onChange={e => update('bio', e.target.value)} placeholder="אני אמילי טל..." />
          </AdminField>
          <AdminField label="כותרת תחומי עיסוק">
            <AdminInput value={c.disciplines_title} onChange={e => update('disciplines_title', e.target.value)} placeholder="תחומי עיסוק" />
          </AdminField>
          <AdminField label="תחומי עיסוק (שורה אחת לכל תחום)">
            <AdminTextarea
              rows={4}
              value={(c.disciplines ?? []).join('\n')}
              onChange={e => update('disciplines', e.target.value.split('\n').filter(Boolean))}
              placeholder={"עיצוב טקסטיל\nסריגה\nהדפסי רשת"}
            />
          </AdminField>
        </div>

        <div>
          <AdminField label="תמונת פרופיל" hint="מומלץ: 600×800px, יחס 3:4">
            <ImageUpload
              currentUrl={profileUrl}
              onUpload={url => { setProfileUrl(url); mark() }}
              onRemove={() => { setProfileUrl(''); mark() }}
              folder="about"
              hint="600×800px מומלץ"
            />
          </AdminField>
        </div>
      </div>
    </AdminTabLayout>
  )
}

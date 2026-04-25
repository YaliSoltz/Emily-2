'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { AdminField, AdminInput, AdminTextarea } from '@/components/admin/AdminField'

type LangContent = {
  hero_title: string
  hero_subtitle: string
  hero_cta: string
  intro_text: string
}

const empty: LangContent = { hero_title: '', hero_subtitle: '', hero_cta: '', intro_text: '' }

export default function AdminHomePage() {
  const [he, setHe] = useState<LangContent>(empty)
  const [en, setEn] = useState<LangContent>(empty)
  const [saved, setSaved] = useState({ he: empty, en: empty })
  const [activeLang, setActiveLang] = useState<'he' | 'en'>('he')
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const [{ data: heData }, { data: enData }] = await Promise.all([
        supabase.from('pages').select('content_json').eq('page_name', 'home').eq('language', 'he').single(),
        supabase.from('pages').select('content_json').eq('page_name', 'home').eq('language', 'en').single(),
      ])
      const heC = (heData?.content_json ?? empty) as LangContent
      const enC = (enData?.content_json ?? empty) as LangContent
      setHe(heC); setEn(enC)
      setSaved({ he: heC, en: enC })
      setLoading(false)
    }
    fetch()
  }, [])

  const updateHe = (k: keyof LangContent, v: string) => {
    setHe(p => { const n = { ...p, [k]: v }; setHasChanges(true); return n })
  }
  const updateEn = (k: keyof LangContent, v: string) => {
    setEn(p => { const n = { ...p, [k]: v }; setHasChanges(true); return n })
  }

  const handleSave = async () => {
    const supabase = createClient()
    await Promise.all([
      supabase.from('pages').upsert({ page_name: 'home', language: 'he', content_json: he, images_json: {} }, { onConflict: 'page_name,language' }),
      supabase.from('pages').upsert({ page_name: 'home', language: 'en', content_json: en, images_json: {} }, { onConflict: 'page_name,language' }),
    ])
    setSaved({ he, en })
    setHasChanges(false)
  }

  const handleCancel = () => {
    setHe(saved.he); setEn(saved.en); setHasChanges(false)
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
    </AdminTabLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { invalidatePages } from '@/lib/actions'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { AdminField, AdminInput } from '@/components/admin/AdminField'

type ContactContent = {
  title: string; subtitle: string; name_label: string
  email_label: string; message_label: string; submit_label: string; success_message: string
}
const empty: ContactContent = { title: '', subtitle: '', name_label: '', email_label: '', message_label: '', submit_label: '', success_message: '' }

export default function AdminContactPage() {
  const [he, setHe] = useState<ContactContent>(empty)
  const [en, setEn] = useState<ContactContent>(empty)
  const [saved, setSaved] = useState({ he: empty, en: empty })
  const [activeLang, setActiveLang] = useState<'he' | 'en'>('he')
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: heData }, { data: enData }] = await Promise.all([
        supabase.from('pages').select('content_json').eq('page_name', 'contact').eq('language', 'he').single(),
        supabase.from('pages').select('content_json').eq('page_name', 'contact').eq('language', 'en').single(),
      ])
      const heC = (heData?.content_json ?? empty) as ContactContent
      const enC = (enData?.content_json ?? empty) as ContactContent
      setHe(heC); setEn(enC); setSaved({ he: heC, en: enC }); setLoading(false)
    }
    load()
  }, [])

  const update = (setter: typeof setHe) => (k: keyof ContactContent, v: string) => {
    setter(p => ({ ...p, [k]: v })); setHasChanges(true)
  }
  const updateHe = update(setHe)
  const updateEn = update(setEn)

  const handleSave = async () => {
    const supabase = createClient()
    await Promise.all([
      supabase.from('pages').upsert({ page_name: 'contact', language: 'he', content_json: he, images_json: {} }, { onConflict: 'page_name,language' }),
      supabase.from('pages').upsert({ page_name: 'contact', language: 'en', content_json: en, images_json: {} }, { onConflict: 'page_name,language' }),
    ])
    await invalidatePages()
    setSaved({ he, en }); setHasChanges(false)
  }

  const handleCancel = () => { setHe(saved.he); setEn(saved.en); setHasChanges(false) }

  const c = activeLang === 'he' ? he : en
  const upd = activeLang === 'he' ? updateHe : updateEn
  const fields: { key: keyof ContactContent; label: string }[] = [
    { key: 'title', label: 'כותרת' },
    { key: 'subtitle', label: 'תת-כותרת' },
    { key: 'name_label', label: 'תווית שדה שם' },
    { key: 'email_label', label: 'תווית שדה אימייל' },
    { key: 'message_label', label: 'תווית שדה הודעה' },
    { key: 'submit_label', label: 'טקסט כפתור שליחה' },
    { key: 'success_message', label: 'הודעת הצלחה' },
  ]

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  return (
    <AdminTabLayout title="יצירת קשר" hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel}>
      <div className="flex gap-2 mb-6">
        {(['he', 'en'] as const).map(l => (
          <button key={l} onClick={() => setActiveLang(l)}
            className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-colors ${activeLang === l ? 'bg-[#5C3D2E] text-[#F5F0E8]' : 'border border-[#5C3D2E]/20 text-[#5C3D2E]/60 hover:border-[#5C3D2E]/50'}`}>
            {l === 'he' ? '🇮🇱 עברית' : '🇺🇸 English'}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-5 max-w-xl" dir={activeLang === 'he' ? 'rtl' : 'ltr'}>
        {fields.map(({ key, label }) => (
          <AdminField key={key} label={label}>
            <AdminInput value={c[key] as string} onChange={e => upd(key, e.target.value)} />
          </AdminField>
        ))}
      </div>
    </AdminTabLayout>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { Download, Upload, AlertTriangle } from 'lucide-react'

export default function AdminBackupPage() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [pendingData, setPendingData] = useState<Record<string, unknown[]> | null>(null)
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    setExporting(true)
    setMessage('')
    const supabase = createClient()

    const [pages, gallery, messages, contactInfo, socialLinks] = await Promise.all([
      supabase.from('pages').select('*'),
      supabase.from('gallery_items').select('*'),
      supabase.from('messages').select('*'),
      supabase.from('contact_info').select('*'),
      supabase.from('social_links').select('*'),
    ])

    const backup = {
      exported_at: new Date().toISOString(),
      pages: pages.data ?? [],
      gallery_items: gallery.data ?? [],
      messages: messages.data ?? [],
      contact_info: contactInfo.data ?? [],
      social_links: socialLinks.data ?? [],
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emily-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    setMessage('הגיבוי הורד בהצלחה')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!data.pages || !data.gallery_items) {
          setMessage('קובץ גיבוי לא תקין')
          return
        }
        setPendingData(data)
        setConfirmRestore(true)
      } catch {
        setMessage('שגיאה בקריאת הקובץ')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleRestore = async () => {
    if (!pendingData) return
    setImporting(true)
    setConfirmRestore(false)
    setMessage('')

    const supabase = createClient()

    try {
      const tables = ['pages', 'gallery_items', 'contact_info', 'social_links'] as const
      for (const table of tables) {
        const rows = pendingData[table] as unknown[]
        if (rows?.length) {
          await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
          await supabase.from(table).insert(rows)
        }
      }
      setMessage('השחזור הושלם בהצלחה')
    } catch {
      setMessage('שגיאה בשחזור — הנתונים לא שונו')
    }

    setPendingData(null)
    setImporting(false)
  }

  return (
    <AdminTabLayout title="גיבוי ושחזור" hasChanges={false} onSave={async () => {}} onCancel={() => {}} hideSaveCancel>
      <div className="max-w-xl flex flex-col gap-8" dir="rtl">

        {/* Export */}
        <div className="border border-[#5C3D2E]/10 bg-white p-6">
          <h2 className="text-sm tracking-widest uppercase text-[#3D2519] mb-2">גיבוי</h2>
          <p className="text-xs text-[#5C3D2E]/60 mb-5 leading-relaxed">
            הורד קובץ JSON עם כל הנתונים: דפים, גלריה, הודעות, פרטי קשר ורשתות חברתיות.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-[#5C3D2E] text-[#F5F0E8] px-5 py-2.5 text-xs tracking-widest uppercase hover:bg-[#3D2519] transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {exporting ? 'מייצא...' : 'הורד גיבוי'}
          </button>
        </div>

        {/* Import */}
        <div className="border border-[#5C3D2E]/10 bg-white p-6">
          <h2 className="text-sm tracking-widest uppercase text-[#3D2519] mb-2">שחזור</h2>
          <p className="text-xs text-[#5C3D2E]/60 mb-2 leading-relaxed">
            בחר קובץ גיבוי JSON. <strong>פעולה זו תחליף את כל הנתונים הקיימים.</strong>
          </p>
          <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 mb-5">
            <AlertTriangle size={12} />
            מומלץ לבצע גיבוי לפני שחזור
          </div>
          <label className="flex items-center gap-2 border border-[#5C3D2E]/20 text-[#5C3D2E] px-5 py-2.5 text-xs tracking-widest uppercase cursor-pointer hover:border-[#5C3D2E]/50 transition-colors w-fit">
            <Upload size={14} />
            {importing ? 'משחזר...' : 'בחר קובץ גיבוי'}
            <input type="file" accept=".json" className="hidden" onChange={handleFileSelect} disabled={importing} />
          </label>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('שגיאה') ? 'text-red-600' : 'text-green-700'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Confirm restore dialog */}
      {confirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-sm w-full p-8 shadow-xl" dir="rtl">
            <h2 className="text-base text-[#3D2519] font-medium mb-3">אישור שחזור</h2>
            <p className="text-sm text-[#5C3D2E]/70 mb-6 leading-relaxed">
              כל הנתונים הקיימים (דפים, גלריה, פרטי קשר) יוחלפו. פעולה זו אינה ניתנת לביטול.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmRestore(false)} className="px-5 py-2 text-xs tracking-widest uppercase border border-[#5C3D2E]/20 text-[#5C3D2E]">
                ביטול
              </button>
              <button onClick={handleRestore} className="px-5 py-2 text-xs tracking-widest uppercase bg-red-600 text-white hover:bg-red-700 transition-colors">
                אני מאשר — שחזר
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminTabLayout>
  )
}

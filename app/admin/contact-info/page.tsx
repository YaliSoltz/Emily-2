'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { invalidateContact } from '@/lib/actions'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { AdminField, AdminInput } from '@/components/admin/AdminField'

interface ContactInfo { id?: string; phone: string; email: string; address: string }
const empty: ContactInfo = { phone: '', email: '', address: '' }

export default function AdminContactInfoPage() {
  const [info, setInfo] = useState<ContactInfo>(empty)
  const [saved, setSaved] = useState<ContactInfo>(empty)
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('contact_info').select('*').single()
      const c: ContactInfo = {
        id: data?.id,
        phone: data?.phone ?? '',
        email: data?.email ?? '',
        address: data?.address ?? '',
      }
      setInfo(c); setSaved(c); setLoading(false)
    }
    load()
  }, [])

  const update = (k: keyof ContactInfo, v: string) => {
    setInfo(p => ({ ...p, [k]: v })); setHasChanges(true)
  }

  const handleSave = async () => {
    const supabase = createClient()
    if (info.id) {
      await supabase.from('contact_info').update({ phone: info.phone, email: info.email, address: info.address }).eq('id', info.id)
    } else {
      await supabase.from('contact_info').insert({ phone: info.phone, email: info.email, address: info.address })
    }
    await invalidateContact()
    setSaved(info); setHasChanges(false)
  }

  const handleCancel = () => { setInfo(saved); setHasChanges(false) }

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  return (
    <AdminTabLayout title="פרטי קשר" hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel}>
      <p className="text-xs text-[#5C3D2E]/50 mb-6">פרטים אלה יוצגו בעמוד יצירת קשר ובפוטר.</p>
      <div className="flex flex-col gap-5 max-w-md" dir="rtl">
        <AdminField label="טלפון">
          <AdminInput type="tel" value={info.phone} onChange={e => update('phone', e.target.value)} placeholder="050-000-0000" />
        </AdminField>
        <AdminField label="אימייל">
          <AdminInput type="email" value={info.email} onChange={e => update('email', e.target.value)} placeholder="example@email.com" />
        </AdminField>
        <AdminField label="כתובת (אופציונלי)">
          <AdminInput value={info.address} onChange={e => update('address', e.target.value)} placeholder="תל אביב, ישראל" />
        </AdminField>
      </div>
    </AdminTabLayout>
  )
}

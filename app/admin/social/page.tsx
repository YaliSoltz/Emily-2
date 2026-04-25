'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { AdminField, AdminInput } from '@/components/admin/AdminField'

interface SocialLink { id: string; platform: string; url: string; order_index: number }

const platformLabels: Record<string, { label: string; placeholder: string; icon: string }> = {
  instagram: { label: 'Instagram', placeholder: 'https://instagram.com/username', icon: '📸' },
  whatsapp:  { label: 'WhatsApp',  placeholder: 'https://wa.me/972500000000',    icon: '💬' },
}

export default function AdminSocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [saved, setSaved] = useState<SocialLink[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('social_links').select('*').order('order_index')
      setLinks(data ?? []); setSaved(data ?? []); setLoading(false)
    }
    load()
  }, [])

  const update = (id: string, url: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, url } : l))
    setHasChanges(true)
  }

  const handleSave = async () => {
    const supabase = createClient()
    await Promise.all(links.map(l => supabase.from('social_links').update({ url: l.url }).eq('id', l.id)))
    setSaved(links); setHasChanges(false)
  }

  const handleCancel = () => { setLinks(saved); setHasChanges(false) }

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  return (
    <AdminTabLayout title="רשתות חברתיות" hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel}>
      <p className="text-xs text-[#5C3D2E]/50 mb-6">קישורים אלה יוצגו בפוטר ובעמוד יצירת קשר.</p>
      <div className="flex flex-col gap-5 max-w-md" dir="rtl">
        {links.map(link => {
          const meta = platformLabels[link.platform] ?? { label: link.platform, placeholder: 'https://', icon: '🔗' }
          return (
            <AdminField key={link.id} label={`${meta.icon} ${meta.label}`}>
              <AdminInput
                type="url"
                value={link.url}
                onChange={e => update(link.id, e.target.value)}
                placeholder={meta.placeholder}
                dir="ltr"
              />
            </AdminField>
          )
        })}
        {links.length === 0 && (
          <p className="text-sm text-[#5C3D2E]/40">אין קישורים חברתיים. הריצו את ה-SQL migration שוב.</p>
        )}
      </div>
    </AdminTabLayout>
  )
}

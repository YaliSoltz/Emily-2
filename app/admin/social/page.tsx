'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { AdminField, AdminInput } from '@/components/admin/AdminField'
import { PLATFORMS, SocialIcon } from '@/lib/social-platforms'
import { saveSocialLinks } from './actions'

export default function AdminSocialPage() {
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [savedUrls, setSavedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('social_links').select('platform, url')
      const map: Record<string, string> = {}
      for (const row of data ?? []) map[row.platform] = row.url
      setUrls(map)
      setSavedUrls(map)
      setLoading(false)
    }
    load()
  }, [])

  const hasChanges = PLATFORMS.some(p => (urls[p.key] ?? '') !== (savedUrls[p.key] ?? ''))

  const update = (platform: string, url: string) =>
    setUrls(prev => ({ ...prev, [platform]: url }))

  const handleSave = async () => {
    await saveSocialLinks(urls, savedUrls)
    setSavedUrls({ ...urls })
  }

  const handleCancel = () => setUrls(savedUrls)

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  return (
    <AdminTabLayout title="רשתות חברתיות" hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel}>
      <p className="text-xs text-[#5C3D2E]/50 mb-6">
        קישורים שתמלאו יוצגו בפוטר ובעמוד יצירת קשר. השאירו ריק כדי להסיר.
      </p>
      <div className="flex flex-col gap-5 max-w-md" dir="rtl">
        {PLATFORMS.map(({ key, label, placeholder }) => (
          <AdminField
            key={key}
            label={
              <span className="inline-flex items-center gap-2">
                <SocialIcon platform={key} size={14} />
                {label}
              </span>
            }
          >
            <AdminInput
              type="url"
              value={urls[key] ?? ''}
              onChange={e => update(key, e.target.value)}
              placeholder={placeholder}
              dir="ltr"
            />
          </AdminField>
        ))}
      </div>
    </AdminTabLayout>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { AdminField, AdminPasswordInput } from '@/components/admin/AdminField'
import { LogOut } from 'lucide-react'
import { Suspense } from 'react'

function SettingsForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceChange = searchParams.get('forceChange') === '1'

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (next !== confirm) { setError('הסיסמאות אינן תואמות'); return }
    if (next.length < 6) { setError('הסיסמה חייבת להכיל לפחות 6 תווים'); return }

    setSaving(true)
    const supabase = createClient()

    // Re-authenticate with current password first
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user?.email) { setError('שגיאה: לא מחובר'); setSaving(false); return }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: current,
    })
    if (signInErr) { setError('הסיסמה הנוכחית שגויה'); setSaving(false); return }

    const { error: updateErr } = await supabase.auth.updateUser({ password: next })
    if (updateErr) { setError('שגיאה בעדכון הסיסמה: ' + updateErr.message); setSaving(false); return }

    setSuccess('הסיסמה עודכנה בהצלחה. מתנתק...')
    setSaving(false)
    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push('/adminlogin')
    }, 1500)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/adminlogin')
  }

  return (
    <AdminTabLayout title="הגדרות" hasChanges={false} onSave={async () => {}} onCancel={() => {}} hideSaveCancel>
      <div className="max-w-md flex flex-col gap-8" dir="rtl">

        {forceChange && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            זוהי הכניסה הראשונה שלך. יש לשנות את הסיסמה לפני המשך השימוש.
          </div>
        )}

        {/* Password change */}
        <div className="border border-[#5C3D2E]/10 bg-white p-6">
          <h2 className="text-sm tracking-widest uppercase text-[#3D2519] mb-5">שינוי סיסמה</h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <AdminField label="סיסמה נוכחית">
              <AdminPasswordInput value={current} onChange={e => setCurrent(e.target.value)} required />
            </AdminField>
            <AdminField label="סיסמה חדשה">
              <AdminPasswordInput value={next} onChange={e => setNext(e.target.value)} required minLength={6} />
            </AdminField>
            <AdminField label="אימות סיסמה חדשה">
              <AdminPasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </AdminField>

            {error && <p className="text-xs text-red-600">{error}</p>}
            {success && <p className="text-xs text-green-700">{success}</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-1 bg-[#5C3D2E] text-[#F5F0E8] px-5 py-2.5 text-xs tracking-widest uppercase hover:bg-[#3D2519] transition-colors disabled:opacity-50 self-start"
            >
              {saving ? 'מעדכן...' : 'עדכן סיסמה'}
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="border border-[#5C3D2E]/10 bg-white p-6">
          <h2 className="text-sm tracking-widest uppercase text-[#3D2519] mb-3">התנתקות</h2>
          <p className="text-xs text-[#5C3D2E]/50 mb-4">התנתק ממערכת הניהול.</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-red-200 text-red-600 px-5 py-2.5 text-xs tracking-widest uppercase hover:bg-red-50 transition-colors"
          >
            <LogOut size={13} />
            התנתק
          </button>
        </div>
      </div>
    </AdminTabLayout>
  )
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>}>
      <SettingsForm />
    </Suspense>
  )
}

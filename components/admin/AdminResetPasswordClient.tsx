'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function AdminResetPasswordClient() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים.')
      return
    }
    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('שגיאה בעדכון הסיסמה. נסה לבקש קישור חדש.')
      return
    }

    await supabase.auth.signOut()
    router.push('/adminlogin')
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image src="/images/logo.svg" alt="Emily Tal" width={160} height={50} className="h-10 w-auto" />
        </div>

        <div className="border border-[#5C3D2E]/10 bg-white p-8">
          <h1 className="text-center text-sm tracking-[0.2em] uppercase text-[#5C3D2E]/60 mb-2">
            סיסמה חדשה
          </h1>
          <p className="text-center text-xs text-[#5C3D2E]/40 mb-8 leading-relaxed" dir="rtl">
            בחר סיסמה חדשה לחשבון הניהול
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" dir="rtl">
            <div>
              <label className="text-xs tracking-widest uppercase text-[#5C3D2E]/50 block mb-1.5">
                סיסמה חדשה
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="לפחות 8 תווים"
                className="w-full border-b border-[#5C3D2E]/20 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E] transition-colors bg-transparent"
              />
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-[#5C3D2E]/50 block mb-1.5">
                אימות סיסמה
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full border-b border-[#5C3D2E]/20 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E] transition-colors bg-transparent"
              />
            </div>

            {error && (
              <p role="alert" className="text-red-600 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#5C3D2E] text-[#F5F0E8] py-3 text-xs tracking-[0.2em] uppercase hover:bg-[#3D2519] transition-colors disabled:opacity-50"
            >
              {loading ? 'שומר...' : 'שמור סיסמה חדשה'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#5C3D2E]/30 mt-6 tracking-wider">
          ממשק ניהול — Emily Tal Portfolio
        </p>
      </div>
    </div>
  )
}

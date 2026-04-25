'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function AdminLoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('פרטי הכניסה שגויים. נסה שנית.')
      setLoading(false)
      return
    }

    // Force password change on first login
    const createdAt = new Date(data.user.created_at).getTime()
    const lastSignIn = data.user.last_sign_in_at
      ? new Date(data.user.last_sign_in_at).getTime()
      : 0
    const isFirstLogin = Math.abs(lastSignIn - createdAt) < 5000

    if (isFirstLogin) {
      router.push('/admin/settings?forceChange=1')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image src="/images/logo.svg" alt="Emily Tal" width={160} height={50} className="h-10 w-auto" />
        </div>

        <div className="border border-[#5C3D2E]/10 bg-white p-8">
          <h1 className="text-center text-sm tracking-[0.2em] uppercase text-[#5C3D2E]/60 mb-8">
            כניסה למערכת
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" dir="rtl">
            <div>
              <label className="text-xs tracking-widest uppercase text-[#5C3D2E]/50 block mb-1.5">
                אימייל
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-b border-[#5C3D2E]/20 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E] transition-colors bg-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-[#5C3D2E]/50 block mb-1.5">
                סיסמה
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-b border-[#5C3D2E]/20 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E] transition-colors bg-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#5C3D2E] text-[#F5F0E8] py-3 text-xs tracking-[0.2em] uppercase hover:bg-[#3D2519] transition-colors disabled:opacity-50"
            >
              {loading ? 'מתחבר...' : 'כניסה'}
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type View = 'login' | 'reset' | 'reset-sent'

export default function AdminLoginClient() {
  const router = useRouter()
  const [view, setView] = useState<View>('login')

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Reset state
  const [resetEmail, setResetEmail] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setLoginError('פרטי הכניסה שגויים. נסה שנית.')
      setLoginLoading(false)
      return
    }

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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/admin/settings`
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo })

    setResetLoading(false)
    if (error) {
      setResetError('שגיאה בשליחת המייל. בדוק את הכתובת ונסה שנית.')
    } else {
      setView('reset-sent')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image src="/images/logo.svg" alt="Emily Tal" width={160} height={50} className="h-10 w-auto" />
        </div>

        <div className="border border-[#5C3D2E]/10 bg-white p-8">

          {/* ── Login ── */}
          {view === 'login' && (
            <>
              <h1 className="text-center text-sm tracking-[0.2em] uppercase text-[#5C3D2E]/60 mb-8">
                כניסה למערכת
              </h1>
              <form onSubmit={handleLogin} className="flex flex-col gap-5" dir="rtl">
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
                {loginError && (
                  <p role="alert" className="text-red-600 text-xs text-center">{loginError}</p>
                )}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="mt-2 bg-[#5C3D2E] text-[#F5F0E8] py-3 text-xs tracking-[0.2em] uppercase hover:bg-[#3D2519] transition-colors disabled:opacity-50"
                >
                  {loginLoading ? 'מתחבר...' : 'כניסה'}
                </button>
              </form>
              <div className="mt-5 text-center" dir="rtl">
                <button
                  onClick={() => { setResetEmail(email); setResetError(''); setView('reset') }}
                  className="text-xs text-[#5C3D2E]/45 hover:text-[#5C3D2E] transition-colors tracking-wide"
                >
                  שכחתי סיסמה
                </button>
              </div>
            </>
          )}

          {/* ── Reset request ── */}
          {view === 'reset' && (
            <>
              <h1 className="text-center text-sm tracking-[0.2em] uppercase text-[#5C3D2E]/60 mb-2">
                איפוס סיסמה
              </h1>
              <p className="text-center text-xs text-[#5C3D2E]/45 mb-8 leading-relaxed" dir="rtl">
                הכנס את כתובת האימייל שלך ונשלח קישור לאיפוס הסיסמה
              </p>
              <form onSubmit={handleReset} className="flex flex-col gap-5" dir="rtl">
                <div>
                  <label className="text-xs tracking-widest uppercase text-[#5C3D2E]/50 block mb-1.5">
                    אימייל
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="w-full border-b border-[#5C3D2E]/20 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E] transition-colors bg-transparent"
                    placeholder="admin@example.com"
                  />
                </div>
                {resetError && (
                  <p role="alert" className="text-red-600 text-xs text-center">{resetError}</p>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="mt-2 bg-[#5C3D2E] text-[#F5F0E8] py-3 text-xs tracking-[0.2em] uppercase hover:bg-[#3D2519] transition-colors disabled:opacity-50"
                >
                  {resetLoading ? 'שולח...' : 'שלח קישור לאיפוס'}
                </button>
              </form>
              <div className="mt-5 text-center">
                <button
                  onClick={() => setView('login')}
                  className="text-xs text-[#5C3D2E]/45 hover:text-[#5C3D2E] transition-colors tracking-wide"
                >
                  חזרה להתחברות
                </button>
              </div>
            </>
          )}

          {/* ── Reset sent ── */}
          {view === 'reset-sent' && (
            <div className="text-center py-4" dir="rtl">
              <div className="w-12 h-12 border border-[#5C3D2E]/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-[#5C3D2E] text-lg">✓</span>
              </div>
              <p className="text-sm text-[#3D2519] tracking-wide mb-2">הקישור נשלח!</p>
              <p className="text-xs text-[#5C3D2E]/50 leading-relaxed">
                בדוק את תיבת הדואר של <span className="text-[#5C3D2E]/70">{resetEmail}</span> ולחץ על הקישור לאיפוס הסיסמה.
              </p>
              <button
                onClick={() => setView('login')}
                className="mt-8 text-xs text-[#5C3D2E]/45 hover:text-[#5C3D2E] transition-colors tracking-wide"
              >
                חזרה להתחברות
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-xs text-[#5C3D2E]/30 mt-6 tracking-wider">
          ממשק ניהול — Emily Tal Portfolio
        </p>
      </div>
    </div>
  )
}

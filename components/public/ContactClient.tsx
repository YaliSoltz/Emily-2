'use client'

import { useState } from 'react'
import { useLang } from './LangProvider'
import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface ContactClientProps {
  heContent: Record<string, string>
  enContent: Record<string, string>
  contactInfo: { phone: string | null; email: string | null } | null
  socialLinks: { platform: string; url: string }[]
}

export default function ContactClient({ heContent, enContent, contactInfo, socialLinks }: ContactClientProps) {
  const { lang } = useLang()
  const c = lang === 'he' ? heContent : enContent

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const instagram = socialLinks.find(s => s.platform === 'instagram')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="pt-24 pb-10 px-6 text-center border-b border-[#5C3D2E]/10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#5C3D2E]/50 mb-3">
          {lang === 'he' ? 'יצירת קשר' : 'Contact'}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#3D2519]">
          {c.title ?? (lang === 'he' ? 'יצירת קשר' : 'Contact')}
        </h1>
        <p className="text-[#5C3D2E]/60 text-sm mt-3 tracking-wide">
          {c.subtitle ?? (lang === 'he' ? 'מעוניינים בשיתוף פעולה? שלחו הודעה.' : 'Interested in collaborating? Send a message.')}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16">
        {/* Form */}
        <div>
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border border-[#5C3D2E]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#5C3D2E] text-lg">✓</span>
              </div>
              <p className="text-[#5C3D2E] tracking-wide">
                {c.success_message ?? (lang === 'he' ? 'ההודעה נשלחה בהצלחה!' : 'Message sent successfully!')}
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 text-xs tracking-widest uppercase text-[#5C3D2E]/50 hover:text-[#5C3D2E] border-b border-[#5C3D2E]/30 pb-0.5"
              >
                {lang === 'he' ? 'שלח הודעה נוספת' : 'Send another'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-[#5C3D2E]/60 block mb-1.5">
                  {c.name_label ?? (lang === 'he' ? 'שם' : 'Name')}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-transparent border-b border-[#5C3D2E]/30 py-2 text-[#3D2519] focus:outline-none focus:border-[#5C3D2E] transition-colors placeholder:text-[#5C3D2E]/30 text-sm"
                />
              </div>
              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-[#5C3D2E]/60 block mb-1.5">
                  {c.email_label ?? (lang === 'he' ? 'אימייל' : 'Email')}
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-transparent border-b border-[#5C3D2E]/30 py-2 text-[#3D2519] focus:outline-none focus:border-[#5C3D2E] transition-colors placeholder:text-[#5C3D2E]/30 text-sm"
                />
              </div>
              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-[#5C3D2E]/60 block mb-1.5">
                  {c.message_label ?? (lang === 'he' ? 'הודעה' : 'Message')}
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full bg-transparent border-b border-[#5C3D2E]/30 py-2 text-[#3D2519] focus:outline-none focus:border-[#5C3D2E] transition-colors placeholder:text-[#5C3D2E]/30 text-sm resize-none"
                />
              </div>
              {status === 'error' && (
                <p role="alert" className="text-red-600 text-xs">{errorMsg}</p>
              )}
              <p className="text-[10px] text-[#5C3D2E]/40 leading-relaxed">
                {lang === 'he'
                  ? <>פרטיך ישמשו אך ורק למענה לפנייתך ויישמרו עד 24 חודשים. <Link href="/privacy" className="underline hover:text-[#5C3D2E]/70 transition-colors">מדיניות פרטיות</Link></>
                  : <>Your details will be used solely to respond to your inquiry and retained for up to 24 months. <Link href="/privacy" className="underline hover:text-[#5C3D2E]/70 transition-colors">Privacy Policy</Link></>
                }
              </p>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-2 bg-[#5C3D2E] text-[#F5F0E8] py-3.5 px-8 text-xs tracking-[0.2em] uppercase hover:bg-[#3D2519] transition-colors disabled:opacity-50 self-start min-w-[120px]"
              >
                {status === 'loading'
                  ? (lang === 'he' ? 'שולח...' : 'Sending...')
                  : (c.submit_label ?? (lang === 'he' ? 'שליחה' : 'Send'))}
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div className="flex flex-col gap-6 pt-2">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#3D2519]">
            {lang === 'he' ? 'פרטי התקשרות' : 'Contact details'}
          </h2>
          {contactInfo?.email && (
            <a href={`mailto:${contactInfo.email}`} className="inline-flex items-center gap-3 text-sm text-[#5C3D2E]/70 hover:text-[#5C3D2E] transition-colors">
              <Mail size={15} />
              {contactInfo.email}
            </a>
          )}
          {contactInfo?.phone && (
            <a href={`tel:${contactInfo.phone}`} className="inline-flex items-center gap-3 text-sm text-[#5C3D2E]/70 hover:text-[#5C3D2E] transition-colors">
              <Phone size={15} />
              {contactInfo.phone}
            </a>
          )}
          {instagram && (
            <a
              href={instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm text-[#5C3D2E]/70 hover:text-[#5C3D2E] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @emily_kryzewski
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

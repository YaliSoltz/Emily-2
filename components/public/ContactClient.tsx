'use client'

import { useState } from 'react'
import { useLang } from './LangProvider'
import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { SocialIcon, platformLabel } from '@/lib/social-platforms'
import { isValidIsraeliPhone } from '@/lib/phone-validation'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELD_ERRORS = {
  required:      { he: 'שדה חובה',                                                                         en: 'This field is required' },
  invalidEmail:  { he: 'כתובת האימייל אינה תקינה',                                                        en: 'Please enter a valid email address' },
  invalidPhone:  { he: 'מספר טלפון ישראלי אינו תקין. לדוגמה: 050-1234567 או 03-1234567.',                en: 'Please enter a valid Israeli phone number, e.g. 050-1234567 or 03-1234567.' },
}

const API_ERRORS: Record<string, { he: string; en: string }> = {
  'Invalid phone number':  FIELD_ERRORS.invalidPhone,
  'Invalid email':        FIELD_ERRORS.invalidEmail,
  'Too many requests': {
    he: 'יותר מדי ניסיונות שליחה. אנא המתינו דקה ונסו שנית.',
    en: 'Too many attempts. Please wait a minute and try again.',
  },
}

function apiErrorMessage(key: string, lang: 'he' | 'en'): string {
  return API_ERRORS[key]?.[lang] ?? (lang === 'he'
    ? 'אירעה שגיאה בשליחת ההודעה. אנא נסו שנית.'
    : 'An error occurred while sending your message. Please try again.')
}

interface ContactClientProps {
  heContent: Record<string, string>
  enContent: Record<string, string>
  contactInfo: { phone: string | null; email: string | null } | null
  socialLinks: { platform: string; url: string }[]
}

export default function ContactClient({ heContent, enContent, contactInfo, socialLinks }: ContactClientProps) {
  const { lang } = useLang()
  const c = lang === 'he' ? heContent : enContent

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorKey, setErrorKey] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({})

  const validateField = (field: keyof typeof form, value: string): string => {
    switch (field) {
      case 'name':
        return value.trim() ? '' : FIELD_ERRORS.required[lang]
      case 'email':
        if (!value.trim()) return FIELD_ERRORS.required[lang]
        if (!EMAIL_REGEX.test(value)) return FIELD_ERRORS.invalidEmail[lang]
        return ''
      case 'phone':
        if (value.trim() && !isValidIsraeliPhone(value)) return FIELD_ERRORS.invalidPhone[lang]
        return ''
      case 'message':
        return value.trim() ? '' : FIELD_ERRORS.required[lang]
    }
  }

  const validateAll = (): Partial<Record<keyof typeof form, string>> => {
    const errors: Partial<Record<keyof typeof form, string>> = {}
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      const err = validateField(key, form[key])
      if (err) errors[key] = err
    }
    return errors
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => { const next = { ...prev }; delete next[field]; return next })
    }
  }

  const handleBlur = (field: keyof typeof form) => {
    const err = validateField(field, form[field])
    setFieldErrors(prev => err ? { ...prev, [field]: err } : (({ [field]: _, ...rest }) => rest)(prev))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateAll()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setStatus('loading')
    setErrorKey('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorKey(data.error ?? '')
        setStatus('error')
        return
      }
      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
      setFieldErrors({})
    } catch {
      setStatus('error')
    }
  }

  const inputClass = (field: keyof typeof form) =>
    `w-full bg-transparent border-b py-2 text-[#3D2519] focus:outline-none transition-colors placeholder:text-[#5C3D2E]/30 text-sm ${
      fieldErrors[field] ? 'border-red-500' : 'border-[#5C3D2E]/30 focus:border-[#5C3D2E]'
    }`

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
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <p className="text-[10px] text-[#5C3D2E]/40 tracking-wide">
                <span aria-hidden="true" className="text-[#B03A2E]">* </span>
                {lang === 'he' ? 'שדות חובה' : 'Required fields'}
              </p>

              {/* Name */}
              <div>
                <label htmlFor="contact-name" className="text-xs tracking-[0.2em] uppercase text-[#5C3D2E]/60 block mb-1.5">
                  {c.name_label ?? (lang === 'he' ? 'שם' : 'Name')}
                  <span aria-hidden="true" className="text-[#B03A2E] ms-1">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  aria-required="true"
                  aria-describedby={fieldErrors.name ? 'err-name' : undefined}
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={inputClass('name')}
                />
                {fieldErrors.name && (
                  <p id="err-name" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="contact-email" className="text-xs tracking-[0.2em] uppercase text-[#5C3D2E]/60 block mb-1.5">
                  {c.email_label ?? (lang === 'he' ? 'אימייל' : 'Email')}
                  <span aria-hidden="true" className="text-[#B03A2E] ms-1">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  aria-required="true"
                  aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={inputClass('email')}
                />
                {fieldErrors.email && (
                  <p id="err-email" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="contact-phone" className="text-xs tracking-[0.2em] uppercase text-[#5C3D2E]/60 block mb-1.5">
                  {lang === 'he' ? 'טלפון' : 'Phone'}
                  <span className="text-[#5C3D2E]/35 ms-2 normal-case tracking-normal">
                    {lang === 'he' ? '(אופציונלי)' : '(optional)'}
                  </span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={inputClass('phone')}
                />
                {fieldErrors.phone && (
                  <p id="err-phone" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="text-xs tracking-[0.2em] uppercase text-[#5C3D2E]/60 block mb-1.5">
                  {c.message_label ?? (lang === 'he' ? 'הודעה' : 'Message')}
                  <span aria-hidden="true" className="text-[#B03A2E] ms-1">*</span>
                </label>
                <textarea
                  id="contact-message"
                  aria-required="true"
                  aria-describedby={fieldErrors.message ? 'err-message' : undefined}
                  rows={5}
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  className={inputClass('message')}
                />
                {fieldErrors.message && (
                  <p id="err-message" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>
                )}
              </div>

              {/* API-level error */}
              {status === 'error' && (
                <p role="alert" className="text-red-600 text-xs">
                  {apiErrorMessage(errorKey, lang)}
                </p>
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
          {socialLinks.map(link => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm text-[#5C3D2E]/70 hover:text-[#5C3D2E] transition-colors"
            >
              <SocialIcon platform={link.platform} size={15} />
              {platformLabel(link.platform)}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

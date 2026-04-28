'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface AdminFieldProps {
  label: React.ReactNode
  children: React.ReactNode
  hint?: string
}

export function AdminField({ label, children, hint }: AdminFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs tracking-[0.15em] uppercase text-[#5C3D2E]/60">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#5C3D2E]/40">{hint}</p>}
    </div>
  )
}

type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement>
export function AdminInput(props: AdminInputProps) {
  return (
    <input
      {...props}
      className={`w-full bg-white border border-[#5C3D2E]/15 px-3 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40 transition-colors ${props.className ?? ''}`}
    />
  )
}

type AdminPasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>
export function AdminPasswordInput(props: AdminPasswordInputProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`w-full bg-white border border-[#5C3D2E]/15 ps-3 pe-9 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40 transition-colors ${props.className ?? ''}`}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute inset-y-0 end-0 px-2.5 flex items-center text-[#5C3D2E]/35 hover:text-[#5C3D2E] transition-colors"
        aria-label={show ? 'הסתר סיסמה' : 'הצג סיסמה'}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

type AdminTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>
export function AdminTextarea(props: AdminTextareaProps) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`w-full bg-white border border-[#5C3D2E]/15 px-3 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40 transition-colors resize-none ${props.className ?? ''}`}
    />
  )
}

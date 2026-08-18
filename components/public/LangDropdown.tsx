'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import IL from 'country-flag-icons/react/3x2/IL'
import US from 'country-flag-icons/react/3x2/US'
import type { Lang } from '@/lib/types'

const languages = [
  { code: 'he' as const, label: 'עברית', Flag: IL },
  { code: 'en' as const, label: 'English', Flag: US },
]

interface LangDropdownProps {
  lang: Lang
  onLangChange: (l: Lang) => void
  onClose?: () => void
  alignLeft?: boolean
}

export default function LangDropdown({ lang, onLangChange, onClose, alignLeft }: LangDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = languages.find(l => l.code === lang)!

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative w-fit">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={lang === 'he' ? 'בחירת שפה' : 'Select language'}
        className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-[#5C3D2E]/70 hover:text-[#5C3D2E] transition-colors border border-[#5C3D2E]/20 px-2.5 py-2 rounded"
      >
        <current.Flag className="w-4 h-auto rounded-[1px]" />
        <span>{current.code.toUpperCase()}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute top-full mt-1 ${alignLeft ? 'start-0' : 'end-0'} bg-[#FAF7F2] border border-[#5C3D2E]/10 shadow-md min-w-[120px] z-50`}>
          {languages.map(({ code, label, Flag }) => (
            <button
              key={code}
              onClick={() => {
                onLangChange(code)
                setOpen(false)
                onClose?.()
              }}
              aria-current={code === lang ? 'true' : undefined}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs tracking-wide hover:bg-[#5C3D2E]/5 transition-colors ${
                code === lang ? 'text-[#5C3D2E] font-medium' : 'text-[#5C3D2E]/70'
              }`}
            >
              <Flag className="w-5 h-auto rounded-[1px]" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

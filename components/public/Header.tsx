'use client'

import NavLink from './NavLink'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import IL from 'country-flag-icons/react/3x2/IL'
import US from 'country-flag-icons/react/3x2/US'

const navLinks = {
  he: [
    { href: '/', label: 'בית' },
    { href: '/about', label: 'אודות' },
    { href: '/gallery', label: 'גלריה' },
    { href: '/contact', label: 'יצירת קשר' },
  ],
  en: [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ],
}

const languages = [
  { code: 'he' as const, label: 'עברית', Flag: IL },
  { code: 'en' as const, label: 'English', Flag: US },
]

interface HeaderProps {
  lang: 'he' | 'en'
  onLangChange: (lang: 'he' | 'en') => void
}

function LangDropdown({ lang, onLangChange, onClose }: { lang: 'he' | 'en'; onLangChange: (l: 'he' | 'en') => void; onClose?: () => void }) {
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-[#5C3D2E]/60 hover:text-[#5C3D2E] transition-colors border border-[#5C3D2E]/20 px-2 py-1.5 rounded"
      >
        <current.Flag className="w-4 h-auto rounded-[1px]" />
        <span>{current.code.toUpperCase()}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 end-0 bg-[#FAF7F2] border border-[#5C3D2E]/10 shadow-md min-w-[120px] z-50">
          {languages.map(({ code, label, Flag }) => (
            <button
              key={code}
              onClick={() => {
                onLangChange(code)
                setOpen(false)
                onClose?.()
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs tracking-wide hover:bg-[#5C3D2E]/5 transition-colors ${
                code === lang ? 'text-[#5C3D2E] font-medium' : 'text-[#5C3D2E]/60'
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

export default function Header({ lang, onLangChange }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now()
    const stored = sessionStorage.getItem('_elc')
    const prev: number[] = stored ? JSON.parse(stored) : []
    const recent = [...prev.filter(t => now - t < 1200), now]
    sessionStorage.setItem('_elc', JSON.stringify(recent))
    if (recent.length >= 3) {
      e.preventDefault()
      sessionStorage.removeItem('_elc')
      router.push('/adminlogin')
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const links = navLinks[lang]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#FAF7F2]/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" onClick={handleLogoClick} aria-label="Emily Tal — דף הבית">
          <Image
            src="/images/logo.svg"
            alt="Emily Tal"
            width={160}
            height={50}
            priority
            className="h-10 w-auto"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <NavLink
              key={link.href}
              href={link.href}
              className={`text-sm tracking-widest uppercase transition-colors duration-200 ${
                pathname === link.href
                  ? 'text-[#5C3D2E] border-b border-[#5C3D2E] pb-0.5'
                  : 'text-[#5C3D2E]/60 hover:text-[#5C3D2E]'
              }`}
            >
              {link.label}
            </NavLink>
          ))}
          <LangDropdown lang={lang} onLangChange={onLangChange} />
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#5C3D2E]"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/30">
          <div
            ref={menuRef}
            className={`absolute top-0 ${lang === 'he' ? 'right-0' : 'left-0'} h-full w-64 bg-[#FAF7F2] shadow-xl flex flex-col`}
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-[#5C3D2E]/10">
              <span className="text-sm text-[#5C3D2E]/60 tracking-widest uppercase">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-[#5C3D2E] p-1">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-6">
              {links.map(link => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 text-sm tracking-widest uppercase border-b border-[#5C3D2E]/10 transition-colors ${
                    pathname === link.href ? 'text-[#5C3D2E]' : 'text-[#5C3D2E]/60 hover:text-[#5C3D2E]'
                  }`}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-4">
                <LangDropdown lang={lang} onLangChange={onLangChange} onClose={() => setMobileOpen(false)} />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

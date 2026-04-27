'use client'

import NavLink from './NavLink'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X } from 'lucide-react'

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

interface HeaderProps {
  lang: 'he' | 'en'
  onLangChange: (lang: 'he' | 'en') => void
}

export default function Header({ lang, onLangChange }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
        <NavLink href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
          <Image
            src="/images/logo.svg"
            alt="Emily Tal"
            width={160}
            height={50}
            priority
            className="h-10 w-auto"
          />
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <NavLink
              key={link.href}
              href={link.href}
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className={`text-sm tracking-widest uppercase transition-colors duration-200 ${
                pathname === link.href
                  ? 'text-[#5C3D2E] border-b border-[#5C3D2E] pb-0.5'
                  : 'text-[#5C3D2E]/60 hover:text-[#5C3D2E]'
              }`}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Language switcher */}
          <button
            onClick={() => onLangChange(lang === 'he' ? 'en' : 'he')}
            className="text-xs tracking-widest uppercase text-[#5C3D2E]/50 hover:text-[#5C3D2E] transition-colors border border-[#5C3D2E]/20 px-2 py-1 rounded"
          >
            {lang === 'he' ? '🇺🇸 EN' : '🇮🇱 HE'}
          </button>
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
                  onClick={() => {
                    setMobileOpen(false)
                    window.scrollTo({ top: 0, behavior: 'instant' })
                  }}
                  className={`py-3 text-sm tracking-widest uppercase border-b border-[#5C3D2E]/10 transition-colors ${
                    pathname === link.href ? 'text-[#5C3D2E]' : 'text-[#5C3D2E]/60 hover:text-[#5C3D2E]'
                  }`}
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  onLangChange(lang === 'he' ? 'en' : 'he')
                  setMobileOpen(false)
                }}
                className="mt-4 text-xs tracking-widest uppercase text-[#5C3D2E]/50 hover:text-[#5C3D2E] text-start"
              >
                {lang === 'he' ? '🇺🇸 Switch to English' : '🇮🇱 עבור לעברית'}
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

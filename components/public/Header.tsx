'use client'

import Image from 'next/image'
import Link from 'next/link'
import LangDropdown from './LangDropdown'
import SideMenu from './SideMenu'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu } from 'lucide-react'
import { useSiteData } from '@/lib/context/SiteDataContext'

export default function Header() {
  const { lang, setLang } = useSiteData()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const now = Date.now()
    const stored = sessionStorage.getItem('_elc')
    const prev: number[] = stored ? JSON.parse(stored) : []
    const recent = [...prev.filter(t => now - t < 1200), now]
    sessionStorage.setItem('_elc', JSON.stringify(recent))
    if (recent.length >= 3) {
      sessionStorage.removeItem('_elc')
      router.push('/adminlogin')
    } else if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push('/')
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-[#FAF7F2]/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={handleLogoClick} aria-label={lang === 'he' ? 'Emily Tal — דף הבית' : 'Emily Tal — home'}>
            <Image
              src="/images/logo.svg"
              alt="Emily Tal"
              width={160}
              height={50}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Language + menu trigger. All navigation lives in the side menu. */}
          <div className="flex items-center gap-3">
            <LangDropdown lang={lang} onLangChange={setLang} />
            <button
              ref={triggerRef}
              onClick={() => setMenuOpen(true)}
              aria-label={lang === 'he' ? 'פתיחת תפריט' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-haspopup="dialog"
              className="text-[#5C3D2E] min-w-[44px] min-h-[44px] flex items-center justify-center -me-2"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header> to avoid fixed-in-fixed clipping */}
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        triggerRef={triggerRef}
        lang={lang}
      />
    </>
  )
}

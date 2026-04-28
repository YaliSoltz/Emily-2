'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdminNav } from './AdminNavContext'
import {
  LayoutDashboard, Home, User, Image, Mail, Phone,
  Share2, HardDrive, Settings, LogOut, X, Menu, ExternalLink
} from 'lucide-react'

const tabs = [
  { href: '/admin/dashboard',    label: 'דשבורד',          icon: LayoutDashboard },
  { href: '/admin/home',         label: 'דף הבית',          icon: Home },
  { href: '/admin/about',        label: 'אודות',            icon: User },
  { href: '/admin/gallery',      label: 'גלריה',            icon: Image },
  { href: '/admin/contact',      label: 'יצירת קשר',        icon: Mail },
  { href: '/admin/messages',     label: 'הודעות',           icon: Mail },
  { href: '/admin/contact-info', label: 'פרטי קשר',        icon: Phone },
  { href: '/admin/social',       label: 'רשתות חברתיות',   icon: Share2 },
  { href: '/admin/backup',       label: 'גיבוי ושחזור',    icon: HardDrive },
  { href: '/admin/settings',     label: 'הגדרות',           icon: Settings },
]

interface NavContentProps {
  pathname: string
  onTabClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
  onLogout: () => void
}

function NavContent({ pathname, onTabClick, onLogout }: NavContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-[#5C3D2E]/10">
        <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#3D2519] tracking-widest">
          EMILY TAL
        </p>
        <p className="text-[10px] text-[#5C3D2E]/40 tracking-widest uppercase mt-0.5">ממשק ניהול</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={e => onTabClick(e, href)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-[#5C3D2E]/8 text-[#3D2519] font-medium border-l-2 border-[#5C3D2E]'
                  : 'text-[#5C3D2E]/60 hover:text-[#3D2519] hover:bg-[#5C3D2E]/5'
              }`}
            >
              <Icon size={15} className={active ? 'text-[#5C3D2E]' : 'text-[#5C3D2E]/40'} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[#5C3D2E]/10 p-4 flex flex-col gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-sm text-[#5C3D2E]/50 hover:text-[#5C3D2E] transition-colors"
        >
          <ExternalLink size={15} />
          צפייה באתר
        </a>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-sm text-[#5C3D2E]/50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={15} />
          התנתקות
        </button>
      </div>
    </div>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { requestNavigate } = useAdminNav()

  useEffect(() => {
    if (!mobileOpen) return
    // Lock both body and the admin's internal scroll container (<main>)
    const main = document.querySelector<HTMLElement>('main')
    const prevMainOverflow = main?.style.overflowY ?? ''
    document.body.style.overflow = 'hidden'
    if (main) main.style.overflowY = 'hidden'
    return () => {
      document.body.style.overflow = ''
      if (main) main.style.overflowY = prevMainOverflow
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/adminlogin')
  }

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) { e.preventDefault(); return }
    const canLeave = requestNavigate(href)
    if (!canLeave) { e.preventDefault(); return }
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMobileOpen(false)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-l border-[#5C3D2E]/10 fixed top-0 right-0 h-full z-30">
        <NavContent pathname={pathname} onTabClick={handleTabClick} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#5C3D2E]/10 h-12 flex items-center justify-between px-4">
        <p className="font-[family-name:var(--font-cormorant)] text-base text-[#3D2519] tracking-widest">
          EMILY TAL
        </p>
        <button onClick={() => setMobileOpen(true)} className="text-[#5C3D2E] p-1">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden touch-none">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl flex flex-col touch-auto">
            <div className="flex items-center justify-between px-4 h-12 border-b border-[#5C3D2E]/10">
              <p className="font-[family-name:var(--font-cormorant)] text-base text-[#3D2519] tracking-widest">
                EMILY TAL
              </p>
              <button onClick={() => setMobileOpen(false)} className="text-[#5C3D2E] p-1">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavContent pathname={pathname} onTabClick={handleTabClick} onLogout={handleLogout} />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

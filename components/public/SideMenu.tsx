'use client'

import NavLink from './NavLink'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { navItems, isHrefActive, isItemActive, type NavItem } from '@/lib/navigation'
import type { Lang } from '@/lib/types'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface SideMenuProps {
  open: boolean
  onClose: () => void
  /** Focus returns here on close. */
  triggerRef: React.RefObject<HTMLButtonElement | null>
  lang: Lang
}

function MenuLink({ item, lang, pathname, onNavigate, nested }: {
  item: NavItem
  lang: Lang
  pathname: string
  onNavigate: () => void
  nested?: boolean
}) {
  const active = isHrefActive(pathname, item.href!)
  return (
    <NavLink
      href={item.href!}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center min-h-[44px] py-2.5 text-sm tracking-widest uppercase transition-colors border-s-2 ${
        nested ? 'ps-4' : 'ps-3'
      } ${
        active
          ? 'border-[#5C3D2E] text-[#5C3D2E] font-medium'
          : 'border-transparent text-[#5C3D2E]/70 hover:text-[#5C3D2E] hover:border-[#5C3D2E]/25'
      }`}
    >
      {item.label[lang]}
    </NavLink>
  )
}

function MenuGroup({ item, lang, pathname, onNavigate }: {
  item: NavItem
  lang: Lang
  pathname: string
  onNavigate: () => void
}) {
  const containsActive = isItemActive(pathname, item)
  // Open by default when the current route is inside the group; an explicit
  // toggle overrides that for as long as the menu stays open.
  const [override, setOverride] = useState<boolean | null>(null)
  const expanded = override ?? containsActive

  return (
    <div>
      <button
        onClick={() => setOverride(!expanded)}
        aria-expanded={expanded}
        className={`w-full flex items-center justify-between min-h-[44px] py-2.5 ps-3 pe-1 text-sm tracking-widest uppercase border-s-2 transition-colors ${
          containsActive
            ? 'border-[#5C3D2E] text-[#5C3D2E] font-medium'
            : 'border-transparent text-[#5C3D2E]/70 hover:text-[#5C3D2E]'
        }`}
      >
        <span>{item.label[lang]}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="flex flex-col">
          {(item.children ?? []).map(child => (
            <MenuLink
              key={child.href}
              item={child}
              lang={lang}
              pathname={pathname}
              onNavigate={onNavigate}
              nested
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SideMenu({ open, onClose, triggerRef, lang }: SideMenuProps) {
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Close on navigation.
  useEffect(() => {
    if (open) onClose()
    // Intentionally keyed on pathname only — this fires on route change, not on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleClose = useCallback(() => {
    onClose()
    triggerRef.current?.focus()
  }, [onClose, triggerRef])

  // Escape, focus trap, scroll lock.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(el => el.offsetParent !== null)
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, handleClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 animate-overlay-in"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label={lang === 'he' ? 'תפריט ניווט' : 'Navigation menu'}
        className={`absolute top-0 ${lang === 'he' ? 'right-0 animate-drawer-in-rtl' : 'left-0 animate-drawer-in-ltr'} h-full w-72 max-w-[85vw] bg-[#FAF7F2] shadow-xl flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#5C3D2E]/10 shrink-0">
          <Image src="/images/logo.svg" alt="Emily Tal" width={120} height={38} className="h-8 w-auto" />
          <button
            ref={closeBtnRef}
            onClick={handleClose}
            className="text-[#5C3D2E] p-2.5 -me-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={lang === 'he' ? 'סגירת תפריט' : 'Close menu'}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-5 py-6">
          {navItems.map(item =>
            item.children
              ? <MenuGroup key={item.label.en} item={item} lang={lang} pathname={pathname} onNavigate={onClose} />
              : <MenuLink key={item.href} item={item} lang={lang} pathname={pathname} onNavigate={onClose} />
          )}
        </nav>
      </div>
    </div>
  )
}

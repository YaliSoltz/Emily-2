import type { Lang } from './types'

export interface NavItem {
  /** Omitted for group headings, which only exist to hold `children`. */
  href?: string
  label: Record<Lang, string>
  children?: NavItem[]
}

/**
 * Single source of truth for the public site menu.
 * Add a category by adding an entry here — the header and side menu both read it.
 */
export const navItems: NavItem[] = [
  {
    href: '/',
    label: { he: 'בית', en: 'Home' },
  },
  {
    label: { he: 'עבודות', en: 'Work' },
    children: [
      { href: '/gallery', label: { he: 'פרויקטים', en: 'Projects' } },
      { href: '/knits', label: { he: 'סריגים', en: 'Knits' } },
    ],
  },
  {
    href: '/about',
    label: { he: 'אודות', en: 'About' },
  },
  {
    href: '/contact',
    label: { he: 'יצירת קשר', en: 'Contact' },
  },
]

/** True when `href` is the current route or one of its ancestors (`/knits` ⊃ `/knits/x`). */
export function isHrefActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** True when the item itself, or any of its children, matches the current route. */
export function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.href && isHrefActive(pathname, item.href)) return true
  return (item.children ?? []).some(child => isItemActive(pathname, child))
}

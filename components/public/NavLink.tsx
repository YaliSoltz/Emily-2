'use client'

import Link from 'next/link'
import NProgress from 'nprogress'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

export default function NavLink({ href, onClick, children, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      scroll={false}
      onClick={(e) => {
        if (href !== pathname) NProgress.start()
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </Link>
  )
}

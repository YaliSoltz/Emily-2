'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

export default function NavigationProgress() {
  const pathname = usePathname()

  useEffect(() => {
    NProgress.done()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <style>{`
      #nprogress .bar {
        background: #5C3D2E;
        height: 2px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px #5C3D2E, 0 0 5px #5C3D2E;
      }
    `}</style>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-6 rtl:bottom-[4.5rem] start-6 z-40 w-11 h-11 bg-[#FAF7F2] text-[#5C3D2E] border border-[#5C3D2E]/25 rounded-full flex items-center justify-center shadow-md hover:bg-[#F0E8DF] transition-colors duration-200"
    >
      <ArrowUp size={18} />
    </button>
  )
}

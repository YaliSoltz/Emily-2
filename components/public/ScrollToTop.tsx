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
      className="fixed bottom-6 start-6 z-40 w-11 h-11 bg-[#5C3D2E] text-[#F5F0E8] rounded-full flex items-center justify-center shadow-md hover:bg-[#3D2519] transition-colors duration-200"
    >
      <ArrowUp size={18} />
    </button>
  )
}

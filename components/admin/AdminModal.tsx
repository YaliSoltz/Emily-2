'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface AdminModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  width?: string
}

export default function AdminModal({ title, onClose, children, footer, width = 'max-w-lg' }: AdminModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full ${width} max-h-[90vh] max-w-[90vw] flex flex-col shadow-xl`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#5C3D2E]/10 shrink-0">
          <h2 className="text-sm tracking-widest uppercase text-[#3D2519]">{title}</h2>
          <button onClick={onClose} className="text-[#5C3D2E]/40 hover:text-[#5C3D2E] transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[#5C3D2E]/10 px-6 py-4 shrink-0 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

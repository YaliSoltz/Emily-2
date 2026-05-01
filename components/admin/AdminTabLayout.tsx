'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminNav } from './AdminNavContext'
import UnsavedDialog from './UnsavedDialog'

interface AdminTabLayoutProps {
  title: string
  hasChanges: boolean
  onSave: () => Promise<void>
  onCancel: () => void
  children: React.ReactNode
  saveLabel?: string
  hideSaveCancel?: boolean
}

export default function AdminTabLayout({
  title,
  hasChanges,
  onSave,
  onCancel,
  children,
  saveLabel = 'שמירה',
  hideSaveCancel = false,
}: AdminTabLayoutProps) {
  const router = useRouter()
  const { registerNavigateAway } = useAdminNav()
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [dialogPendingHref, setDialogPendingHref] = useState<string | null>(null)
  const pendingHrefRef = useRef<string | null>(null)

  const handleNavigateAway = useCallback((href: string): boolean => {
    pendingHrefRef.current = href
    setDialogPendingHref(href)
    return false
  }, [])

  useEffect(() => {
    registerNavigateAway(hasChanges ? handleNavigateAway : null)
    return () => registerNavigateAway(null)
  }, [hasChanges, handleNavigateAway, registerNavigateAway])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      await onSave()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleDialogLeave = () => {
    const href = pendingHrefRef.current
    setDialogPendingHref(null)
    onCancel()
    if (href) router.push(href)
  }

  const handleDialogStay = () => {
    pendingHrefRef.current = null
    setDialogPendingHref(null)
  }

  return (
    <div className="fixed inset-0 top-12 md:top-0 md:right-56 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 z-20 bg-white border-b border-[#5C3D2E]/10 px-6 h-14 flex items-center justify-between">
        <h1 className="text-sm tracking-widest uppercase text-[#3D2519] font-medium">{title}</h1>

        {!hideSaveCancel && (
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-green-600 tracking-wide">✓ נשמר</span>
            )}
            <button
              onClick={onCancel}
              disabled={!hasChanges}
              className="px-4 py-1.5 text-xs tracking-widest uppercase text-[#5C3D2E] border border-[#5C3D2E]/20 hover:border-[#5C3D2E]/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="px-4 py-1.5 text-xs tracking-widest uppercase bg-[#5C3D2E] text-[#F5F0E8] hover:bg-[#3D2519] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {saving ? 'שומר...' : saveLabel}
            </button>
          </div>
        )}
      </header>

      {/* Tab content */}
      <main className="flex-1 min-h-0 p-6 overflow-y-auto overscroll-contain">
        {children}
      </main>

      {dialogPendingHref && (
        <UnsavedDialog onStay={handleDialogStay} onLeave={handleDialogLeave} />
      )}
    </div>
  )
}

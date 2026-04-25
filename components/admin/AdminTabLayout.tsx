'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
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
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [dialogPendingHref, setDialogPendingHref] = useState<string | null>(null)
  const pendingHrefRef = useRef<string | null>(null)

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

  const handleNavigateAway = useCallback((href: string): boolean => {
    if (!hasChanges) return true
    pendingHrefRef.current = href
    setDialogPendingHref(href)
    return false
  }, [hasChanges])

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
    <div className="flex min-h-screen" dir="rtl">
      <AdminSidebar hasChanges={hasChanges} onNavigateAway={handleNavigateAway} />

      {/* Main content — offset for sidebar */}
      <div className="flex-1 md:mr-56 flex flex-col">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#5C3D2E]/10 px-6 h-14 flex items-center justify-between md:mt-0 mt-12">
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
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {dialogPendingHref && (
        <UnsavedDialog onStay={handleDialogStay} onLeave={handleDialogLeave} />
      )}
    </div>
  )
}

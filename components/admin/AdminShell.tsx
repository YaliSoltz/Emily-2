'use client'

import InactivityGuard from './InactivityGuard'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-[family-name:var(--font-heebo)]" dir="rtl">
      <InactivityGuard />
      {children}
    </div>
  )
}

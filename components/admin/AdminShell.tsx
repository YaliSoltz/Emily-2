'use client'

import InactivityGuard from './InactivityGuard'
import AdminSidebar from './AdminSidebar'
import { AdminNavProvider } from './AdminNavContext'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminNavProvider>
      <div className="min-h-screen bg-[#FAF7F2] font-[family-name:var(--font-heebo)]" dir="rtl">
        <InactivityGuard />
        <AdminSidebar />
        {children}
      </div>
    </AdminNavProvider>
  )
}

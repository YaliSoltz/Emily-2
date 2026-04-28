import type { Metadata } from 'next'
import AdminResetPasswordClient from '@/components/admin/AdminResetPasswordClient'

export const metadata: Metadata = {
  title: 'איפוס סיסמה — Emily Tal',
  robots: { index: false },
}

export default function AdminResetPasswordPage() {
  return <AdminResetPasswordClient />
}

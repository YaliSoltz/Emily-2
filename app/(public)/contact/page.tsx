import type { Metadata } from 'next'
import ContactClient from '@/components/public/ContactClient'

export const metadata: Metadata = {
  title: 'יצירת קשר — Emily Tal',
  description: 'צרו קשר עם אמילי טל לשיתופי פעולה',
}

export default function ContactPage() {
  return <ContactClient />
}

import type { Metadata } from 'next'
import ContactClient from '@/components/public/ContactClient'
import { getPageContent, getContactData } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'יצירת קשר — Emily Tal',
  description: 'צרו קשר עם אמילי טל לשיתופי פעולה',
}

export const revalidate = 3600

export default async function ContactPage() {
  const [{ he, en }, { contactInfo, socialLinks }] = await Promise.all([
    getPageContent('contact'),
    getContactData(),
  ])

  return (
    <ContactClient
      heContent={he?.content_json ?? {}}
      enContent={en?.content_json ?? {}}
      contactInfo={contactInfo}
      socialLinks={socialLinks}
    />
  )
}

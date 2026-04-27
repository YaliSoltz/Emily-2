import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ContactClient from '@/components/public/ContactClient'

export const metadata: Metadata = {
  title: 'יצירת קשר — Emily Tal',
  description: 'צרו קשר עם אמילי טל לשיתופי פעולה',
}

export const revalidate = 3600

export default async function ContactPage() {
  const supabase = await createClient()

  const [{ data: heContent }, { data: enContent }, { data: contactInfo }, { data: socialLinks }] =
    await Promise.all([
      supabase.from('pages').select('content_json').eq('page_name', 'contact').eq('language', 'he').single(),
      supabase.from('pages').select('content_json').eq('page_name', 'contact').eq('language', 'en').single(),
      supabase.from('contact_info').select('phone, email').single(),
      supabase.from('social_links').select('platform, url').order('order_index'),
    ])

  return (
    <ContactClient
      heContent={heContent?.content_json ?? {}}
      enContent={enContent?.content_json ?? {}}
      contactInfo={contactInfo}
      socialLinks={socialLinks ?? []}
    />
  )
}

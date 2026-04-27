import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import AboutClient from '@/components/public/AboutClient'

export const metadata: Metadata = {
  title: 'אודות — Emily Tal',
  description: 'מעצבת טקסטיל — סריגה, עיצוב טקסטיל והדפסי רשת',
}

export const revalidate = 3600

export default async function AboutPage() {
  const supabase = await createClient()

  const [{ data: heContent }, { data: enContent }] = await Promise.all([
    supabase.from('pages').select('content_json, images_json').eq('page_name', 'about').eq('language', 'he').single(),
    supabase.from('pages').select('content_json, images_json').eq('page_name', 'about').eq('language', 'en').single(),
  ])

  return (
    <AboutClient
      heContent={heContent?.content_json ?? {}}
      enContent={enContent?.content_json ?? {}}
      heImages={heContent?.images_json ?? {}}
    />
  )
}

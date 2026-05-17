'use server'

import { createClient } from '@/lib/supabase/server'
import { invalidateContact } from '@/lib/actions'
import { PLATFORMS } from '@/lib/social-platforms'

export async function saveSocialLinks(
  urls: Record<string, string>,
  savedUrls: Record<string, string>
) {
  const supabase = await createClient()

  await Promise.all(
    PLATFORMS.map(async ({ key }, i) => {
      const url = (urls[key] ?? '').trim()
      const wasSet = Boolean(savedUrls[key])
      if (url && wasSet) {
        return supabase.from('social_links').update({ url, order_index: i }).eq('platform', key)
      } else if (url && !wasSet) {
        return supabase.from('social_links').insert({ platform: key, url, order_index: i })
      } else if (!url && wasSet) {
        return supabase.from('social_links').delete().eq('platform', key)
      }
    })
  )

  await invalidateContact()
}

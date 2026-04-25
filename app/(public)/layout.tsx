import { createClient } from '@/lib/supabase/server'
import PublicShell from '@/components/public/PublicShell'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const [{ data: contactInfo }, { data: socialLinks }] = await Promise.all([
    supabase.from('contact_info').select('phone, email').single(),
    supabase.from('social_links').select('platform, url').order('order_index'),
  ])

  return (
    <PublicShell contactInfo={contactInfo} socialLinks={socialLinks ?? []}>
      {children}
    </PublicShell>
  )
}

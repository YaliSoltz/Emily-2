import { createPublicClient } from '@/lib/supabase/public'
import PublicShell from '@/components/public/PublicShell'

export const revalidate = 3600

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = createPublicClient()

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

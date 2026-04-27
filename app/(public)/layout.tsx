import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import PublicShell from '@/components/public/PublicShell'

const getLayoutData = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const [{ data: contactInfo }, { data: socialLinks }] = await Promise.all([
      supabase.from('contact_info').select('phone, email').single(),
      supabase.from('social_links').select('platform, url').order('order_index'),
    ])
    return { contactInfo, socialLinks: socialLinks ?? [] }
  },
  ['public-layout'],
  { revalidate: 3600 }
)

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const initialLang = langCookie === 'en' ? 'en' : 'he'

  const { contactInfo, socialLinks } = await getLayoutData()

  return (
    <PublicShell contactInfo={contactInfo} socialLinks={socialLinks} initialLang={initialLang}>
      {children}
    </PublicShell>
  )
}

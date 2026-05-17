import { cookies } from 'next/headers'
import { getPublicSiteData } from '@/lib/queries'
import { SiteDataProvider } from '@/lib/context/SiteDataContext'
import PublicShell from '@/components/public/PublicShell'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const initialLang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'he'

  const data = await getPublicSiteData()

  return (
    <SiteDataProvider
      initialLang={initialLang}
      contactInfo={data.contactInfo}
      socialLinks={data.socialLinks}
      homeContent={data.homeContent}
      aboutContent={data.aboutContent}
      contactContent={data.contactContent}
      galleryItems={data.galleryItems}
      galleryPreview={data.galleryPreview}
    >
      <PublicShell>
        {children}
      </PublicShell>
    </SiteDataProvider>
  )
}

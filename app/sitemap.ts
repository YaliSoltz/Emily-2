import { MetadataRoute } from 'next'
import { getPublicSiteData } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://emilytal.vercel.app'
  const { knits } = await getPublicSiteData()

  return [
    { url: base,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/about`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/gallery`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/knits`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    ...knits.map(knit => ({
      url: `${base}/knits/${knit.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${base}/contact`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.6 },
  ]
}

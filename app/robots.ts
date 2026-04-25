import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/adminlogin'] },
    ],
    sitemap: 'https://emilytal.vercel.app/sitemap.xml',
  }
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicSiteData } from '@/lib/queries'
import KnitDetailClient from '@/components/public/KnitDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Reuses the same cached call the public layout makes, so this adds no extra round trip.
async function findKnit(slug: string) {
  const { knits } = await getPublicSiteData()
  return knits.find(k => k.slug === slug) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const knit = await findKnit(slug)
  // The root layout appends " — Emily Tal" via its title template.
  if (!knit) return { title: 'סריגים' }

  const title = knit.title_he?.trim() || knit.title_en?.trim() || knit.slug
  const description = knit.description_he?.trim() || knit.description_en?.trim() || 'סריג מתוך אוסף הסריגים של אמילי טל.'

  return {
    title,
    description,
    openGraph: {
      // openGraph.title is not run through the template, so it carries the suffix itself.
      title: `${title} — Emily Tal`,
      description,
      images: knit.cover_image ? [{ url: knit.cover_image }] : undefined,
    },
  }
}

export default async function KnitPage({ params }: PageProps) {
  const { slug } = await params
  const knit = await findKnit(slug)
  if (!knit) notFound()

  return <KnitDetailClient slug={slug} />
}

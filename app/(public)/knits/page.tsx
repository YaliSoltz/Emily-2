import type { Metadata } from 'next'
import KnitsClient from '@/components/public/KnitsClient'

export const metadata: Metadata = {
  // The root layout appends " — Emily Tal" via its title template.
  title: 'סריגים',
  description: 'אוסף הסריגים של אמילי טל — סריגה בעבודת יד, חקירת חומרים ומרקמים.',
}

export default function KnitsPage() {
  return <KnitsClient />
}

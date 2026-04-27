import type { Metadata } from 'next'
import TermsClient from '@/components/public/TermsClient'

export const metadata: Metadata = {
  title: 'תקנון ותנאי שימוש — Emily Tal',
  description: 'תנאי השימוש באתר של אמילי טל — זכויות יוצרים, קניין רוחני ומדיניות פרטיות.',
}

export default function TermsPage() {
  return <TermsClient />
}

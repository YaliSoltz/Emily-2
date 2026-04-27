import type { Metadata } from 'next'
import AccessibilityStatementClient from '@/components/public/AccessibilityStatementClient'

export const metadata: Metadata = {
  title: 'הצהרת נגישות — Emily Tal',
  description: 'הצהרת הנגישות של אתר אמילי טל — עמידה בתקן WCAG 2.2 ותקן ישראלי 5568 ברמה AA.',
}

export default function AccessibilityPage() {
  return <AccessibilityStatementClient />
}

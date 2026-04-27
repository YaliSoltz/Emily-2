import type { Metadata } from 'next'
import PrivacyClient from '@/components/public/PrivacyClient'

export const metadata: Metadata = {
  title: 'מדיניות פרטיות — Emily Tal',
  description: 'מדיניות הפרטיות של אתר אמילי טל — לפי חוק הגנת הפרטיות תשמ"א-1981 ותיקון 13.',
}

export default function PrivacyPage() {
  return <PrivacyClient />
}

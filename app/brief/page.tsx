import type { Metadata } from 'next'
import BriefFlow from './brief-flow'

export const metadata: Metadata = {
  title: 'Buy a brief',
  description:
    'Pay 0.01 KITE on Kite testnet and get a research brief with a verifiable on-chain receipt.',
  alternates: { canonical: '/brief' }
}

const SITE_URL = 'https://hiremind-orpin.vercel.app'

const breadcrumbs = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Buy a brief', item: `${SITE_URL}/brief` }
  ]
}

export default function BriefPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <BriefFlow />
    </>
  )
}

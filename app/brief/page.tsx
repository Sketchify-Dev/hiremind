import type { Metadata } from 'next'
import BriefFlow from './brief-flow'

export const metadata: Metadata = {
  title: 'Buy a brief',
  description:
    'Pay 0.01 KITE on Kite testnet and get a research brief with a verifiable on-chain receipt.',
  alternates: { canonical: '/brief' }
}

export default function BriefPage() {
  return <BriefFlow />
}

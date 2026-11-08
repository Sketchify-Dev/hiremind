import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'HireMind privacy note: no tracking, no accounts, payments verified on-chain.',
  alternates: { canonical: '/privacy' }
}

const SITE_URL = 'https://hiremind-orpin.vercel.app'

const breadcrumbs = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Privacy', item: `${SITE_URL}/privacy` }
  ]
}

export default function Privacy() {
  return (
    <div className="hm-body min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <header className="hm-nav">
        <nav className="hm-frame hm-nav-inner" aria-label="Primary">
          <Link href="/" className="flex items-center gap-2" aria-label="HireMind home">
            <img src="/hm-logo-horizontal.svg" alt="HireMind" width={172} height={56} className="hm-nav-logo" />
          </Link>
          <Link href="/brief" className="hm-btn" style={{ minHeight: '2.75rem', fontSize: '1rem' }}>
            Buy a brief
          </Link>
        </nav>
      </header>
      <main className="hm-frame" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: '44rem' }}>
        <h1 className="hm-section-head">Privacy, in plain words.</h1>
        <div className="hm-body-text" style={{ marginTop: '2rem', display: 'grid', gap: '1.25rem' }}>
          <p>
            HireMind keeps no accounts and runs no analytics. There is nothing
            to sign up for and nothing tracking you across the page.
          </p>
          <p>
            When you buy a brief, the app reads your payment on the public Kite
            testnet and stores your transaction hash in a local redemption
            ledger so each hash pays out exactly once. Transaction hashes and
            delivered briefs live on this server only.
          </p>
          <p>
            Payments happen in your own wallet, never on this site. Never paste
            a private key or seed phrase anywhere here. The app only ever asks
            for a topic and a public transaction hash.
          </p>
          <p>
            Questions: open an issue on the repo. Last updated November 2026.
          </p>
        </div>
      </main>
      <div className="hm-frame pb-8">
        <footer className="hm-footer">
          <span className="dim">HireMind, pay-per-brief on OpenServ.</span>
          <span className="mid">
            <Link href="/">Home</Link>
            <Link href="/brief">Buy a brief</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
            <Link href="/llms.txt">llms.txt</Link>
          </span>
          <span className="right dim">2026, settled on Kite testnet.</span>
        </footer>
      </div>
    </div>
  )
}

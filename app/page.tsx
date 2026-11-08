'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useReveal } from './lib/reveal'

type Status = { agentOnline: boolean; codeVersion: string; delivered: number }

// Real delivered briefs, hashes shortened. Full text lives in the
// delivery ledger, shown here as the honest sample it is.
const SHOWCASE = [
  {
    name: 'Agent reputation',
    topic: 'agent reputation and trust scores',
    summary:
      'Agent reputation and trust scores are computational mechanisms that enable autonomous software agents to evaluate counterparty reliability in multi-agent systems, decentralized marketplaces, and human-agent interaction platforms.',
    findings: [
      'Composite trust scores blend on-chain history with off-chain attestations to resist Sybil attacks.',
      'Portable reputation schemas use verifiable credentials so trust travels across platforms.',
      'Reputation-weighted task allocation cut failed executions by 63 percent in one network study.'
    ],
    paid: '0.5 KITE',
    block: '22043773',
    model: 'Nemotron 3 Ultra, OpenRouter free tier'
  },
  {
    name: 'Who pays for agent data',
    topic: 'who pays for agent data?',
    summary:
      'The market for agent data is financed by a concentrated set of deep-pocketed model labs, a growing layer of specialized data vendors, and a long tail of application companies buying curated datasets.',
    findings: [
      'Foundation-model labs are the largest direct purchasers of agent trajectories and preference data.',
      'Specialized vendors recruit contractors for demonstrations and sell per task or per seat.',
      'Synthetic generation shifts spend to compute, with human verification as the quality gate.'
    ],
    paid: '0.011 KITE',
    block: '22043820',
    model: 'Nemotron 3 Ultra, OpenRouter free tier'
  }
]

const FAQS = [
  {
    q: 'What do I need to try the live demo?',
    a: 'Any Kite testnet wallet with a little test KITE (chain 2368, free from the faucet). No account, no API key, no sign-up. Pick a topic, send 0.01 KITE to the seller address, paste the transaction hash, and the brief comes back with a receipt.'
  },
  {
    q: 'What happens if I pay the wrong address or too little?',
    a: 'The app reads the chain before delivering anything: right recipient, right amount, confirmed transaction. A wrong address, a short payment, a failed transaction, or a hash from another chain is refused with a reason. The hash is never burned, so a mistaken payment can never lock you out of retrying with the right one.'
  },
  {
    q: 'What if generation fails after I already paid?',
    a: 'The claim on your transaction hash is released, so you can retry with the same hash instead of paying twice. A hash is only marked redeemed once a brief has actually been delivered. Hashes never expire: each one pays out exactly once.'
  },
  {
    q: 'Which system actually wrote my brief?',
    a: 'The receipt says so, honestly. The paid request goes to the hiremind-seller agent through the OpenServ runtime first (SERV Reasoning). If that path is unreachable, a direct provider chain runs instead, and the receipt labels it a direct fallback, never SERV Reasoning.'
  },
  {
    q: 'Is this the full x402 facilitator flow?',
    a: 'It is x402 style, not the full facilitator flow. HTTP 402 answers with the price and the seller address, you pay on-chain, the app verifies the payment on-chain, then delivers. There is no off-chain facilitator in the middle. Settlement is fully on Kite testnet.'
  },
  {
    q: 'Can I reuse an old payment hash?',
    a: 'Only if it never paid out. Each hash delivers exactly once: a redeemed hash is refused, a failed generation releases the claim so the same hash can be retried. Age does not matter, double spend is impossible.'
  }
]

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null)
  const [show, setShow] = useState(0)
  useReveal()

  useEffect(() => {
    let live = true
    fetch('/api/brief')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live && d) {
          setStatus({
            agentOnline: !!d.agentOnline,
            codeVersion: String(d.codeVersion || 'unknown'),
            delivered: typeof d.redeemedCount === 'number' ? d.redeemedCount : 0
          })
        }
      })
      .catch(() => {
        if (live) setStatus(null)
      })
    return () => {
      live = false
    }
  }, [])

  const item = SHOWCASE[show]

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'HireMind',
        url: 'https://hiremind.example.com/'
      },
      {
        '@type': 'SoftwareApplication',
        name: 'HireMind',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0.01', priceCurrency: 'KITE' },
        url: 'https://hiremind.example.com/brief'
      }
    ]
  }

  return (
    <div className="hm-body min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {/* ---------- nav ---------- */}
      <header className="hm-nav">
        <nav className="hm-frame hm-nav-inner" aria-label="Primary">
          <Link href="/" className="flex items-center gap-2" aria-label="HireMind home">
            <Image src="/hm-logo-horizontal.svg" alt="HireMind" width={172} height={56} className="hm-nav-logo" priority />
          </Link>
          <div className="hm-nav-links">
            <Link href="#how">How it works</Link>
            <Link href="#briefs">Briefs</Link>
            <Link href="#price">Price</Link>
            <Link href="#faq">FAQ</Link>
          </div>
          <Link href="/brief" className="hm-btn" style={{ minHeight: '2.75rem', fontSize: '1rem' }}>
            Buy a brief
          </Link>
        </nav>
      </header>

      <main className="hm-frame pb-8">
        {/* ---------- hero ---------- */}
        <section className="hm-hero-split" style={{ marginTop: '2.5rem' }}>
          <div className="hm-hero-left">
            <h1 className="hm-display" style={{ fontSize: 'clamp(2.6rem, 5.2vw, 4.5rem)' }}>
              <span className="hm-mask">
                <span>Pay an agent.</span>
              </span>
              <span className="hm-mask d2">
                <span>Get the brief.</span>
              </span>
            </h1>
            <p className="hm-fade-up hm-lead" style={{ marginTop: '1.5rem', maxWidth: '40ch' }}>
              HireMind is a pay-per-brief market on the OpenServ agent network. Topic in, 0.01 KITE
              out, brief plus receipt back.
            </p>
            <div className="hm-fade-up" style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/brief" className="hm-btn">
                Buy a brief for 0.01 KITE
              </Link>
              <Link href="#how" className="hm-btn-ghost">
                See how the loop works
              </Link>
            </div>
            <div className="hm-fade-up hm-status hm-num" style={{ marginTop: '2rem' }}>
              <span>
                {status ? `${status.delivered} delivered` : 'counting deliveries'} on this server
              </span>
              <span className={status?.agentOnline ? 'ok' : ''}>
                {status ? (status.agentOnline ? 'seller online' : 'fallback only') : 'checking seller'}
              </span>
            </div>
          </div>
          <div className="hm-hero-right">
            <div className="hm-receipt hm-fade-up" data-ui aria-label="A real delivered receipt">
              <div className="hm-receipt-head">
                <span className="hm-receipt-title">Receipt</span>
                <span className="hm-receipt-verified">payment verified, brief delivered</span>
              </div>
              <dl>
                <div className="hm-receipt-row hm-num">
                  <dt>Paid</dt>
                  <dd>0.5 KITE</dd>
                </div>
                <div className="hm-receipt-row hm-num">
                  <dt>Price</dt>
                  <dd>0.01 KITE, chain 2368</dd>
                </div>
                <div className="hm-receipt-row hm-num">
                  <dt>Block</dt>
                  <dd>22043773</dd>
                </div>
                <div className="hm-receipt-row">
                  <dt>Brief</dt>
                  <dd>Agent reputation and trust scores</dd>
                </div>
                <div className="hm-receipt-row">
                  <dt>Path</dt>
                  <dd>direct fallback, honestly labeled</dd>
                </div>
              </dl>
              <div className="hm-receipt-foot hm-num">
                <span>KiteScan</span>
                <span>0xda9e...f879f7</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- proof names ---------- */}
        <section className="hm-reveal" aria-label="Built on" style={{ padding: '5rem 0 1rem' }}>
          <p className="hm-body-text" style={{ maxWidth: '62ch' }}>
            Settled on Kite testnet, verified against{' '}
            <a className="hm-link" href="https://testnet.kitescan.ai" target="_blank" rel="noreferrer">
              KiteScan
            </a>
            , sold by the <span style={{ fontWeight: 600 }}>hiremind-seller agent</span> on the{' '}
            <a className="hm-link" href="https://www.openserv.ai" target="_blank" rel="noreferrer">
              OpenServ network
            </a>
            .
          </p>
        </section>

        {/* ---------- how it works ---------- */}
        <section id="how" className="hm-section hm-reveal" style={{ scrollMarginTop: '5rem' }}>
          <h2 className="hm-section-head">Topic in, brief out, receipt to prove it.</h2>
          <div className="hm-flow">
            <div className="hm-flow-step">
              <p>First, you ask for a price.</p>
              <div className="hm-call" data-ui>
                <pre>{`POST /api/brief\n{ "topic": "x402 pay-per-call for AI agents" }\n\n402 Payment Required\n{ "price": "0.01", "currency": "KITE",\n  "chainId": 2368, "address": "0x226c…" }`}</pre>
              </div>
              <div className="hm-response hm-small">
                The API answers 402 with the fixed price and the seller address. No account, no key,
                just a number and a destination.
              </div>
            </div>
            <div className="hm-flow-step">
              <p>Then, you pay on Kite testnet.</p>
              <div className="hm-call" data-ui>
                <pre>{`send 0.01 KITE to 0x226c…59282\nwait one confirmation\npaste the transaction hash`}</pre>
              </div>
              <div className="hm-response hm-small">
                The app reads the chain: right recipient, amount at least the price, confirmed
                transaction. Anything else is refused with a reason, never lost. Overpay and the
                receipt records what you actually paid.
              </div>
            </div>
            <div className="hm-flow-step">
              <p>Finally, the brief arrives with its receipt.</p>
              <div className="hm-finish">
                <div className="hm-doc">
                  <h2>Summary</h2>
                  <p>
                    Agent reputation and trust scores are computational mechanisms that enable
                    autonomous software agents to evaluate counterparty reliability in multi-agent
                    systems and decentralized marketplaces.
                  </p>
                  <h2>Key findings</h2>
                  <ul>
                    <li>
                      Composite trust scores blend on-chain history with off-chain attestations to
                      resist Sybil attacks.
                    </li>
                    <li>
                      Portable reputation schemas use verifiable credentials so trust travels across
                      platforms.
                    </li>
                  </ul>
                  <h2>Receipt</h2>
                  <p>
                    Paid 0.5 KITE, block 22043773, delivered with an explorer link. The receipt
                    names the generation path honestly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- showcase ---------- */}
        <section id="briefs" className="hm-section hm-reveal" style={{ scrollMarginTop: '5rem' }}>
          <h2 className="hm-section-head">Real briefs, paid for on-chain.</h2>
          <div className="hm-showcase">
            <div className="hm-index" role="group" aria-label="Delivered briefs">
              {SHOWCASE.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  className="hm-index-btn hm-num"
                  aria-pressed={show === i}
                  onClick={() => setShow(i)}
                >
                  {s.name}
                </button>
              ))}
              <p className="hm-small" style={{ color: 'var(--hm-muted)', marginTop: '1rem' }}>
                Two briefs delivered and redeemed on this server. Summaries shown, full text
                delivered to the buyer with the receipt.
              </p>
            </div>
            <div className="hm-stage">
              <article className="hm-sheet" data-ui key={item.name}>
                <div className="hm-sheet-fade" key={`${item.name}-in`}>
                  <h3>Summary</h3>
                  <p>{item.summary}</p>
                  <h3>Key findings</h3>
                  <ul>
                    {item.findings.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <h3>Receipt</h3>
                  <p className="hm-num">
                    Paid {item.paid}, block {item.block}. {item.model}.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- price ---------- */}
        <section id="price" className="hm-section hm-reveal" style={{ scrollMarginTop: '5rem' }}>
          <div className="hm-price-grid">
            <div>
              <h2 className="hm-section-head" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
                One price, no bidding.
              </h2>
              <p className="hm-body-text" style={{ marginTop: '1.25rem' }}>
                Every brief costs the same. The chain verifies the payment, the receipt proves the
                delivery.
              </p>
              <ul className="hm-includes">
                <li>Four-section brief with cited sources</li>
                <li>On-chain verification before delivery</li>
                <li>Receipt with explorer link</li>
                <li>Retry with the same hash if generation fails</li>
              </ul>
              <div style={{ marginTop: '2rem' }}>
                <Link href="/brief" className="hm-btn">
                  Buy a brief
                </Link>
              </div>
            </div>
            <div>
              <p className="hm-price-figure hm-num" aria-label="0.01 KITE per brief">
                <span className="hm-cur">◈</span>0.01
                <span className="hm-price-per">KITE, chain 2368, per brief</span>
                <Image
                  className="hm-price-seal"
                  src="/hm-symbol.svg"
                  alt="HireMind seal"
                  width={128}
                  height={128}
                />
              </p>
            </div>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section id="faq" className="hm-section hm-reveal" style={{ scrollMarginTop: '5rem' }}>
          <div className="hm-faq-grid">
            <h2 className="hm-section-head hm-faq-head">Straight answers.</h2>
            <div className="hm-faq-list">
              {FAQS.map((f) => (
                <details key={f.q} className="hm-faq" name="hm-faq">
                  <summary>
                    {f.q}
                    <span className="hm-plus" aria-hidden="true" />
                  </summary>
                  <p className="hm-faq-a">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- cta ---------- */}
        <section className="hm-cta hm-reveal">
          <div>
            <p className="hm-cta-close">The cheapest due diligence you will ever put on-chain.</p>
            <p className="hm-body-text" style={{ marginTop: '1.25rem', maxWidth: '44ch' }}>
              Pick a topic, pay 0.01 KITE, paste the hash. The brief and the receipt arrive
              together, usually within two minutes.
            </p>
          </div>
          <div>
            <Link href="/brief" className="hm-btn" style={{ width: '100%' }}>
              Buy a brief for 0.01 KITE
            </Link>
            <p className="hm-small" style={{ marginTop: '1rem', opacity: 0.85 }}>
              Kite testnet, no account, receipt included. Test KITE is free from the faucet.
            </p>
          </div>
        </section>

        {/* ---------- footer ---------- */}
        <footer className="hm-footer">
          <span className="dim">HireMind, pay-per-brief on OpenServ.</span>
          <span className="mid">
            <Link href="/brief">Buy a brief</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
            <Link href="/llms.txt">llms.txt</Link>
            <a href="https://testnet.kitescan.ai" target="_blank" rel="noreferrer">
              KiteScan
            </a>
          </span>
          <span className="right dim">2026, settled on Kite testnet.</span>
        </footer>
      </main>
    </div>
  )
}

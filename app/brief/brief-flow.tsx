'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { renderBrief } from '../lib/markdown'
import { useReveal } from '../lib/reveal'

type Quote = {
  price: string
  currency: string
  chainId: number
  address: string
  explorer: string
}

type Receipt = Quote & {
  txHash: string
  txUrl: string
  capability: string
  model: string
  path?: string
  payment?: string
  generation?: string
  amountPaid: string
  blockNumber: string | null
  redeemedAt: string
}

type Phase = 'idle' | 'pay' | 'redeeming' | 'done'

type Status = { agentOnline: boolean; codeVersion: string; delivered: number }

const EXAMPLES = [
  'x402 pay-per-call for AI agents',
  'verifiable inference for agent swarms',
  'who pays for agent data?',
  'agent reputation and trust scores',
  'micropayments for API calls',
  'how do agent swarms settle up?'
]

export default function BriefFlow() {
  return (
    <Suspense
      fallback={
        <div className="hm-body min-h-screen">
          <main className="hm-frame" style={{ paddingTop: '4rem' }}>
            <h1 className="hm-section-head">Buy a brief. Keep the receipt.</h1>
            <p className="hm-lead" style={{ marginTop: '1.5rem', maxWidth: '40ch' }}>
              Loading the buy flow.
            </p>
          </main>
        </div>
      }
    >
      <BriefFlowInner />
    </Suspense>
  )
}

export function BriefFlowInner() {
  const searchParams = useSearchParams()
  // Topic prefill comes from the landing example chips (?topic=...).
  // Lazy initializer, not an effect, so no set-state-in-effect.
  const [topic, setTopic] = useState(() => searchParams.get('topic') ?? '')
  const [phase, setPhase] = useState<Phase>('idle')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [txHash, setTxHash] = useState('')
  const [brief, setBrief] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [error, setError] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [receiptCopied, setReceiptCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const [showMobileCta, setShowMobileCta] = useState(true)
  useReveal()

  useEffect(() => {
    let live = true
    let cancelled = false
    fetch('/api/brief')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live && !cancelled && d) {
          setStatus({
            agentOnline: !!d.agentOnline,
            codeVersion: String(d.codeVersion || 'unknown'),
            delivered: typeof d.redeemedCount === 'number' ? d.redeemedCount : 0
          })
        }
      })
      .catch(() => {
        if (live && !cancelled) setStatus(null)
      })
    return () => {
      live = false
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const footer = document.getElementById('site-footer')
    if (!footer) return
    const observer = new IntersectionObserver(([entry]) => setShowMobileCta(!entry.isIntersecting), {
      rootMargin: '0px 0px -8px 0px'
    })
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  async function getPrice(nextTopic: string) {
    const t = nextTopic.trim()
    setError('')
    setBrief('')
    setReceipt(null)
    if (!t) {
      setError('Enter a topic first.')
      return
    }
    setQuoteLoading(true)
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t })
      })
      const data = await res.json()
      if (res.status === 402 && data.code === 'PAYMENT_REQUIRED') {
        setQuote(data)
        setPhase('pay')
        document.getElementById('pay-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } else {
        setError(data.error || 'Unexpected response from the server. Check the app server is running.')
        setPhase('idle')
      }
    } catch (e) {
      setError(`Could not reach the app server: ${(e as Error).message}`)
      setPhase('idle')
    } finally {
      setQuoteLoading(false)
    }
  }

  async function redeem() {
    setError('')
    if (!txHash.trim()) {
      setError('Paste your payment transaction hash first.')
      return
    }
    setPhase('redeeming')
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, txHash: txHash.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Payment verification failed.')
        setPhase('pay')
        return
      }
      setBrief(data.brief)
      setReceipt(data.receipt)
      setPhase('done')
      fetch('/api/brief')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.redeemedCount === 'number') {
            setStatus((s) => (s ? { ...s, delivered: d.redeemedCount } : s))
          }
        })
        .catch(() => {
          // counter stays stale rather than guessing: the API is the only
          // source of truth for delivered briefs
        })
      setTimeout(() => document.getElementById('brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    } catch (e) {
      setError(`Could not reach the app server: ${(e as Error).message}`)
      setPhase('pay')
    }
  }

  function reset() {
    setTopic('')
    setTxHash('')
    setBrief('')
    setReceipt(null)
    setQuote(null)
    setError('')
    setPhase('idle')
    document.getElementById('buy')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function copyAddress() {
    if (!quote) return
    setCopyFailed(false)
    try {
      await navigator.clipboard.writeText(quote.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopyFailed(true)
    }
  }

  async function copyReceipt() {
    if (!receipt) return
    setCopyFailed(false)
    try {
      await navigator.clipboard.writeText(JSON.stringify(receipt, null, 2))
      setReceiptCopied(true)
      setTimeout(() => setReceiptCopied(false), 1600)
    } catch {
      setCopyFailed(true)
    }
  }

  function downloadBrief() {
    if (!brief) return
    const blob = new Blob([brief], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hiremind-brief-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const pathLabel =
    receipt?.path === 'openserv-webhook'
      ? 'SERV Reasoning (OpenServ runtime)'
      : receipt?.path === 'direct-fallback'
        ? 'direct fallback (not SERV Reasoning)'
        : receipt?.path || 'unknown'

  const shortHash = receipt ? `${receipt.txHash.slice(0, 6)}...${receipt.txHash.slice(-6)}` : ''

  const feed: Array<[string, boolean]> = quote
    ? [
        [`Price quoted: ${quote.price} ${quote.currency} on chain ${quote.chainId}`, true],
        ['Awaiting your on-chain transfer', phase === 'pay' || phase === 'redeeming' || phase === 'done'],
        ['Verifying payment on Kite testnet', phase === 'redeeming' || phase === 'done'],
        ['Seller agent writing the brief', phase === 'redeeming' || phase === 'done'],
        ['Brief delivered with receipt', phase === 'done']
      ]
    : []

  return (
    <div className="hm-body min-h-screen">
      {/* ---------- nav ---------- */}
      <header className="hm-nav">
        <nav className="hm-frame hm-nav-inner" aria-label="Primary">
          <Link href="/" className="flex items-center gap-2" aria-label="HireMind home">
            <Image src="/hm-logo-horizontal.svg" alt="HireMind" width={172} height={56} className="hm-nav-logo" priority />
          </Link>
          <div className="hm-nav-links">
            <Link href="/#how">How it works</Link>
            <Link href="/#briefs">Briefs</Link>
            <Link href="/#price">Price</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <span className="hm-small hm-num" style={{ color: 'var(--hm-muted)' }}>
            0.01 KITE per brief
          </span>
        </nav>
      </header>

      <main className="hm-frame pb-8">
        <p className="hm-crumb hm-reveal" style={{ marginTop: '2rem' }}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Buy a brief</span>
        </p>

        {/* ---------- buy ---------- */}
        <section className="hm-buy-grid">
          <div className="hm-reveal">
            <h1 className="hm-section-head">Buy a brief. Keep the receipt.</h1>
            <p className="hm-lead" style={{ marginTop: '1.5rem', maxWidth: '40ch' }}>
              Pick a topic, pay 0.01 KITE on Kite testnet, paste the transaction hash.
              The payment is verified on-chain and the brief arrives with a receipt
              that links back to the transaction.
            </p>
            <dl className="hm-stats hm-num">
              <div>
                <dt>0.01 KITE</dt>
                <dd>fixed price, no bidding</dd>
              </div>
              <div>
                <dt>chain 2368</dt>
                <dd>Kite testnet settlement</dd>
              </div>
              <div>
                <dt>every brief</dt>
                <dd>ships with a receipt</dd>
              </div>
              <div>
                <dt>{status ? `${status.delivered} delivered` : 'live count'}</dt>
                <dd>briefs redeemed on this server</dd>
              </div>
            </dl>
            <p className="hm-status hm-num" style={{ marginTop: '1.5rem' }}>
              <span>
                {status
                  ? status.agentOnline
                    ? 'seller online'
                    : 'fallback only'
                  : 'checking seller'}
              </span>
              {status && <span>build {status.codeVersion}</span>}
            </p>
          </div>

          {/* buy terminal, the product fragment at true size */}
          <div id="buy" className="scroll-mt-24 hm-reveal">
            <div className="hm-term" data-ui aria-label="Buy flow">
              <div className="hm-term-head">
                <div className="hm-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <p className="hm-num">
                  {status
                    ? status.agentOnline
                      ? 'seller webhook configured'
                      : 'seller webhook missing, fallback only'
                    : 'checking seller status'}
                </p>
              </div>

              <div className="hm-term-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    getPrice(topic)
                  }}
                >
                  <label className="hm-small" style={{ color: 'var(--hm-muted)' }} htmlFor="topic">
                    What should the brief cover?
                  </label>
                  <input
                    id="topic"
                    className="hm-field"
                    style={{ marginTop: '0.6rem' }}
                    placeholder="e.g. x402 pay-per-call for AI agents"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={phase === 'redeeming'}
                    autoComplete="off"
                  />
                </form>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setTopic(ex)
                        getPrice(ex)
                      }}
                      disabled={quoteLoading || phase === 'redeeming'}
                      className="hm-chip"
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                {(phase === 'idle' || (phase === 'pay' && !quote)) && (
                  <button
                    type="button"
                    onClick={() => getPrice(topic)}
                    disabled={quoteLoading}
                    className="hm-btn"
                    style={{ marginTop: '1.25rem' }}
                    aria-busy={quoteLoading}
                  >
                    {quoteLoading ? 'Checking the price' : 'Get the price'}
                  </button>
                )}

                {quote && phase !== 'done' && (
                  <div id="pay-panel" className="hm-pay">
                    <p style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                      Send {quote.price} {quote.currency} to the seller.
                    </p>
                    <p className="hm-small" style={{ marginTop: '0.5rem', color: 'var(--hm-muted)', lineHeight: 1.55 }}>
                      Any Kite testnet wallet works. The chain is checked before delivery, so a wrong address or a
                      short payment is refused, never lost. Need test funds?{' '}
                      <a
                        href="https://faucet.gokite.ai"
                        target="_blank"
                        rel="noreferrer"
                        className="hm-link"
                      >
                        Get KITE from the faucet
                      </a>.
                    </p>
                    <div className="hm-pay-addr">
                      <code className="hm-num">{quote.address}</code>
                      <button type="button" onClick={copyAddress} className="hm-chip" aria-live="polite">
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    {copyFailed && (
                      <p className="hm-small" style={{ marginTop: '0.5rem' }}>
                        Copy is blocked in this browser, so select the address manually.
                      </p>
                    )}
                    <form
                      style={{ marginTop: '1rem' }}
                      onSubmit={(e) => {
                        e.preventDefault()
                        redeem()
                      }}
                    >
                      <label className="hm-small" style={{ color: 'var(--hm-muted)' }} htmlFor="tx">
                        Paste the payment hash when it confirms
                      </label>
                      <input
                        id="tx"
                        className="hm-field hm-num"
                        style={{ marginTop: '0.6rem', fontSize: '0.95rem' }}
                        placeholder="0x…"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        disabled={phase === 'redeeming'}
                        spellCheck={false}
                        autoComplete="off"
                        inputMode="text"
                      />
                      <button type="submit" disabled={phase === 'redeeming'} className="hm-btn" style={{ marginTop: '1rem' }} aria-busy={phase === 'redeeming'}>
                        {phase === 'redeeming' ? 'Verifying payment, then writing' : 'I paid, deliver the brief'}
                      </button>
                    </form>
                    {phase === 'redeeming' && (
                      <p className="hm-small" style={{ marginTop: '0.75rem', color: 'var(--hm-muted)' }}>
                        Step one checks the chain and is instant. Step two is the seller agent writing, and that takes a minute or two.
                      </p>
                    )}
                  </div>
                )}

                {feed.length > 0 && phase !== 'done' && (
                  <ol className="hm-feed hm-num" aria-label="Order progress">
                    {feed.map(([line, on]) => (
                      <li key={line} className={on ? 'on' : ''}>
                        <span className="hm-dot" aria-hidden="true" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {error && (
                  <div role="alert" aria-live="assertive" className="hm-error">
                    {error}
                  </div>
                )}

                {phase === 'done' && (
                  <div className="hm-ok">
                    Paid and verified. Your brief and receipt are below.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- delivered brief + receipt ---------- */}
        {phase === 'done' && brief && receipt && (
          <section id="brief" className="scroll-mt-24" style={{ marginTop: '3rem' }}>
            <article className="hm-doc" data-ui aria-label="Delivered brief">
              {renderBrief(brief)}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={downloadBrief} className="hm-btn">
                  Download brief (.md)
                </button>
                <button type="button" onClick={copyReceipt} className="hm-btn-ghost" aria-live="polite">
                  {receiptCopied ? 'Receipt copied' : 'Copy receipt JSON'}
                </button>
              </div>
              {copyFailed && (
                <p className="hm-small" style={{ marginTop: '0.75rem' }}>
                  Copy is blocked in this browser, so select the receipt manually.
                </p>
              )}
            </article>
            <div className="hm-receipt hm-fade-up" data-ui aria-label="Payment receipt" style={{ marginTop: '1.5rem' }}>
              <div className="hm-receipt-head">
                <span className="hm-receipt-title">Receipt</span>
                <span className="hm-receipt-verified">payment verified, brief delivered</span>
              </div>
              <dl>
                <div className="hm-receipt-row hm-num">
                  <dt>Paid</dt>
                  <dd>{receipt.amountPaid} {receipt.currency}</dd>
                </div>
                <div className="hm-receipt-row hm-num">
                  <dt>Price</dt>
                  <dd>{receipt.price} {receipt.currency}, chain {receipt.chainId}</dd>
                </div>
                <div className="hm-receipt-row hm-num">
                  <dt>Block</dt>
                  <dd>{receipt.blockNumber ?? 'pending'}</dd>
                </div>
                <div className="hm-receipt-row">
                  <dt>Capability</dt>
                  <dd>{receipt.capability}</dd>
                </div>
                <div className="hm-receipt-row">
                  <dt>Model</dt>
                  <dd>{receipt.model}</dd>
                </div>
                <div className="hm-receipt-row">
                  <dt>Path</dt>
                  <dd>{pathLabel}</dd>
                </div>
                <div className="hm-receipt-row hm-num">
                  <dt>Redeemed</dt>
                  <dd>{new Date(receipt.redeemedAt).toLocaleString()}</dd>
                </div>
                <div className="hm-receipt-row hm-num">
                  <dt>Seller</dt>
                  <dd>{receipt.address}</dd>
                </div>
              </dl>
              <div className="hm-receipt-foot hm-num">
                <span>
                  <a className="hm-link" href={receipt.txUrl} target="_blank" rel="noreferrer">
                    KiteScan
                  </a>
                </span>
                <span>{shortHash}</span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button onClick={reset} className="hm-link" style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: '0.95rem' }}>
                  Buy another brief
                </button>
              </div>
            </div>
          </section>
        )}

        <footer id="site-footer" className="hm-footer">
          <span className="dim">HireMind, pay-per-brief on OpenServ.</span>
          <span className="mid">
            <Link href="/">Home</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
            <Link href="/llms.txt">llms.txt</Link>
            <a href="https://testnet.kitescan.ai" target="_blank" rel="noreferrer">
              KiteScan
            </a>
          </span>
          <span className="right dim">2026, settled on Kite testnet.</span>
        </footer>
      </main>

      {/* ---------- mobile sticky cta ---------- */}
      {showMobileCta && phase !== 'done' && (
        <a href="#buy" className="hm-btn hm-sticky-cta">
          Buy a brief for 0.01 KITE
        </a>
      )}
    </div>
  )
}

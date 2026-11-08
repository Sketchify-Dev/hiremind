'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { renderBrief } from '../lib/markdown'

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
    <Suspense>
      <BriefFlowInner />
    </Suspense>
  )
}

export function BriefFlowInner() {
  const searchParams = useSearchParams()
  const [topic, setTopic] = useState('')
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

  useEffect(() => {
    const preset = searchParams.get('topic')
    if (preset) setTopic(preset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <div className="min-h-screen">
      <div className="aurora" aria-hidden="true">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
      </div>

      {/* ---------- sticky nav ---------- */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070d]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 md:px-8" aria-label="Primary">
          <Link href="/" className="flex items-center gap-2.5" aria-label="HireMind home">
            <Image src="/logo.svg" alt="HireMind" width={220} height={72} className="h-9 w-auto" priority />
          </Link>
          <div className="hidden items-center gap-7 font-machine text-[0.82rem] text-[var(--muted)] md:flex">
            <Link className="transition-colors hover:text-white" href="/">Home</Link>
            <Link className="transition-colors hover:text-white" href="/#how">How it works</Link>
            <Link className="transition-colors hover:text-white" href="/#faq">FAQ</Link>
          </div>
          <p className="font-machine rounded-full border border-white/15 px-4 py-2 text-[0.8rem] text-white">
            0.01 KITE per brief
          </p>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-28 md:px-8">
        {/* ---------- heading + buy flow ---------- */}
        <section className="grid gap-10 pt-12 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div>
            <p className="rise font-machine inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3.5 py-1.5 text-[0.75rem] text-emerald-200">
              <span className="live-dot" aria-hidden="true" />
              SERV Hackathon 02, Open Track, live on Kite testnet
            </p>
            <h1 className="rise rise-1 font-display mt-6 text-[2.6rem] leading-[1.08] font-medium tracking-tight text-balance md:text-6xl">
              Buy a brief. <span className="grad-text">Keep the receipt.</span>
            </h1>
            <p className="rise rise-2 mt-5 max-w-xl text-[1.08rem] leading-relaxed text-[var(--muted)]">
              Pick a topic, pay 0.01 KITE on Kite testnet, paste the transaction hash.
              The payment is verified on-chain and the brief arrives with a receipt
              that links back to the transaction.
            </p>
            <dl className="rise rise-4 mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
              {[
                ['0.01 KITE', 'fixed price, no bidding'],
                ['chain 2368', 'Kite testnet settlement'],
                ['every brief', 'ships with a receipt'],
                [
                  status ? `${status.delivered} delivered` : 'live count',
                  'briefs redeemed on this server'
                ]
              ].map(([v, l]) => (
                <div key={l} className="bg-[#070b14]/95 px-4 py-4">
                  <dt className="font-machine text-[0.95rem] font-semibold text-white">{v}</dt>
                  <dd className="mt-1 text-[0.8rem] leading-snug text-[var(--muted)]">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* buy terminal */}
          <div id="buy" className="scroll-mt-24">
            <div className="glass-deep overflow-hidden rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 md:px-6">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <p className="font-machine text-[0.72rem] text-[var(--muted)]">
                  {status ? (
                    <>
                      <span className={status.agentOnline ? 'text-emerald-300' : 'text-amber-300'}>
                        {status.agentOnline ? '● seller webhook configured' : '● seller webhook missing, fallback only'}
                      </span>
                      <span className="ml-3 hidden sm:inline">build {status.codeVersion}</span>
                    </>
                  ) : (
                    '● checking seller status…'
                  )}
                </p>
              </div>

              <div className="px-5 py-5 md:px-6 md:py-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    getPrice(topic)
                  }}
                >
                  <label className="font-machine text-[0.78rem] text-[var(--muted)]" htmlFor="topic">
                    What should the brief cover?
                  </label>
                  <input
                    id="topic"
                    className="field mt-2.5"
                    placeholder="e.g. x402 pay-per-call for AI agents"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={phase === 'redeeming'}
                    autoComplete="off"
                  />
                </form>
                <div className="mt-3 flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setTopic(ex)
                        getPrice(ex)
                      }}
                      disabled={quoteLoading || phase === 'redeeming'}
                      className="chip"
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
                    className="btn-primary mt-5"
                    aria-busy={quoteLoading}
                  >
                    {quoteLoading ? <span className="busy">Checking the price…</span> : 'Get the price'}
                  </button>
                )}

                {quote && phase !== 'done' && (
                  <div id="pay-panel" className="mt-5 scroll-mt-28 rounded-2xl border border-amber-300/30 bg-amber-300/[0.06] p-5">
                    <p className="font-display text-[1.25rem] text-balance">
                      Send {quote.price} {quote.currency} to the seller.
                    </p>
                    <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[var(--muted)]">
                      Any Kite testnet wallet works. The chain is checked before delivery, so a wrong address or a
                      short payment is refused, never lost. Need test funds?{' '}
                      <a
                        href="https://faucet.gokite.ai"
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-amber-200/50 underline-offset-4 transition hover:text-amber-100"
                      >
                        Get KITE from the faucet
                      </a>.
                    </p>
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
                      <code className="font-machine min-w-0 flex-1 truncate text-[0.8rem] text-amber-100">
                        {quote.address}
                      </code>
                      <button
                        type="button"
                        onClick={copyAddress}
                        className="font-machine shrink-0 rounded-full border border-white/15 px-3 py-1 text-[0.72rem] text-white transition hover:border-white/40"
                        aria-live="polite"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    {copyFailed && (
                      <p className="mt-2 text-[0.8rem] text-amber-200">Copy is blocked in this browser, so select the address manually.</p>
                    )}
                    <form
                      className="mt-4"
                      onSubmit={(e) => {
                        e.preventDefault()
                        redeem()
                      }}
                    >
                      <label className="font-machine block text-[0.78rem] text-[var(--muted)]" htmlFor="tx">
                        Paste the payment hash when it confirms
                      </label>
                      <input
                        id="tx"
                        className="font-machine field mt-2 text-sm"
                        placeholder="0x…"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        disabled={phase === 'redeeming'}
                        spellCheck={false}
                        autoComplete="off"
                        inputMode="text"
                      />
                      <button type="submit" disabled={phase === 'redeeming'} className="btn-primary mt-4" aria-busy={phase === 'redeeming'}>
                        {phase === 'redeeming' ? <span className="busy">Verifying payment, then writing…</span> : 'I paid, deliver the brief'}
                      </button>
                    </form>
                    {phase === 'redeeming' && (
                      <p className="mt-3 text-[0.83rem] text-[var(--muted)]">
                        Step one checks the chain and is instant. Step two is the seller agent writing, and that takes a minute or two.
                      </p>
                    )}
                  </div>
                )}

                {feed.length > 0 && phase !== 'done' && (
                  <ol className="mt-5 space-y-2 border-t border-white/10 pt-4" aria-label="Order progress">
                    {feed.map(([line, on], i) => (
                      <li key={line} className={`feed-in font-machine flex items-start gap-2.5 text-[0.78rem] ${on ? 'text-white' : 'text-[#5b6572]'}`}>
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${on ? 'bg-emerald-300' : 'bg-white/20'}`}
                          aria-hidden="true"
                        />
                        <span>
                          <span className="mr-2 opacity-60">{String(i + 1).padStart(2, '0')}</span>
                          {line}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                {error && (
                  <div role="alert" aria-live="assertive" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-[0.9rem] leading-relaxed text-red-100">
                    {error}
                  </div>
                )}

                {phase === 'done' && (
                  <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-[0.9rem] text-emerald-100">
                    Paid and verified. Your brief and receipt are below.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- delivered brief + receipt ---------- */}
        {phase === 'done' && brief && receipt && (
          <section id="brief" className="mt-12 scroll-mt-24">
            <article className="rounded-2xl border border-white/10 bg-white/[0.99] p-6 md:p-10">
              <div className="brief-doc">{renderBrief(brief)}</div>
              <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={downloadBrief}
                  className="font-machine rounded-full bg-[#141310] px-5 py-2.5 text-[0.8rem] font-semibold text-white transition hover:bg-black"
                >
                  Download brief (.md)
                </button>
                <button
                  type="button"
                  onClick={copyReceipt}
                  className="font-machine rounded-full border border-black/15 px-5 py-2.5 text-[0.8rem] text-[#141310] transition hover:border-black/40"
                  aria-live="polite"
                >
                  {receiptCopied ? 'Receipt copied' : 'Copy receipt JSON'}
                </button>
              </div>
              {copyFailed && (
                <p className="mt-3 text-[0.85rem] text-[#B45309]">Copy is blocked in this browser, so select the receipt manually.</p>
              )}
            </article>
            <aside aria-label="Payment receipt" className="receipt-enter glass-deep mt-5 overflow-hidden rounded-2xl">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 px-6 py-4">
                <p className="font-display text-[1.3rem]">Receipt</p>
                <p className="font-machine text-[0.78rem] font-semibold text-emerald-300">payment verified, brief delivered</p>
              </div>
              <dl className="space-y-0 px-6 py-2 text-[0.92rem]">
                {[
                  ['Paid', `${receipt.amountPaid} ${receipt.currency}`],
                  ['Price', `${receipt.price} ${receipt.currency}, chain ${receipt.chainId}`],
                  ['Block', receipt.blockNumber ?? 'pending'],
                  ['Capability', receipt.capability],
                  ['Model', receipt.model],
                  ['Generated through', pathLabel],
                  ['Redeemed', new Date(receipt.redeemedAt).toLocaleString()]
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-white/10 py-3">
                    <dt className="w-28 shrink-0 text-[var(--muted)]">{label}</dt>
                    <dd className="font-machine min-w-0 flex-1 break-all text-[0.85rem]">{value}</dd>
                  </div>
                ))}
                <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-white/10 py-3">
                  <dt className="w-28 shrink-0 text-[var(--muted)]">Seller</dt>
                  <dd className="font-machine min-w-0 flex-1 break-all text-[0.85rem]">{receipt.address}</dd>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 py-3">
                  <dt className="w-28 shrink-0 text-[var(--muted)]">Transaction</dt>
                  <dd className="min-w-0 flex-1 break-all">
                    <a
                      className="font-machine text-[0.85rem] text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:decoration-emerald-300"
                      href={receipt.txUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {receipt.txHash}
                    </a>
                  </dd>
                </div>
              </dl>
              <div className="border-t border-white/10 px-6 py-4">
                <button onClick={reset} className="font-machine text-[0.83rem] text-[var(--muted)] underline underline-offset-4 transition hover:text-white">
                  Buy another brief
                </button>
              </div>
            </aside>
          </section>
        )}

        <footer id="site-footer" className="mt-20 border-t border-white/10 pt-6 pb-24 text-[0.85rem] text-[var(--muted)] md:pb-8">
          <p>HireMind. Built on the OpenServ agent network, settled on Kite testnet, judged at SERV Hackathon 02.</p>
        </footer>
      </main>

      {/* ---------- mobile sticky cta ---------- */}
      {showMobileCta && phase !== 'done' && (
        <a
          href="#buy"
          className="btn-primary fixed inset-x-4 bottom-4 z-40 shadow-2xl md:hidden"
          style={{ width: 'auto' }}
        >
          Buy a brief for 0.01 KITE
        </a>
      )}
    </div>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Status = { agentOnline: boolean; codeVersion: string; delivered: number }

const EXAMPLES = [
  'x402 pay-per-call for AI agents',
  'verifiable inference for agent swarms',
  'who pays for agent data?'
]

const FAQS = [
  {
    q: 'What do I need to try the live demo?',
    a: 'Any Kite testnet wallet with a little test KITE (chain 2368, free from the faucet). No account, no API key, no sign-up. Type a topic, send exactly 0.01 KITE to the seller address, paste the transaction hash, and the brief comes back with a receipt.'
  },
  {
    q: 'What happens if I pay the wrong address or too little?',
    a: 'The app reads the chain before delivering anything: right recipient, right amount, confirmed transaction. A wrong address, a short payment, a failed transaction, or a hash from another chain is refused with a reason. The hash is never burned, so a mistaken payment can never lock you out of retrying with the right one.'
  },
  {
    q: 'What if generation fails after I already paid?',
    a: 'The claim on your transaction hash is released, so you can retry with the same hash instead of paying twice. A hash is only marked redeemed once a brief has actually been delivered.'
  },
  {
    q: 'Which system actually wrote my brief?',
    a: 'The receipt says so, honestly. The paid request goes to the hiremind-seller agent through the OpenServ runtime first (SERV Reasoning). If that path is unreachable, a direct provider chain runs instead, and the receipt labels it a direct fallback, never SERV Reasoning.'
  },
  {
    q: 'Is this the full x402 facilitator flow?',
    a: 'It is x402 style, not the full facilitator flow. HTTP 402 answers with the price and the seller address, you pay on-chain, the app verifies the payment on-chain, then delivers. There is no off-chain facilitator in the middle. Settlement is fully on Kite testnet.'
  }
]

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null)
  const [showMobileCta, setShowMobileCta] = useState(true)

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
          <a href="#top" className="flex items-center gap-2.5" aria-label="HireMind home">
            <Image src="/logo.svg" alt="HireMind" width={220} height={72} className="h-9 w-auto" priority />
          </a>
          <div className="hidden items-center gap-7 font-machine text-[0.82rem] text-[var(--muted)] md:flex">
            <a className="transition-colors hover:text-white" href="#how">How it works</a>
            <a className="transition-colors hover:text-white" href="#cases">Use cases</a>
            <a className="transition-colors hover:text-white" href="#faq">FAQ</a>
          </div>
          <Link href="/brief" className="font-machine rounded-full bg-white px-4 py-2 text-[0.8rem] font-bold text-black transition hover:bg-emerald-200">
            Buy a brief: 0.01 KITE
          </Link>
        </nav>
      </header>

      <main id="top" className="mx-auto w-full max-w-6xl px-5 pb-28 md:px-8">
        {/* ---------- hero + live demo ---------- */}
        <section className="grid gap-10 pt-12 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div>
            <p className="rise font-machine inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3.5 py-1.5 text-[0.75rem] text-emerald-200">
              <span className="live-dot" aria-hidden="true" />
              SERV Hackathon 02, Open Track, live on Kite testnet
            </p>
            <h1 className="rise rise-1 font-display mt-6 text-[2.6rem] leading-[1.08] font-medium tracking-tight text-balance md:text-6xl">
              Pay an agent. <span className="grad-text">Get the brief.</span> Keep the receipt.
            </h1>
            <p className="rise rise-2 mt-5 max-w-xl text-[1.08rem] leading-relaxed text-[var(--muted)]">
              HireMind is a pay-per-brief marketplace on the OpenServ agent network. A seller agent writes
              structured research briefs for a fixed on-chain price. You pay, the payment is verified on-chain,
              and the brief arrives with a receipt that links back to the transaction.
            </p>
            <div className="rise rise-3 mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/brief" className="btn-primary sm:w-auto sm:px-8">
                Buy a brief for 0.01 KITE
              </Link>
              <a href="#how" className="btn-ghost sm:w-auto">
                See how the loop works
              </a>
            </div>
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

          {/* brief page cta */}
          <div id="demo" className="scroll-mt-24">
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
                <p className="font-machine text-[0.78rem] text-[var(--muted)]">
                  What should the brief cover?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <Link
                      key={ex}
                      href={`/brief?topic=${encodeURIComponent(ex)}`}
                      className="chip"
                    >
                      {ex}
                    </Link>
                  ))}
                </div>
                <Link href="/brief" className="btn-primary mt-5">
                  Buy a brief for 0.01 KITE
                </Link>
                <p className="mt-3 text-[0.83rem] text-[var(--muted)]">
                  Topic, payment, delivery, and receipt all live on the brief page.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ---------- proof strip ---------- */}
        <section aria-label="Proof" className="mt-20 md:mt-28">
          <p className="font-machine text-[0.78rem] text-[var(--muted)]">Proof, not promises</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl leading-[1.15] text-balance md:text-[2.6rem]">
            Every claim on this page can be checked.
          </h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Seller agent 4926', 'hiremind-seller, registered on the OpenServ network with one run-less capability: research_brief.'],
              ['HireMind Brief Machine', 'the platform workflow that receives the paid topic and returns brief markdown as task output.'],
              ['On-chain settlement', '0.01 KITE on Kite testnet (chain 2368). Recipient, amount, and receipt status are all verified.'],
              ['Honest receipts', 'each delivery names its path: SERV Reasoning through the OpenServ runtime, or a labeled direct fallback.'],
              ['Replay protection', 'each payment hash is claimed atomically and persisted to a ledger, so a hash pays out exactly once.'],
              ['Live build', status ? `Build ${status.codeVersion}, agent ${status.agentOnline ? 'online' : 'unreachable'}. ${status.delivered} ${status.delivered === 1 ? 'brief' : 'briefs'} redeemed on this server.` : 'This page reads its build version live from the API. Refresh and check.']
            ].map(([title, body]) => (
              <div key={title} className="glass rounded-2xl p-5">
                <p className="font-machine text-[0.85rem] font-semibold text-emerald-200">{title}</p>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- how it works ---------- */}
        <section id="how" className="mt-20 scroll-mt-24 md:mt-28">
          <p className="font-machine text-[0.78rem] text-[var(--muted)]">How the loop works</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl leading-[1.15] text-balance md:text-[2.6rem]">
            Topic in, brief out, receipt to prove it.
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            {[
              ['01 Pay', 'You send 0.01 KITE on Kite testnet to the seller address. No account, no key, just a transfer.', 'text-amber-200'],
              ['02 Verify', 'The app reads the chain: right recipient, right amount, confirmed transaction. Anything else is refused with a reason.', 'text-amber-200'],
              ['03 Deliver', 'The seller agent writes the brief and you get it with a receipt that links back to the payment.', 'text-emerald-200']
            ].map(([title, body, accent]) => (
              <div key={title} className="bg-[#070b14] p-6 md:p-7">
                <p className={`font-machine text-[0.8rem] font-semibold ${accent}`}>{title}</p>
                <p className="mt-3 leading-relaxed text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- use cases ---------- */}
        <section id="cases" className="mt-20 scroll-mt-24 md:mt-28">
          <p className="font-machine text-[0.78rem] text-[var(--muted)]">Where it fits</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl leading-[1.15] text-balance md:text-[2.6rem]">
            Built for anyone who pays for answers.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['The diligence desk', 'A fund needs a same-day brief on a niche protocol. They pay per brief, file the receipt next to the invoice, and move on. No seat, no subscription, no procurement thread.'],
              ['Agent swarms settling up', 'One agent needs research from another and neither has a credit card. A fixed on-chain price plus a verifiable receipt is the whole accounting layer.'],
              ['Paid data, honestly labeled', 'Briefs ship with cited sources and a provenance note. When the platform runtime writes it, the receipt says so. When the fallback does, the receipt says that too.']
            ].map(([title, body]) => (
              <div key={title} className="glass group rounded-2xl p-6 transition-colors duration-200 hover:border-emerald-300/30 md:p-7">
                <p className="font-display text-[1.35rem] leading-snug">{title}</p>
                <p className="mt-3 text-[0.93rem] leading-relaxed text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- comparison ---------- */}
        <section id="compare" className="mt-20 scroll-mt-24 md:mt-28">
          <p className="font-machine text-[0.78rem] text-[var(--muted)]">Why not just use the alternatives</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl leading-[1.15] text-balance md:text-[2.6rem]">
            The alternatives leave no paper trail.
          </h2>
          <div className="glass mt-8 overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[640px] border-collapse text-left text-[0.9rem]">
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="px-6 py-4 font-normal text-[var(--muted)]"> </th>
                  <th scope="col" className="font-machine px-6 py-4 text-[0.82rem] font-semibold text-emerald-200">HireMind</th>
                  <th scope="col" className="px-6 py-4 font-normal text-[var(--muted)]">DIY agent scripts</th>
                  <th scope="col" className="px-6 py-4 font-normal text-[var(--muted)]">Research subscription</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Payment rail', 'On-chain transfer, 0.01 KITE', 'Your key, your problem', 'Credit card seat'],
                  ['Verification', 'Recipient, amount, receipt status', 'Hope you checked', 'Not applicable'],
                  ['Receipt', 'Links brief to transaction', 'Logs if you kept them', 'Monthly invoice'],
                  ['Sources', 'Cited, with provenance note', 'Whatever the model said', 'Analyst-dependent'],
                  ['Honest fallback', 'Receipt names the path taken', 'Silent model swaps', 'Silent model swaps']
                ].map(([row, us, diy, saas], i) => (
                  <tr key={row} className={i < 4 ? 'border-b border-white/10' : ''}>
                    <th scope="row" className="px-6 py-4 font-normal text-[var(--muted)]">{row}</th>
                    <td className="font-machine px-6 py-4 text-[0.82rem] text-white">{us}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">{diy}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">{saas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- verification checklist ---------- */}
        <section aria-label="Verify it yourself" className="mt-20 md:mt-28">
          <div className="glass-deep rounded-3xl p-7 md:p-12">
            <p className="font-machine text-[0.78rem] text-[var(--muted)]">Verify it yourself</p>
            <h2 className="font-display mt-2 max-w-xl text-3xl leading-[1.15] text-balance md:text-4xl">
              A judge can confirm the whole loop in 30 seconds.
            </h2>
            <ol className="mt-7 space-y-4">
              {[
                'Ask for a price: the API answers 402 with 0.01 KITE and the seller address.',
                'Pay on Kite testnet and paste the hash: the app verifies recipient, amount, and confirmation on-chain.',
                'Read the brief, then open the receipt: transaction, capability, model, and generation path, plus an explorer link.',
                'Try to cheat it: wrong address, short payment, reused hash. Each one is refused with a reason.'
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="font-machine flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10 text-[0.8rem] font-semibold text-emerald-200">
                    {i + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-white/85">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/brief" className="btn-primary sm:w-auto sm:px-8">
                Run the loop now
              </Link>
              <a
                href="https://testnet.kitescan.ai"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost sm:w-auto"
              >
                Open KiteScan explorer
              </a>
            </div>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section id="faq" className="mt-20 scroll-mt-24 md:mt-28">
          <p className="font-machine text-[0.78rem] text-[var(--muted)]">Questions judges ask</p>
          <h2 className="font-display mt-2 text-3xl leading-[1.15] text-balance md:text-[2.6rem]">Straight answers.</h2>
          <div className="mt-7 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item px-5 py-4 md:px-6">
                <summary className="flex items-center justify-between gap-4 text-[1.02rem]">
                  {f.q}
                  <span className="font-machine shrink-0 text-[var(--muted)]" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-3xl leading-relaxed text-[var(--muted)]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ---------- final cta + footer ---------- */}
        <section className="mt-20 text-center md:mt-28">
          <p className="font-machine text-[0.78rem] text-[var(--muted)]">SERV Hackathon 02, Open Track</p>
          <h2 className="font-display mx-auto mt-3 max-w-2xl text-4xl leading-[1.1] text-balance md:text-5xl">
            The cheapest due diligence you will ever <span className="grad-text">put on-chain.</span>
          </h2>
          <div className="mx-auto mt-8 max-w-md">
            <Link href="/brief" className="btn-primary">
              Buy a brief for 0.01 KITE
            </Link>
            <p className="font-machine mt-3 text-[0.75rem] text-[var(--muted)]">Kite testnet, no account, receipt included</p>
          </div>
        </section>

        <footer id="site-footer" className="mt-20 border-t border-white/10 pt-6 pb-24 text-[0.85rem] text-[var(--muted)] md:pb-8">
          <p>HireMind. Built on the OpenServ agent network, settled on Kite testnet, judged at SERV Hackathon 02.</p>
        </footer>
      </main>

      {/* ---------- mobile sticky cta ---------- */}
      {showMobileCta && (
        <Link
          href="/brief"
          className="btn-primary fixed inset-x-4 bottom-4 z-40 shadow-2xl md:hidden"
          style={{ width: 'auto' }}
        >
          Buy a brief for 0.01 KITE
        </Link>
      )}
    </div>
  )
}

# HireMind: pay an agent, get a brief, keep the receipt

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![OpenServ](https://img.shields.io/badge/OpenServ-agent_network-indigo)](https://openserv.ai)
[![Kite testnet](https://img.shields.io/badge/Kite-testnet_2368-teal)](https://testnet.kitescan.ai)

Open Track entry for **SERV Hackathon 02**. A seller agent on the OpenServ
network writes research briefs for a fixed on-chain price. Buyers pay on Kite
testnet, the app verifies the payment on-chain, the brief is delivered with a
receipt that links back to the transaction.

Live loop: topic in, 0.01 KITE out, brief plus receipt back.

## Architecture

- `agent/`: OpenServ seller agent (`@openserv-labs/sdk` + `@openserv-labs/client`).
  Single run-less capability `research_brief`. Registered via `provision()` with
  a webhook trigger (agent 4926, workflow `HireMind Brief Machine`).
- `app/api/brief/route.ts`: x402-style paywall. `POST {topic}` returns 402
  with price and seller address. `POST {topic, txHash}` verifies the payment on
  Kite testnet (recipient, amount >= price so overpayment is accepted and
  recorded, receipt status, replay guard), tries the OpenServ webhook (60s),
  then falls back to direct generation and returns brief + receipt. A hash
  pays out exactly once; generation failure releases the claim so the same
  hash can be retried without paying twice.
- `app/lib/brief.ts`: direct generation fallback chain: AgentRouter, then any
  OpenAI-compatible provider (with token-budget escalation for reasoning
  models), then Pollinations free tier. All paths strip em/en dashes from
  model output per the DESIGN.md house rule.
- `app/lib/markdown.tsx`: tiny safe renderer for brief markdown. Builds React
  nodes directly, never raw HTML, so model output stays inert. Supports
  headings, lists, bold, and links (http and https only).
- `app/page.tsx`: marketing landing (hero with a real delivered receipt,
  proof line, how-it-works call and response column, showcase of real
  briefs, price, FAQ). See `DESIGN.md` for the design contract.
- `app/brief/`: the buy flow lives here. Topic field and price, payment with
  on-chain verification, brief renders as a document below, receipt as a
  stamped slip.
- `app/privacy/`, `app/not-found.tsx`, `app/robots.ts`, `app/sitemap.ts`,
  `public/llms.txt`: finish line checklist (privacy note, 404, robots,
  sitemap, llms.txt). Canonical tags on `/` and `/brief`, JSON-LD
  (WebSite plus SoftwareApplication) on the landing.

## Setup

```bash
# web app
cp .env.example .env.local   # fill SELLER_ADDRESS (+ optional provider keys)
npm install
npm run dev                  # localhost:3000

# seller agent (optional: the direct fallback works without it, the receipt
# then records the fallback model instead of openserv-runtime)
cd agent
cp .env.example .env         # fill OPENSERV_USER_API_KEY + SELLER_ADDRESS
npm install
npm run dev
```

The agent prints its webhook URL on startup and writes `agent/.openserv.json`.
The web app reads that file automatically; `OPENSERV_WEBHOOK_URL` overrides it.

## Try it

1. Enter a topic (or tap an example), get the price: 0.01 KITE on chain 2368.
2. Send exactly 0.01 KITE on Kite testnet to the seller address.
3. Paste the transaction hash, get the brief plus a receipt with an explorer link.

Kite testnet: chain ID 2368, RPC `https://rpc-testnet.gokite.ai`,
faucet `https://faucet.gokite.ai`, explorer `https://testnet.kitescan.ai`.

## Truthful notes for judges

- Settlement is x402-style (402, pay, verify, deliver), not the full x402
  facilitator flow. Paid hashes never expire: each hash pays out exactly
  once (reused hashes are refused), overpayment is accepted with the actual
  amount recorded, underpayment and wrong-recipient payments are refused
  without burning the hash. No payment is ever stranded by age.
- SERV Reasoning is the primary path: the paid request goes to the
  `hiremind-seller` agent (`HireMind Brief Machine` workflow) via the OpenServ
  webhook, and the platform runtime generates the brief. The direct fallback
  (AgentRouter / OpenAI-compatible / Pollinations) runs only when the webhook
  is unreachable, and the receipt honestly labels which path ran. A fallback
  brief is never reported as SERV Reasoning.
- Payment verification is fully on-chain against Kite testnet (chain 2368):
  success receipt, correct seller recipient, amount >= price. Wrong address,
  underpayment, failed txs, unknown hashes and other-chain hashes are all
  refused with a reason. No payment is ever lost to a wrong address.
- Replay protection is an atomic in-process claim (concurrent redemptions of
  the same hash cannot both pass) backed by a persistent `.data/redeemed.json`
  ledger so restarts cannot re-open a hash. Single-file ledger is demo-grade
  durability, not a production multi-instance store. If generation fails after
  a verified payment, the claim is released so the buyer can retry with the
  same hash instead of paying twice.

# HireMind: submission blurb (SERV Hackathon 02, Open Track)

**One-liner:** Pay an agent 0.01 KITE, get a research brief, keep the on-chain receipt.

**What it is:** HireMind is a pay-per-brief marketplace on the OpenServ agent
network. A seller agent (`research_brief` capability, registered on the
platform) sells structured briefs with sources and provenance notes. The Next.js
app puts a 402 paywall in front: pay on Kite testnet, the payment is verified
on-chain (recipient, amount, confirmation, replay protection), the brief is
delivered with a receipt linking back to the transaction.

**Why it fits the hackathon:** verifiable agent work (OpenServ runtime,
receipted output) meets agentic payments (pay-per-call settlement on a
chain built for agents) meets paid data (briefs grounded in cited sources).
The whole loop is auditable on screen: topic, payment hash, brief, receipt.

**Stack:** OpenServ TS SDK + client (provision, webhook trigger, run-less
capability), Next.js 16, Viem, Kite testnet (chain 2368). Brief generation
races the platform runtime against a direct provider chain so the demo never
dead-ends on tunnel flakiness; the receipt always names which path ran.

**Links:** repo (this), demo video (pending), seller agent 4926 / workflow
HireMind Brief Machine, KiteScan transaction from the recorded demo.

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
capability), Next.js 16, Viem, Kite testnet (chain 2368). Brief delivery tries
the platform runtime first, then a direct provider chain sequentially so the
demo never dead-ends on tunnel flakiness; the receipt always names which path
ran. No completed SERV run observed yet, see README truthful notes.

**Links:** repo (this), [demo video](https://github.com/Sketchify-Dev/hiremind/releases/tag/demo-video-pro)
(95.8s pro cut: voiceover, captions, score, logo end-card), seller agent 4926 /
workflow HireMind Brief Machine, [KiteScan payment from the recorded demo](https://testnet.kitescan.ai/tx/0xb672b18015289bb89a7b96617d336a27b6e855e9c8d268913ddb819cff9b18f1)
(0.01 KITE, block 22043830, receipt success).

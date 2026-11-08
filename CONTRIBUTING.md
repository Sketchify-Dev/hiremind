# Contributing to HireMind

HireMind is a hackathon build: a Next.js pay-per-brief app plus an OpenServ
seller agent. Small, focused pull requests are welcome.

## Setup

```bash
cp .env.example .env.local   # fill SELLER_ADDRESS
npm install
npm run dev                  # web app on localhost:3000

cd agent
cp .env.example .env         # fill OPENSERV_USER_API_KEY + SELLER_ADDRESS
npm install
npm run dev                  # seller agent
```

Node 24 is pinned in `.nvmrc`. Use it so lockfiles stay consistent.

## Before you push

```bash
npm run typecheck
npm run lint
npm run build
```

All three must pass. CI runs the same steps for the web app, plus a
typecheck for `agent/`.

## Ground rules

- Keep the design contract in `DESIGN.md`. One deck, sentence case, no
  em or en dashes in copy or model output.
- Keep receipts honest: a fallback brief is never labeled SERV Reasoning.
- Never commit secrets: `.env`, `.env.local`, `.openserv.json`, keys,
  mnemonics, or real transaction hashes tied to wallets. Examples stay
  tracked (`.env.example`); values never do.
- Payments are Kite testnet only. Real mainnet addresses do not belong
  in code, issues, or pull requests.

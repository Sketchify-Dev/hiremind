# Security policy

## Supported versions

HireMind is a hackathon demo, not production software. The latest commit
on the default branch is the only supported version, and support means
best effort triage.

## Report a vulnerability

Open a private security advisory on GitHub
(repo page, Security tab, Report a vulnerability) or open an issue with
no sensitive details and ask for a contact. Include what you did, what
you expected, and what happened. Testnet only: please do not send
mainnet funds anywhere near this project.

## Scope notes

- Payments verify on-chain against Kite testnet (chain 2368). The buyer
  pays from their own wallet; this repo never asks for private keys or
  seed phrases, and any request for them is a scam.
- Replay protection is a single-file ledger (`.data/redeemed.json`),
  demo-grade durability, not a production multi-instance store.
- The brief renderer builds React nodes directly and never injects raw
  HTML, so model output stays inert. Links are restricted to http/https.

# HireMind DESIGN.md: contract for all UI work

Product: HireMind. Pay a seller agent on-chain, get a research brief plus a
verifiable payment receipt. Built for SERV Hackathon 02, Open Track.
Audience: hackathon judges and crypto-native builders.
Page job: make a judge believe the pay-to-brief loop is real in 30 seconds.

## Palette (stone and blueprint)

| Token   | Hex     | Role                                           |
| ------- | ------- | ---------------------------------------------- |
| Bg      | #DFDEDB | page ground                                    |
| Surface | #D3D2CE | stages, call panels, faq tiles                 |
| Paper   | #F6F3EC | receipts, brief sheets, fields                 |
| Ink     | #26251E | headlines, body, borders                       |
| Muted   | #5F5D55 | secondary text                                 |
| Accent  | #1F4FD1 | one blue: links, buttons, faq open, price seal |
| Mint    | #0E7A4D | paid and verified states ONLY, never decoration|
| Gold    | #8A5B00 | payment step callouts only                     |
| Error   | #7A1A14 on #FBEAE8 | errors                               |

Light ground, near-black ink. No gradients, no tinted near-blacks, no
glow. Blue is the single accent. Mint and gold are state colors only.

## Type

- Everything: Bricolage Grotesque (400 body, 500 emphasis, 600 headlines),
  loaded via next/font in layout.tsx as --hm-font. Georgia for the brief
  document and showcase sheet only (the artifact reads as paper, the page
  reads as an instrument).
- Machine (hashes, prices, chain ids, labels, feeds): ui-monospace,
  'SF Mono', Menlo, monospace with tabular numerals. Facts look stamped,
  not typeset.
- Sentence case everywhere. No all-caps labels. No middle-dot meta strings.
- Copy rule: no em dashes or en dashes anywhere. Use commas, colons,
  or periods instead. Headings use balanced wrapping so no single
  word is left alone on its own line.

## Layout

Single column, max-w-6xl, left aligned. The product performs on the page:
working fragments (receipt, call panels, brief sheet) at true size, each
fragment root marked data-ui. Landing: one hero (headline plus receipt),
one proof line, one how-it-works strip (call and response column), one
showcase (output index plus live sheet), one price block, one FAQ, one
CTA band, one quiet footer. Buy flow lives on /brief. No feature card
grids, no eyebrow labels, no numbered steps, no arrows on links.

## Principles

- One bold move: a sample receipt from a real overpaid delivery sits in the
  hero, labeled as a sample with its fallback path on the slip. Everything
  else is quiet.
- Motion answers actions only (pay, verifying, delivered). Entering
  elements use ease-out. One page-load moment at most. Respect reduced
  motion.
- Mint appears only on paid and verified states. Gold only on
  the pay step.
- Errors give directions, never apologies. Empty states invite action.
- Receipt shows: tx (explorer link), amount, capability, model,
  generation path, timestamp.

## Forbidden (generic-default tells)

- Accenting a single word in a headline with color or italic.
- All-caps tracked labels, middle-dot meta strings, 'WORD: fragment' labels.
- Tinted near-blacks, gradient washes, identical rounded cards with soft shadows.
- Fade-and-slide-up entrances on every section. Arrows on links.

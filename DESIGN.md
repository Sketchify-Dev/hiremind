# HireMind DESIGN.md: contract for all UI work

Product: HireMind. Pay a seller agent on-chain, get a research brief plus a
verifiable payment receipt. Built for SERV Hackathon 02, Open Track.
Audience: hackathon judges and crypto-native builders.
Page job: make a judge believe the pay-to-brief loop is real in 30 seconds.

## Palette (dark cinematic)

| Token  | Hex     | Role                                              |
| ------ | ------- | ------------------------------------------------- |
| Bg     | #05070D | page background                                   |
| Ink    | #F2F5F1 | headlines, body                                   |
| Muted  | #9AA5B1 | secondary text                                    |
| Mint   | #34D399 | paid and verified states ONLY, never decoration   |
| Gold   | #F5B544 | payment step callouts only                        |
| Line   | 9% white| hairline borders                                |
| Danger | #F87171 | errors                                            |

## Type

- Voice (body, UI): Inter, system stack, sans-serif.
- Display (headlines, brief document): Georgia, 'Times New Roman', serif.
- Machine (hashes, prices, chain ids, buttons, labels): ui-monospace,
  'SF Mono', Menlo, monospace. Facts look stamped, not typeset.
- No third family. Sentence case everywhere. No all-caps labels.
- Copy rule: no em dashes or en dashes anywhere. Use commas, colons,
  or periods instead. Headings use balanced wrapping so no single
  word is left alone on its own line.

## Layout

Single column, max-w-6xl, left aligned, hero plus live demo side by side
on desktop and stacked on mobile. The page IS the product: topic field
and price above the fold, brief renders as a document below, receipt as
a stamped slip. One how-it-works strip, one use-case strip, one
comparison table, one verification checklist, one FAQ, one footer.
No card grids of features, no eyebrow labels, no numbered steps.

## Principles

- One bold move: the live demo is the hero. Everything else is quiet.
- Motion answers actions only (pay, verifying, delivered). Entering
  elements use ease-out. One page-load moment at most. Respect reduced
  motion.
- Mint green appears only on paid and verified states. Gold only on
  the pay step.
- Errors give directions, never apologies. Empty states invite action.
- Receipt shows: tx (explorer link), amount, capability, model,
  generation path, timestamp.

## Forbidden (generic-default tells)

- Accenting a single word in a headline with color or italic.
- All-caps tracked labels, middle-dot meta strings, 'WORD: fragment' labels.
- Tinted near-blacks, gradient washes, identical rounded cards with soft shadows.
- Fade-and-slide-up entrances on every section. Arrows on links.

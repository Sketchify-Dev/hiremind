// Local redemption ledger: persists which transaction hashes have been
// redeemed so each hash pays out exactly once, across server restarts.
// Single-file JSON ledger is demo-grade durability, not a production
// multi-instance store. On Vercel the filesystem is ephemeral per
// deployment, so the count resets on redeploy; for cross-deploy
// persistence use an external store (Vercel Blob / Marketplace DB).
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

const LEDGER_PATH = join(process.cwd(), '.data', 'redeemed.json')
const HASH_RE = /^0x[0-9a-f]{64}$/

export class RedemptionLedger {
  private hashes = new Set<string>()
  private loaded = false

  load(): void {
    if (this.loaded) return
    this.loaded = true
    try {
      const raw = readFileSync(LEDGER_PATH, 'utf8')
      const arr: unknown = JSON.parse(raw)
      if (Array.isArray(arr)) {
        for (const h of arr) {
          if (typeof h === 'string' && HASH_RE.test(h)) this.hashes.add(h)
        }
      }
    } catch {
      // no ledger yet, first run
    }
  }

  has(hash: string): boolean {
    this.load()
    return this.hashes.has(hash)
  }

  add(hash: string): void {
    this.load()
    this.hashes.add(hash)
    this.persist()
  }

  size(): number {
    this.load()
    return this.hashes.size
  }

  private persist(): void {
    try {
      mkdirSync(dirname(LEDGER_PATH), { recursive: true })
      const tmp = LEDGER_PATH + '.tmp'
      writeFileSync(tmp, JSON.stringify([...this.hashes]), 'utf8')
      renameSync(tmp, LEDGER_PATH)
    } catch {
      // ledger persistence is best-effort for a demo
    }
  }
}

export const ledger = new RedemptionLedger()

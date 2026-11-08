import Link from 'next/link'

export const metadata = {
  title: 'Not found',
  description: 'This HireMind page does not exist. Buy a brief or go home.'
}

export default function NotFound() {
  return (
    <div className="hm-body min-h-screen">
      <main className="hm-frame" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <p className="hm-small" style={{ color: 'var(--hm-muted)' }}>Nothing here</p>
        <h1 className="hm-section-head" style={{ marginTop: '1rem' }}>
          This page was never delivered.
        </h1>
        <p className="hm-body-text" style={{ marginTop: '1.5rem', maxWidth: '44ch' }}>
          No payment was taken and no brief was written. The loop still works
          from the home page or the buy page.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/brief" className="hm-btn">
            Buy a brief for 0.01 KITE
          </Link>
          <Link href="/" className="hm-btn-ghost">
            Back home
          </Link>
        </div>
      </main>
    </div>
  )
}

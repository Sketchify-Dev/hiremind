'use client'

import { useEffect } from 'react'

// Adds .in to .hm-reveal elements as they enter the viewport.
// One IntersectionObserver for the whole page; content is visible
// without script (elements start hidden only when JS runs).
export function useReveal() {
  useEffect(() => {
    // Gate the hidden state behind JS: without this class the
    // .hm-reveal sections render visible, so no-JS keeps content.
    document.documentElement.classList.add('hm-js')
    const els = Array.from(document.querySelectorAll('.hm-reveal'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 120px 0px' }
    )
    els.forEach((el, i) => {
      ;(el as HTMLElement).style.transitionDelay = `${Math.min(i % 5, 4) * 70}ms`
      io.observe(el)
    })
    return () => io.disconnect()
  }, [])
}

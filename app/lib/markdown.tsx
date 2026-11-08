import type { ReactNode } from 'react'

// Minimal safe markdown renderer for seller-agent briefs.
// Builds React nodes directly (never dangerouslySetInnerHTML), so embedded
// HTML in model output renders as inert text. Supports the subset the brief
// contract actually uses: ##/### headings, -/* unordered lists, 1. ordered
// lists, **bold**, and [label](https://url) links. http(s) URLs only.

let counter = 0
function key(prefix: string): string {
  counter += 1
  return `${prefix}-${counter}`
}

const INLINE_RE = /(\*\*[^\n*]+\*\*|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s)<\]]+)/g
const LINK_RE = /^\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)$/
const BARE_URL_RE = /^(https?:\/\/[^\s)<\]]+?)([.,;:!?)\]]*)$/

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_RE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    const link = LINK_RE.exec(part)
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      )
    }
    const bare = BARE_URL_RE.exec(part)
    if (bare) {
      return (
        <span key={i}>
          <a href={bare[1]} target="_blank" rel="noreferrer">
            {bare[1]}
          </a>
          {bare[2]}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

const HEADING_RE = /^(#{1,3})\s+(.*)$/
const UL_RE = /^[-*]\s+(.*)$/
const OL_RE = /^\d+[.)]\s+(.*)$/

export function renderBrief(brief: string): ReactNode[] {
  counter = 0
  const out: ReactNode[] = []
  const lines = brief.replace(/\r\n?/g, '\n').split('\n')
  let para: string[] = []
  let items: ReactNode[] = []
  let listKind: 'ul' | 'ol' | null = null

  function flushPara() {
    if (para.length > 0) {
      const text = para.join(' ')
      if (text.trim()) out.push(<p key={key('p')}>{renderInline(text)}</p>)
      para = []
    }
  }

  function flushList() {
    if (listKind && items.length > 0) {
      const Tag = listKind
      out.push(<Tag key={key('list')}>{items}</Tag>)
    }
    items = []
    listKind = null
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushPara()
      flushList()
      continue
    }
    const h = HEADING_RE.exec(line)
    if (h) {
      flushPara()
      flushList()
      const content = renderInline(h[2])
      if (h[1].length <= 2) out.push(<h2 key={key('h')}>{content}</h2>)
      else out.push(<h3 key={key('h')}>{content}</h3>)
      continue
    }
    let m: RegExpExecArray | null = null
    let kind: 'ul' | 'ol' | null = null
    const ul = UL_RE.exec(line)
    if (ul) {
      m = ul
      kind = 'ul'
    } else {
      const ol = OL_RE.exec(line)
      if (ol) {
        m = ol
        kind = 'ol'
      }
    }
    if (kind && m) {
      flushPara()
      if (listKind !== kind) flushList()
      listKind = kind
      items.push(<li key={key('li')}>{renderInline(m[1])}</li>)
      continue
    }
    para.push(line)
  }
  flushPara()
  flushList()
  return out
}

// Direct brief generation. Used when the OpenServ runtime callback path is
// unreachable from the agent host (egress flakiness). Chain:
// 1. AgentRouter (if AGENTROUTER_API_KEY is set)
// 2. Any OpenAI-compatible provider (if OPENAI_API_KEY is set)
// 3. Pollinations free tier (no key, last resort)

const BRIEF_SYSTEM_PROMPT = [
  'You write short, paid research briefs. Keep the whole brief under 600 words.',
  'Always use exactly these sections:',
  '## Summary',
  '## Key findings',
  '## Sources',
  '## Data provenance',
  'Rules: 3 to 6 bullet findings, every factual claim tied to a source in Sources',
  '(name plus URL, real URLs only, never invent links), and a one line provenance',
  'note stating your knowledge cutoff and that key claims should be verified.'
].join('\n')

type ChatMessage = { role: 'system' | 'user'; content: string }

// House copy rule (see DESIGN.md): no em dashes (U+2014) or en dashes
// (U+2013) anywhere in delivered copy. Model output uses them constantly,
// so normalize before delivery: digit ranges (2020 to 2024 style) keep a
// plain hyphen, everything else becomes a comma. Non-breaking hyphens
// (U+2011, common in model output) become plain hyphens.
export function stripDashes(text: string): string {
  return text
    .replace(/‑/g, '-')
    .replace(/(\d)\s*[–—]\s*(\d)/g, '$1-$2')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,(\S)/g, ', $1')
    .replace(/,{2,}/g, ',')
}

async function chatCompletions(
  baseUrl: string,
  key: string | null,
  model: string,
  messages: ChatMessage[],
  timeoutMs = 90_000,
  maxTokens = 1500,
  extraBody: Record<string, unknown> = {}
): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (key) headers.Authorization = `Bearer ${key}`
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, temperature: 0.4, max_tokens: maxTokens, messages, ...extraBody }),
      signal: controller.signal
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: unknown }; finish_reason?: string }>
    }
    // A reasoning model can burn the whole budget on hidden thinking and stop
    // mid-brief (finish_reason=length) while still returning HTTP 200. Never
    // deliver a cut-off brief as success; throw so the caller retries bigger.
    if (data?.choices?.[0]?.finish_reason === 'length')
      throw new Error('Truncated (finish_reason=length), token budget too small')
    const text = data?.choices?.[0]?.message?.content
    if (typeof text !== 'string' || text.length < 20) throw new Error('Empty completion')
    return text
  } finally {
    clearTimeout(timer)
  }
}

export async function generateBriefDirect(topic: string): Promise<{ brief: string; model: string }> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${BRIEF_SYSTEM_PROMPT}\nNever use em dashes or en dashes; use commas, colons, or separate sentences instead.`
    },
    { role: 'user', content: `Write a paid research brief on: ${topic}` }
  ]
  const errors: string[] = []

  // 1. AgentRouter
  if (process.env.AGENTROUTER_API_KEY) {
    try {
      const brief = await chatCompletions(
        process.env.AGENTROUTER_BASE_URL || 'https://agentrouter.org/v1',
        process.env.AGENTROUTER_API_KEY,
        process.env.AGENTROUTER_MODEL || 'gpt-5.6-sol',
        messages
      )
      return { brief: stripDashes(brief), model: `${process.env.AGENTROUTER_MODEL || 'gpt-5.6-sol'} via AgentRouter` }
    } catch (e) {
      errors.push(`agentrouter: ${(e as Error).message}`)
    }
  }

  // 2. Generic OpenAI-compatible provider (OpenRouter, OpenAI direct, etc.)
  // Current OpenRouter :free offerings are reasoning models that burn most
  // of a small budget on hidden thinking (verified live: finish=length at
  // max_tokens=1500 with nvidia/nemotron-3-ultra-550b-a55b:free, finish=stop
  // at 4000), so escalate the budget like the Pollinations path below.
  if (process.env.OPENAI_API_KEY) {
    const TOKEN_PLAN = [1500, 4000]
    for (let attempt = 1; attempt <= TOKEN_PLAN.length; attempt++) {
      const maxTokens = TOKEN_PLAN[attempt - 1]
      try {
        const brief = await chatCompletions(
          process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
          process.env.OPENAI_API_KEY,
          process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages,
          120_000,
          maxTokens
        )
        return { brief: stripDashes(brief), model: `${process.env.OPENAI_MODEL || 'gpt-4o-mini'} via OpenAI-compatible` }
      } catch (e) {
        const msg = (e as Error).message
        errors.push(`openai-compatible attempt ${attempt} (max_tokens=${maxTokens}): ${msg}`)
        if (attempt === TOKEN_PLAN.length) break
        await new Promise((r) => setTimeout(r, /429|rate.?limit/i.test(msg) ? 20_000 : 3_000))
      }
    }
  }

  // 3. Pollinations free tier, no key. Free tier allows ~1 reply per 45s per
  // IP. The only served model is a GPT-OSS 20B reasoning model ('openai-fast',
  // aliased as 'openai'), so most of max_tokens is burned on hidden reasoning:
  // low-effort reasoning plus a large completion budget is required, verified
  // live (reasoning_effort=low, max_tokens=16000 -> HTTP 200, finish=stop,
  // complete 4-section brief; without it, output_token_limit_exceeded at 3000
  // and finish=length truncation at 8000, both verified live). Retries escalate
  // the budget (an HTTP 200 can still be a truncated brief, which the caller
  // above rejects explicitly). Rate-limit waits respect the full 45s window
  // plus margin.
  const TOKEN_PLAN = [12000, 16000]
  for (let attempt = 1; attempt <= TOKEN_PLAN.length; attempt++) {
    const maxTokens = TOKEN_PLAN[attempt - 1]
    try {
      const brief = await chatCompletions(
        'https://text.pollinations.ai/openai',
        null,
        'openai',
        messages,
        120_000,
        maxTokens,
        { reasoning_effort: 'low' }
      )
      return { brief: stripDashes(brief), model: 'openai via Pollinations (free fallback)' }
    } catch (e) {
      const msg = (e as Error).message
      errors.push(`pollinations attempt ${attempt} (max_tokens=${maxTokens}): ${msg}`)
      if (attempt === TOKEN_PLAN.length) break
      const rateLimited = /402|FREE_LIMIT|45 second/i.test(msg)
      await new Promise((r) => setTimeout(r, rateLimited ? 50_000 : 5_000))
    }
  }

  throw new Error(`All direct brief providers failed: ${errors.join(' | ')}`)
}

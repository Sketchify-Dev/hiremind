import { z } from 'zod'
import { Agent, run } from '@openserv-labs/sdk'
import { provision, triggers } from '@openserv-labs/client'
import 'dotenv/config'

// Single-capability agent on purpose: with only one capability there is no
// routing ambiguity when a webhook task arrives. The platform runtime executes
// this run-less capability with its own LLM (SERV Reasoning), so no third-party
// LLM key is needed anywhere.

const agent = new Agent({
  systemPrompt: [
    'You are HireMind, a seller agent on the OpenServ network.',
    'You sell structured research briefs for a fixed on-chain price.',
    'Be concise, cite real sources, never invent URLs.'
  ].join(' ')
})

agent.addCapability({
  name: 'research_brief',
  description: [
    'Writes a structured research brief on the given topic.',
    'Always use exactly these markdown sections: ## Summary, ## Key findings,',
    '## Sources, ## Data provenance.',
    'Rules: 3 to 6 bullet findings, every factual claim tied to a source listed',
    'in Sources (name plus real URL, never invent links), and a one line',
    'provenance note stating your knowledge cutoff and that key claims should',
    'be verified. Output only the brief markdown, nothing else.'
  ].join(' '),
  inputSchema: z.object({
    topic: z.string().describe('The topic to research')
  })
})

async function main() {
  // Dashboard user key (NOT an agent key). Falls back to wallet SIWE if unset.
  const userApiKey =
    process.env.OPENSERV_USER_API_KEY || process.env.OPENSERV_API_KEY || undefined

  const result = await provision({
    ...(userApiKey ? { userApiKey } : {}),
    agent: {
      instance: agent,
      name: 'hiremind-seller',
      description: 'Sells structured research briefs with sources and provenance'
    },
    workflow: {
      name: 'HireMind Brief Machine',
      goal: 'Receive a paid research request topic via webhook, write a structured research brief with summary, key findings, real sources and a data provenance note, and return the brief markdown as the task output.',
      trigger: triggers.webhook({
        waitForCompletion: true,
        timeout: 600,
        input: {
          topic: {
            type: 'string',
            title: 'Brief topic',
            description: 'The topic to research for the paid brief'
          }
        }
      }),
      task: { description: 'Write the paid research brief on the given topic' }
    }
  })

  console.log(`agentId=${result.agentId} workflowId=${result.workflowId}`)
  console.log(`webhook=https://api.openserv.ai/webhooks/trigger/${result.triggerToken}`)
  console.log('Copy the webhook URL into the web app as OPENSERV_WEBHOOK_URL (or leave it: the API reads agent/.openserv.json automatically).')

  await run(agent)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

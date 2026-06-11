// Scout LLM proxy — Claude API via Edge Function (the key never reaches the
// client). Structured output only: the model fills a JSON schema; free text
// never writes to the database. The kid loop never calls this.
// Rate-limited per account: the app is free and public — this must not
// become an open faucet.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const MODEL = 'claude-haiku-4-5-20251001'
const OPENROUTER_MODEL = 'anthropic/claude-haiku-4.5'
const MAX_SESSIONS_PER_DAY = 10

const SYSTEM = `You are the Scout, the setup assistant inside StarqueZZ — a free, kid-run habit app where star tokens buy shared family adventures, never toys or money.

Non-negotiable principles you must never violate in any suggestion:
1. The adventure always happens — stars decide WHICH, never WHETHER. Never imply a child earns time with a parent.
2. Reward consistency, not labor. No per-task wages, no money, no toy line items.
3. Suggestions must respect the souvenir rule: objects only as part of a shared outing, chosen together, creating future activity. The line item is always the experience.
4. Habit sets follow balance heuristics: 2 core habits for age 5 and under, 3 for 6-7, at most 4 for 8+. Spread categories (body/mind/space/heart) — never all-space, never zero-body. Prefer entries a child this age can do unaided.
5. Adventures: propose a tiered menu (tier 1 = 20 stars, tier 2 = 40, tier 3 = 80) plus exactly one tier 0 free fallback. At-home zero-cost ideas are first-class.

You ask nothing back; you emit proposals via the tool. Each proposal carries a short "why" the parent learns from (research-informed, plainly worded, no citation theater). Use the parent's own words about the kid. Icons must come from the provided icon list.`

const HABIT_TOOL = {
  name: 'propose_habits',
  description: 'Propose a balanced habit set for this child',
  input_schema: {
    type: 'object',
    properties: {
      habits: {
        type: 'array',
        maxItems: 7,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', maxLength: 60 },
            icon: {
              type: 'string',
              enum: ['tooth', 'shirt', 'bowl', 'book', 'backpack', 'drop', 'water', 'ball', 'bed', 'bed-made', 'music', 'pencil', 'bulb', 'paint', 'blocks', 'fork', 'plant', 'heart', 'sparkle-heart', 'hands', 'paw', 'dice', 'check'],
            },
            category: { type: 'string', enum: ['body', 'mind', 'space', 'heart'] },
            time_block: { type: 'string', enum: ['morning', 'afternoon', 'evening'] },
            is_core: { type: 'boolean' },
            why: { type: 'string', maxLength: 240 },
          },
          required: ['name', 'icon', 'category', 'time_block', 'is_core', 'why'],
        },
      },
    },
    required: ['habits'],
  },
}

const ADV_TOOL = {
  name: 'propose_adventures',
  description: 'Propose a tiered adventure menu for this family',
  input_schema: {
    type: 'object',
    properties: {
      adventures: {
        type: 'array',
        maxItems: 8,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', maxLength: 60 },
            illustration: {
              type: 'string',
              enum: ['tent', 'flashlight', 'fort', 'pancake', 'popcorn', 'cupcake', 'disco', 'plane', 'flask', 'book-night', 'basket', 'chef', 'stars', 'swing', 'map', 'library', 'bike', 'bookshop', 'swim', 'leaf', 'sunrise', 'market', 'noodles', 'museum', 'train', 'scroll', 'campfire', 'easel'],
            },
            tier: { type: 'integer', minimum: 0, maximum: 3 },
            why: { type: 'string', maxLength: 240 },
          },
          required: ['name', 'illustration', 'tier', 'why'],
        },
      },
    },
    required: ['adventures'],
  },
}

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const headers = { ...cors, 'Content-Type': 'application/json' }
  const fail = (status: number, error: string) =>
    new Response(JSON.stringify({ error }), { status, headers })

  try {
    // direct Anthropic key, or an OpenRouter key (same Claude model behind it)
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!anthropicKey && !openrouterKey) return fail(503, 'scout_unavailable')

    // authenticated parents only
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    )
    const { data: userData, error: userErr } = await supa.auth.getUser()
    if (userErr || !userData.user) return fail(401, 'not_authenticated')

    // rate limit per account per day
    const service = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const dayAgo = new Date(Date.now() - 86400_000).toISOString()
    const { count } = await service
      .from('scout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', userData.user.id)
      .gte('created_at', dayAgo)
    if ((count ?? 0) >= MAX_SESSIONS_PER_DAY) return fail(429, 'rate_limited')
    await service.from('scout_sessions').insert({ parent_id: userData.user.id })

    const { kind, profile, conversation } = await req.json()
    if (kind !== 'habits' && kind !== 'adventures') return fail(400, 'bad_kind')

    // privacy: send the minimum — age, interests, the parent's own words.
    const tool = kind === 'habits' ? HABIT_TOOL : ADV_TOOL
    const convo = (Array.isArray(conversation) ? conversation : [])
      .slice(-8)
      .map((m: { who: string; text: string }) => `${m.who === 'me' ? 'Parent' : 'Scout'}: ${String(m.text).slice(0, 600)}`)
      .join('\n')

    const userPrompt = `Child profile: age ${Number(profile?.age) || 'unknown'}${profile?.name ? `, called ${String(profile.name).slice(0, 30)}` : ''}${profile?.interests ? `, into: ${String(profile.interests).slice(0, 200)}` : ''}.\n\nConversation so far:\n${convo}\n\nPropose ${kind} now.`

    let proposal: unknown
    if (anthropicKey) {
      // native Anthropic API, structured output via tool use
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          system: SYSTEM,
          tools: [tool],
          tool_choice: { type: 'tool', name: tool.name },
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })
      if (!res.ok) return fail(502, 'llm_error')
      const body = await res.json()
      const toolUse = body.content?.find((c: { type: string }) => c.type === 'tool_use')
      proposal = toolUse?.input
    } else {
      // OpenRouter (OpenAI-compatible), same Claude model behind it
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          max_tokens: 1500,
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: userPrompt },
          ],
          tools: [{ type: 'function', function: { name: tool.name, description: tool.description, parameters: tool.input_schema } }],
          tool_choice: { type: 'function', function: { name: tool.name } },
        }),
      })
      if (!res.ok) return fail(502, 'llm_error')
      const body = await res.json()
      const args = body.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
      try {
        proposal = typeof args === 'string' ? JSON.parse(args) : args
      } catch {
        proposal = undefined
      }
    }

    if (!proposal) return fail(502, 'no_proposal')
    return new Response(JSON.stringify(proposal), { headers })
  } catch {
    return fail(500, 'scout_error')
  }
})

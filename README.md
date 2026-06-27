# Starquezz ✦

**Your kid runs their own routine. Stars buy adventures together — never toys
or money. Free for every family, forever.**

Starquezz is a kid-run habit app born from one family (Zen, 8, and Zia, 5 —
the founding users) and published for any family. It solves three problems at
once:

1. **The kid's problem** — "what do I need to do?" asked all day. The board
   answers instead, so the routine becomes *theirs*.
2. **The parent's design problem** — which habits matter at this age, how many
   is too many? Starquezz helps you *design and evolve* a balanced set:
   research-informed suggestions, balance nudges, and habits that graduate to
   the Hall of Fame when mastered.
3. **The parent's ideation problem** — the reward catalog is a pre-decided
   menu of shared experiences (bookshop trip, treasure hunt, pancake morning),
   priced in stars. Stars decide *which* adventure — never *whether*.

This is not a chore-wage app. No money, no toys, no approval queues, no ads,
no subscriptions. Ever.

## Stack

React 19 + Vite + TypeScript + Tailwind v4 (Cosmic design system) · Supabase
(Postgres + RLS + atomic RPCs, Auth, Edge Function for the Scout LLM proxy) ·
PWA via vite-plugin-pwa. On desktop the app renders in a phone frame; on a
phone it flows naturally and installs to the home screen.

## Run it locally

```bash
pnpm install
supabase start          # local stack (Docker); applies supabase/migrations
supabase status -o env  # copy API_URL + ANON_KEY into .env.local:
#   VITE_SUPABASE_URL=...
#   VITE_SUPABASE_ANON_KEY=...
pnpm dev                # http://localhost:5179
```

## Test it

```bash
pnpm test:integration   # star economy + RLS isolation vs local Postgres
pnpm test:e2e           # Playwright full journey, desktop + mobile
pnpm build              # type-check + production PWA build
```

The star economy (check-off awards, bonus locking, streaks, undo windows,
redemptions, perfect weeks, dream stars, graduation) lives in SQL RPCs — it is
the trust contract with the kid, and it is fully integration-tested. No LLM
ever computes stars; the Scout only drafts schema-valid suggestions a parent
accepts, edits, or skips.

## Repo map

```
docs/AGENT_BRIEF.md    product source of truth
docs/DESIGN_BRIEF.md   design brief (Cosmic direction)
docs/plans/            implementation plan
supabase/migrations/   schema · RLS · RPCs · curated libraries
supabase/functions/    scout (Claude proxy, structured output, rate-limited)
src/                   the app (kid world · parent world · first-run)
tests/                 integration (vitest) + e2e (playwright)
STATUS.md              current state, kept honest
```

---

*Built with ❤️ for Zen & Zia by Synetica — published free for every family.*

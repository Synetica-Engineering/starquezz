# STATUS — StarqueZZ v2

> One status file, updated in the same commit as the feature (AGENT_BRIEF §8.5).
> Last update: 2026-06-12

## Where things stand

**All six build phases are implemented and validated.** The app runs end-to-end
against a local Supabase stack: a stranger parent can sign up, set up a child
via the Scout conversation (or the manual path), hand the device over, and the
kid runs the daily loop unaided — check-offs, star-days, streaks, the Sunday
ceremony, sealed adventure tickets — while the parent gets the weekly digest.

| Phase (AGENT_BRIEF §9) | State |
|---|---|
| 1 · Foundation (schema, RLS, RPCs, auth, wizard) | ✅ done — 40 integration tests |
| 2 · Kid loop (board, check-off FX, jar, streaks) | ✅ done — E2E covered |
| 3 · Adventure loop (menu, redemption, ceremony) | ✅ done — E2E covered |
| 4 · Parent surface (digest, editors, libraries, dream, graduation) | ✅ done |
| 5 · Scout (edge function, chat wizard, draft cards, fallback) | ✅ done — LLM path needs `ANTHROPIC_API_KEY` on the edge function; library-grounded fallback works without it |
| 6 · Polish (PWA, reduced motion, multi-child, secret codes) | ✅ done |

## Verification

- `pnpm test:integration` — 40/40 green: star economy (awards, bonus lock,
  streaks, undo windows, redemption, perfect weeks, dream stars, graduation),
  RLS family-isolation proofs, PIN cooldown, libraries.
- `pnpm test:e2e` — 6/6 green (desktop phone-frame + mobile natural flow):
  full journey, Scout wizard path, PWA wiring.
- Manual browser pass of every screen in both registers, both viewports.

## Architecture notes & deliberate deviations

- **PIN/bcrypt:** AGENT_BRIEF §8.3 suggested an Edge Function; implemented as
  `pgcrypto crypt(gen_salt('bf'))` inside SECURITY DEFINER RPCs with
  exponential cooldown — same property (hash never client-side), no Deno
  dependency for dev/test. The Scout LLM proxy *is* an Edge Function.
- **Ceremony any day:** `finalize_week` finalizes the most recently *finished*
  week (idempotent), so the ritual works on the couch whenever it happens;
  the Sunday framing is copy, the integrity is SQL.
- **Kid-side auth:** kid surfaces run under the parent's Supabase session on
  the family device (per brief: avatar tap is the login). Family isolation is
  parent-scoped RLS; per-kid codes are an ownership ritual, not security.
- **Streak display** is mirrored client-side for the flame; every award is
  computed only in SQL.

## Guest mode (no signup wall)

The app starts with **"Start now — no account needed"**: a Supabase anonymous
session backs the family from the first tap — same RLS, same RPCs, no separate
local store and no sync problem. "Save your family" (digest banner + Settings)
attaches email+password to the *same* account via `auth.updateUser()`; nothing
migrates. Guest sign-out is guarded with a loud "your family isn't saved"
warning. Covered by `tests/integration/anonymous.test.ts` +
`tests/e2e/guest-claim.spec.ts`.

## To deploy (not yet done)

1. `supabase link` + `supabase db push` to a cloud project; deploy
   `supabase/functions/scout` with `ANTHROPIC_API_KEY` (or
   `OPENROUTER_API_KEY`) secret.
2. Auth settings on the cloud project: enable **anonymous sign-ins** AND
   captcha (anonymous endpoints are spammable); add a cleanup job for
   anonymous users with no children after ~30 days.
3. Vercel: build `pnpm build`, output `dist/`, env `VITE_SUPABASE_URL` +
   `VITE_SUPABASE_ANON_KEY`.
4. Smoke-test guest → claim → sign-in + RLS on the cloud project before
   sharing the URL.

## Known gaps / next

- Sunday ceremony reminder is a stored preference only — no push pipeline
  (deliberate: at most one notification, ever; needs a web-push decision).
- Scout conversations are ephemeral (per brief) but `focus_notes` accumulation
  from chat answers is minimal (interests only at child creation).
- Adventure Library ships with 30 entries; illustrations use the icon-on-
  gradient recipe rather than bespoke art (DESIGN_BRIEF §6.7's scalable recipe).

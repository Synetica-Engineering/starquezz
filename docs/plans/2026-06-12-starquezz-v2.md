# Starquezz v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Starquezz v2 — a free, multi-tenant, kid-run habit-autonomy PWA with experience rewards — end-to-end from `docs/AGENT_BRIEF.md` (product law) and `docs/DESIGN_BRIEF.md` (Cosmic visual direction), validated with unit, integration, and browser E2E tests.

**Architecture:** React 19 + Vite + TypeScript SPA styled with Tailwind v4 + the Cosmic design system (ported from `docs/Starquezz Wireframe/cosmic.css`). All data and auth in Supabase (local stack for dev/test): Postgres schema with parent-scoped RLS, and **every star mutation as an atomic SECURITY DEFINER RPC** (the v1 lesson). Desktop renders the app inside a phone device frame (like cloudloyalty / central-membership-app's DeviceStage); on real phones it flows naturally full-viewport. PWA via vite-plugin-pwa.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind CSS v4, @supabase/supabase-js, Supabase CLI (local Postgres+Auth), pgcrypto bcrypt for PINs, Vitest (+ integration tests against local Supabase), Playwright (E2E), vite-plugin-pwa, @fontsource (Fredoka, Mulish).

**Conflict rule:** where wireframe and AGENT_BRIEF disagree, AGENT_BRIEF wins (e.g. manifesto copy must cover all three problems — the wireframe's morning-only manifesto is replaced).

**Documented deviation:** AGENT_BRIEF §8.3 says "PIN hashing in an Edge Function (bcrypt)". We keep the security property (bcrypt, hash never leaves server) but implement it as Postgres `pgcrypto crypt(gen_salt('bf'))` inside SECURITY DEFINER RPCs with attempt-cooldown — same guarantee, no Deno runtime needed for dev/test E2E. The Scout LLM proxy remains an Edge Function (`supabase/functions/scout`) with a deterministic no-LLM seed fallback in the app.

---

## File structure

```
starquezz/
├─ docs/                         # briefs (existing), STATUS.md (new, kept current)
├─ supabase/
│  ├─ config.toml                # local stack; auth email auto-confirm ON
│  ├─ migrations/
│  │  ├─ 0001_schema.sql         # tables, enums, indexes, partial unique (one active dream)
│  │  ├─ 0002_rls.sql            # RLS policies, parent-scoped everything
│  │  ├─ 0003_rpcs.sql           # star economy RPCs + streak fns + PIN fns
│  │  └─ 0004_libraries.sql      # global habit_library + library_activities content
│  ├─ seed.sql                   # (dev only) nothing destructive
│  └─ functions/scout/index.ts   # DeepSeek V4 Flash proxy w/ structured output + rate limit
├─ tests/
│  ├─ integration/economy.test.ts    # RPCs vs local supabase (service role)
│  ├─ integration/rls.test.ts        # family isolation proofs
│  └─ e2e/full-journey.spec.ts       # Playwright: signup→wizard→kid loop→ceremony→digest
├─ src/
│  ├─ main.tsx  App.tsx  router.tsx
│  ├─ styles/cosmic.css          # ported + extended design system (tokens, components)
│  ├─ lib/ supabase.ts dates.ts types.ts economy.ts(display helpers) sound.ts
│  ├─ state/ session.tsx family.tsx   # auth session + family data provider
│  ├─ shell/DeviceStage.tsx      # phone frame on desktop, native flow on mobile
│  ├─ components/ (Zee, SqzIcon, StarToken, Constellation, HabitCard, AdventureCard,
│  │   Jar, WeekStrip, Keypad, StarFx, DraftCard, Pill, Btn …)
│  └─ screens/
│     ├─ firstrun/ Manifesto Onboarding SignUp Wizard Handoff
│     ├─ kid/ Splash AvatarSelect SecretCode Board StarJar AdventureMenu Ceremony
│     └─ parent/ PinGate Digest HabitEditor AdventureEditor HabitLibrary
│        AdventureLibrary Scout DreamEditor Settings
├─ public/ icons (PWA), favicon
├─ index.html  vite.config.ts  tailwind/postcss config  package.json
└─ playwright.config.ts  vitest.config.ts
```

## Data model (locked)

Enums: `time_block: morning|afternoon|evening` · `habit_category: body|mind|space|heart` · `habit_status: active|graduated` · `star_reason: habit_checkoff|bonus_habit|streak_3|perfect_week|redemption|graduation_bonus|undo|manual_adjust` · `adventure_status: planned|done|skipped` · `dream_status: active|achieved|retired`.

Tables per AGENT_BRIEF §7 sketch + §4c/4d additions, with: `parents.id = auth.users.id`; `completions` unique `(habit_id, completed_on)`; `dreams` partial unique index `(child_id) where status='active'`; `active_days int[]` of ISO dow 1–7; append-only `star_events`; `parent_edits` audit table (feeds digest tamper-evidence); `pin_attempts` for exponential cooldown; `scout_sessions` for rate limiting.

## RPC contracts (all SECURITY DEFINER, auth.uid()-scoped, atomic)

| RPC | Behavior |
|---|---|
| `complete_habit(p_habit_id, p_on date)` | verify ownership+active+scheduled day; insert completion; +1 core-set star_event only when all scheduled cores are done / +1 bonus star_event per bonus habit (bonus only if all cores done — else error `cores_incomplete`); update cached balance; if this completes all cores → star-day; if streak hits exactly 3 → +3 streak_3 event; returns json `{awarded, star_day, streak, all_done}` |
| `undo_completion(p_habit_id, p_on date)` | only within 5 min of completion `created_at`; deletes completion + compensating `undo` star_events (also reverses streak_3 if it falls) |
| `redeem_adventure(p_adventure_id, p_child_id, p_planned_for date)` | balance check inside txn; `redemption` event (negative); insert planned_adventures |
| `finalize_week(p_child_id, p_week_start date)` | idempotent; computes perfect week (star-day on every active day); +10 `perfect_week`; lights one dream star on active dream (and marks dream achieved when full); returns recap json |
| `graduate_habit(p_habit_id, p_bonus int default 10)` | status→graduated, graduated_at, +`graduation_bonus` event, logs parent_edit |
| `set_parent_pin(p_pin)` / `verify_parent_pin(p_pin)` | bcrypt via pgcrypto; cooldown 2^n seconds after failures; failures logged to parent_edits |
| `set_child_code(p_child_id, p_code or null)` / `verify_child_code(p_child_id, p_code)` | bcrypt; null clears |
| `compute_streak(p_child_id, p_as_of date)` | consecutive star-days walking back over **active days only** (off-days skipped, don't break) |
| `adjust_stars(p_child_id, p_delta, p_note)` | parent manual correction; `manual_adjust`; logged to parent_edits |

Star-day = every active core habit scheduled that ISO-dow has a completion. Perfect week adapts to each child's schedule (AGENT_BRIEF §4).

## Phases (= build order, AGENT_BRIEF §9)

### Phase 1 — Foundation
- [x] Scaffold Vite+React+TS, Tailwind v4, fonts, cosmic.css port, DeviceStage shell
- [x] `supabase init` + config (auto-confirm email), migrations 0001–0004
- [x] Integration test harness (vitest, service-role client, per-test family factory)
- [x] TDD the economy RPCs: completion awards, bonus-lock rule, undo window, streak & streak_3, redemption (incl. insufficient funds), finalize_week perfect/imperfect, dream lighting, graduation
- [x] RLS isolation tests (parent A cannot read/write family B through every table)
- [x] Auth: signup/login, PIN set/verify with cooldown
- [x] Setup wizard (manual path): add child → seed habits → seed adventures → handoff

### Phase 2 — Kid loop
- [x] Splash (cold/resume variants) → AvatarSelect (tap = login) → optional SecretCode keypad
- [x] Routine Board: current time block default, swipe/arrows between blocks, habit cards (now/done/locked/unlockable states), check-off star-flight FX, 5-min undo, Zee scripted lines, daily-win celebration, bonus unlock
- [x] Star Jar: physical jar, week strip, streak flame, Big Dream constellation + galaxy, Hall of Fame shelf

### Phase 3 — Adventure loop
- [x] Adventure Menu (tiers, glow when affordable, "X more ✦", warm 0✦ fallback)
- [x] Redemption + planned adventure ticket on board
- [x] Sunday Star Ceremony: recap count-up → streak/perfect reveal (+dream star beat) → pick → sealed ticket

### Phase 4 — Parent surface
- [x] PIN gate; Weekly Digest (per-child grid, stars, streak, planned adventure + one-tap done, parent_edits footprints)
- [x] Habit Editor (CRUD, blocks, core/bonus, icons, archive, balance nudges, mark-as-mastered → graduation celebration) + Habit Library browser (category/age filter, "why it matters" first)
- [x] Adventure Editor (CRUD, tiers, venue note, souvenir-rule reminder) + Adventure Library browser (filters; copy-into-family)
- [x] Dream editor (single active slot enforced), manual star adjust
- [x] Settings: kid secret-code toggle (only visible with 2+ children), ceremony reminder pref, sound mute

### Phase 5 — Scout
- [x] Edge Function `scout`: DeepSeek V4 Flash structured-output proxy, schema-validated draft habits/adventures, rate limit; never computes stars
- [x] Wizard chat UI with draft cards (accept/edit/skip); deterministic seed fallback path ("skip — I'll do it myself") so the app fully works with no LLM key
- [x] Re-run triggers from parent side (new child, graduation slot, menu refresh)

### Phase 6 — Polish + ship-readiness
- [x] PWA: manifest, icons, service worker, offline tolerance for kid view, install prompt
- [x] Reduced-motion variants for all 8 signature moments; AA contrast pass; ≥64px kid touch targets
- [x] Multi-child paths verified (Zia flow), second-child Scout conversation
- [x] STATUS.md kept current; README

### Validation gate (must all pass before "done")
- [x] `pnpm test` — unit + integration green
- [x] `pnpm test:e2e` — Playwright full journey green (desktop frame + mobile viewport)
- [x] Manual visual pass via browser screenshots of every screen, both registers
- [x] Lighthouse-style PWA checks: installable manifest, SW registered, offline board loads

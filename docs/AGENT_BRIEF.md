# StarqueZZ v2 — Agent Build Brief

> **Purpose of this document:** complete, self-contained context for an AI agent (or developer) building StarqueZZ v2 from scratch. Read this before writing any code. Every product decision an agent would otherwise have to guess is stated here. When in doubt, optimize for the kid's autonomy and the parent's near-zero daily involvement.

---

## 1. What this is

**StarqueZZ is a published, free-for-everyone habit-autonomy app, designed family-first.** It was born from one family — Zen and Zia are the founding users and every design decision is tested against them — but it is a **public product with open signup** that any parent can use, free, forever.

It solves three problems at once:

1. **The kid's problem:** kids ask their parent "what do I need to do?" several times a day (Zen, age 8, is patient zero). The app answers that question instead, so the routine becomes *theirs*, not something administered to them.
2. **The parent's design problem (the core value proposition):** designing a *well-balanced* habit set tailored to a specific kid is genuinely hard — which habits matter at this age, what does child-development research actually say, how many is too many, and what to do when one is mastered (piano is automatic now — shuffle it out, focus on handwriting). StarqueZZ helps the parent **design and evolve** the habit set, not just track it: good questions that deepen the parent's understanding of their kid, research-informed suggestions when the parent is unsure, and a habit set that lives — habits graduate when mastered and new ones take their place.
3. **The parent's ideation problem:** parents don't want to invent bonding activities on the fly. The reward catalog is a **pre-decided menu of shared experiences** (bookshop trip, playground, treasure hunt) — a bonding backlog with star prices on it.

**This three-problem framing is canonical and must reflect across the app.** The manifesto beats, the onboarding slides (one problem per slide), the README, store copy, and any marketing surface all map to these three problems — in any order, but never dropping one. An app surface that tells only the morning-routine story, or only the rewards story, is telling a third of the truth.

This is **not** a chore-wage app. Stars never buy toys or money. Stars buy *agency over shared time with a parent*.

### Identity card

| Field | Value |
|---|---|
| Product | StarqueZZ v2 — gamified habit routine + experience rewards |
| Audience | Any family with kids roughly 5–9; open public signup |
| Founding users | Zen, 8 (reads simple words, loves counting things) and Zia, 5 (joins later) — the reference personas every screen is designed against |
| Founding parent | Ganis — the reference admin; wants ≤ 2 minutes of app time per week |
| Business model | None. **Free forever, no monetization, ever.** Published as a public PWA |
| Predecessor | StarqueZZ v1 (this repo) — working core loop, wrong reward framing |

**Design rule of thumb:** build every feature as if Zen is the only kid and Ganis the only parent — that keeps it sharp — but implement every data path as multi-tenant (it already is, via parent-scoped RLS). Personal in design, public in engineering.

---

## 2. Design principles (non-negotiable)

These four rules resolve real behavioral-science risks. Do not trade them away for features.

1. **The adventure always happens — stars decide WHICH, never WHETHER.**
   Parental time must never be contingent on performance. A bad week costs Zen the *premium pick*, not the outing. Never render copy implying "earn time with Dad."
2. **Reward consistency, not labor.**
   Per-task payouts trigger the overjustification effect (extrinsic rewards eroding intrinsic motivation). Streaks are the multiplier; the daily star is small and ritual-like, not a wage.
3. **The kid runs the loop; the parent is not in it.**
   No approval queue. Completions are trusted and auto-approved. The parent gets a weekly digest and can quietly correct, but the daily loop has zero parent touchpoints.
4. **The app answers "what now?", not "what today?"**
   Habits live in time blocks (morning / after school / evening). The default kid view shows only the current block — minimal reading, big targets, instant gratification.

---

## 3. The core loop

![Core loop diagram](assets/core-loop.svg)

A week in the life:

- **Daily:** Zen opens his board, sees the current time block, checks off habits. **Every check-off pays a star token instantly** (the star-flight moment). Completing all core habits lights the day as a **star-day** with a bigger celebration; bonus habits unlock only after cores are done — no cherry-picking easy extras.
- **Streaks:** consecutive star-days build a streak. Milestones pay bonus tokens, and a perfect week lights a constellation star (see economy below). Breaking a streak resets the counter but **never deducts** earned tokens.
- **Sunday Star Ceremony:** a dedicated full-screen mode. Count the week's stars together (animated), review the streak, then Zen picks next week's adventure from the menu. Picking creates a *planned adventure* — the commitment device for the parent.
- **The adventure happens.** Afterward the parent marks it done (one tap from the digest). The memory is the payoff; the loop restarts.

---

## 4. Star economy — exact rules

A **three-layer economy** (validated in the wireframe prototype). Each layer has its own unit, its own visual, and they never convert into each other:

| Layer | Unit | Earned by | Spent on / leads to |
|---|---|---|---|
| **Tokens** ✦ | spendable stars | every habit check-off, instantly | adventures (the Star Store of experiences) |
| **Star-days** | lit days on the week strip | all core habits done on an active day | the streak; the ceremony recap |
| **Constellation** | dream stars | a perfect week | the Big Dream (§4b); never purchasable with tokens |

**Token rules:**

| Rule | Value | Rationale |
|---|---|---|
| Each core habit completed | **+1 ✦, instantly** | The star-flight moment — per-check-off gratification is signature moment #1; don't starve it |
| Each bonus habit (unlocked only after all cores) | **+2 ✦** | Extras pay more but only count when the foundation is done — no cherry-picking |
| 3 consecutive star-days | **+3 ✦** | Early momentum hook |
| Perfect week | **+10 ✦** and lights a constellation star | The big weekly payoff, revealed at the ceremony |
| Missed day | Streak resets to 0 | Tokens already earned are **never deducted** |
| Token deduction | Only via adventure redemption | Atomic operation (see §8 lessons) |

**Star-day and perfect-week definitions:** a star-day = all core habits completed on an **active day** (habits have `active_days`; a weekend with no cores scheduled doesn't break anything). A perfect week = a star-day on *every* active day of that week — so "perfect" adapts to each family's schedule rather than demanding 7/7 mechanically.

**Adventure menu tiers** (parent-editable; ship with these seeds):

| Tier | Cost | Examples |
|---|---|---|
| 1 — Anytime picks | 20 ✦ | Playground with Mom & Dad · library run · bike ride together |
| 2 — Special picks | 40 ✦ | Bookshop trip (pick one book) · swimming · "Zen picks Friday dinner" |
| 3 — Premium picks | 80 ✦ | Treasure hunt Dad designs · day trip · museum + lunch out |
| Fallback (always available, 0 ✦) | free | The guaranteed weekly outing — parent picks. Exists so a zero-token week still ends in connection |

Keep the math kid-checkable: with 3 cores a day, a typical good week earns ~30–40 ✦ (21 core + 10 perfect-week + a few bonuses). Tier 1 ≈ a few days. Tier 2 ≈ one good week. Tier 3 ≈ two. Tune with real data.

**The souvenir rule.** Adventures may include an object (a book, art supplies, a board game) without breaking principle 2, as long as all three hold: (1) it is acquired *together during the outing*, never delivered or handed over at home; (2) the kid chooses it within parent-set bounds (e.g. one book, price cap); (3) it creates future activity — reading, making, playing together — rather than pure possession. Objects that fail any test (money, random toys, screen-time credits) are wages, not souvenirs, and stay out. The reward line item is always the experience ("Bookshop trip — pick one book"), never the object ("a book").

### 4b. The Big Dream track (long-horizon wants)

Kids sometimes aim at something far beyond the star economy — a game console, a real telescope, a bike. **Never price these in stars.** An honest star price is 50–100 weeks away (demotivating wallpaper); a reachable price inflates stars and makes every adventure compete with the dream, killing the redemption loop. Instead, big wants get a separate, parallel track:

| Rule | Design |
|---|---|
| **One dream slot per kid** | Parent-created, rare. Empty most of the time — an empty slot is healthy, not a bug |
| **Fueled by perfect weeks, not spendable stars** | Each perfect week **lights one star in the dream's constellation** — when the constellation is complete, the dream comes true. Spendable star tokens cannot buy dream stars — so the adventure economy is untouched and hoarding doesn't help. (Visual note: constellation stars and spendable star tokens must be visually distinct so the two currencies never blur for the kid) |
| **Pledge framing, never a price** | The dream is a *parent pledge* anchored to an event: "10 perfect weeks before your birthday and the PS5 comes home." It converts a gift the family might give anyway into an *earned* gift |
| **Additive only** | The dream never gates adventures, ceremonies, or time together (principle 1). A bad week simply doesn't light a star, nothing else |
| **Finite, with gaps** | When a dream lands, expect a motivation dip — the core loop must stand on its own. Leave the slot empty for a while before the next dream |

**UI surfaces:** the dream constellation lives on the Star Jar screen; a new star lights during the ceremony's streak reveal when the week was perfect. Completed dreams join the kid's **galaxy** — a small constellation of dreams come true. Parent creates/edits the dream from the parent surface, with the pledge text and star count explicit.

**Anti-pattern warning for the agent:** if the dream slot is being refilled constantly, this has become a wage system with extra steps. One dream at a time, parent-initiated, with real gaps — enforce the single slot in schema and UI, not just in copy.

### 4c. The Adventure Library (curated play ideas)

The parent's bottleneck is recall and confidence, not abstract ideas. The app ships with a **curated, global, read-only library of play activities** — each one runnable by any parent after reading three sentences.

**Anatomy of a library entry:**

| Field | Example ("Treasure Hunt in the Dark") |
|---|---|
| Name + illustration | Treasure Hunt in the Dark 🔦 |
| **Explainer (the product)** | "Hide 5 small things around the house. Lights off. Give the kid a flashlight and a list. Hunt." 2–3 sentences, max — confidence, not a manual |
| Prep | Flashlight, 5 objects |
| Duration / energy | 30 min · indoor · rainy-day safe |
| Age fit | 5–9 |
| Cost | Free |
| Location type | Home (others: "any playground", "a bookshop", "a park") |
| Suggested tier | 1 (or fallback) |

**Rules:**

- The library is **global content, curated by us** — not user-generated. Adding an entry to a family's menu *copies* it into their `adventures` (with a `library_id` back-reference) so families can rename, re-tier, and attach their own real venue. Location types stay generic; **no venue/maps database, ever** — the parent fills in "which playground" once.
- **The library grounds the Scout.** Suggestion flow: select + personalize from library entries first; generate novel ideas only when the conversation warrants. This keeps suggestions kid-tested instead of plausible-sounding.
- At-home, zero-cost entries are first-class citizens — they feed Tier 1 and the fallback tier, making low-star weeks and rainy days work.
- Ship with **~30 curated entries** (seeded at deploy; drafted with LLM help, curated by hand, tested on the founding kids where possible).

```
library_activities (id, name, illustration, explainer, prep, duration_min,
              energy: indoor|outdoor|either, age_min, age_max,
              cost: free|cheap|spendy, location_type, suggested_tier)
              -- global, read-only to users; no parent_id
adventures   gains: library_id (nullable), venue_note (parent's own place)
```

### 4d. The Habit Library & the living habit set

Tracking habits is the commodity; **designing them is the value.** Most parents can't answer: which habits matter at 5 vs 8, how many a kid can sustain, whether the set is balanced — and a tracker happily lets them assign six chores and zero growth habits. StarqueZZ takes a position.

**The Habit Library** — curated, global, read-only (same model as §4c): research-informed habit entries a confused parent can browse and trust.

| Field | Example ("10 minutes of reading") |
|---|---|
| Name + icon, kid-facing label | "Reading time 📖" |
| Category | One of: **Body** (movement, hygiene, sleep) · **Mind** (reading, practice, curiosity) · **Space** (tidying, belongings, contribution) · **Heart** (kindness, gratitude, sharing) |
| Age fit | 5–10 |
| **Why it matters** | 1–2 plain sentences on what child-development research says — honest and lightly worded ("daily reading is one of the strongest predictors of later literacy"), never citation theater. Keep an internal sources note per entry; don't render academic claims in the UI |
| Suggested time block | Evening |
| Mastery signal | "Does it without being reminded for ~3 weeks" |

**Balance heuristics (the Scout enforces these, the editor nudges toward them):**

- 2–4 core habits maximum — age-scaled (a 5-year-old: 2 cores; an 8-year-old: 3–4).
- Spread across categories: never all-Space (that's a chore list wearing a costume), never zero-Body.
- New habits enter **one at a time** — habit-formation research is unambiguous that stacking several new behaviors at once fails.

**Mastery & graduation (the "shuffle"):** the goal of a habit is automaticity — tracking a mastered habit forever is a design smell. When a habit hits its mastery signal (parent confirms, or the app suggests it after sustained high completion — e.g. ~8 weeks of consistent data):

- The habit **graduates**: a one-time star bonus + a big celebration, and it moves to the kid's **Hall of Fame** (a trophy shelf — "this is part of who you are now").
- Its slot opens, and the Scout proposes what's next based on the parent's current focus ("he's mastered piano practice — you mentioned handwriting").
- Frame matters: graduation is *leveling up*, never losing a star source. The one-time bonus and trophy make it a win; copy must never read as demotion.

```
habit_library (id, name, icon, kid_label, category: body|mind|space|heart,
              age_min, age_max, why_it_matters, sources_note (internal),
              suggested_block, mastery_signal)
              -- global, read-only to users
habits        gains: library_id (nullable), category, status: active|graduated,
              graduated_at
star_events   reason enum gains: graduation_bonus
```

---

## 5. Screens

**Zee, the mascot (canonical).** A little star sprite — the "ZZ" in Starque**ZZ** is his snooze; he wakes when you tap. Zee narrates the kid side (board encouragements, celebrations) and fronts the Scout on the parent side, giving the whole app one face. **Hard rule: Zee's lines are scripted and authored, never LLM-generated, and the kid never chats with him** — he reacts to the kid's actions, he doesn't converse. This is a UI character, not an AI companion; the "no LLM in the kid loop" non-goal stands.

### Kid side (Zen's world — playful, loud, almost no reading)

| Screen | Content | Notes |
|---|---|---|
| **Routine Board** (home) | Current time block's habits as big tappable cards with icons; tap = done + confetti/sound. Star jar and streak flame always visible | Default to current block by local time; other blocks reachable by swipe. Done-state must be reversible for 5 minutes (mis-taps) |
| **Star Jar** | Total stars, this week's stars, streak history as a simple calendar of star-days; Big Dream constellation (§4b) when a dream is active, plus the galaxy of completed dreams; **Hall of Fame** — graduated habits (§4d) | Counting things is the fun — make the jar feel physical. The Hall of Fame is identity made visible: "things I just *do* now" |
| **Adventure Menu** | Tier cards with illustrations and star prices; affordable ones glow; locked ones show "X more stars" | Browsing is motivation — never hide unaffordable items |
| **Star Ceremony** | Guided Sunday flow: week recap animation → streak result → pick adventure → "it's planned!" splash | Designed to be done on the couch together |

### Parent side (Ganis's world — dense, fast, boring is fine)

| Screen | Content | Notes |
|---|---|---|
| **Habit Editor** | CRUD habits + **browse the Habit Library** (§4d) + mark-as-mastered | Balance nudges (core count, category spread) inline; "suggest graduation" surfaces when completion data sustains; seed defaults on setup so day 1 works without configuration |
| **Adventure Editor** | CRUD adventures: name, tier/cost, illustration, venue note + **browse the Adventure Library** (§4c) | "Add from library" with filters (indoor/outdoor, free, age) copies entries into the family menu; seed the menu in §4 |
| **Weekly Digest** | Last week at a glance: completion grid, streak, stars earned, planned adventure status; one-tap "adventure done" | This is the *only* recurring parent surface. Target: under 2 minutes |
| **Setup Wizard** | Account → add child (name, age, interests, avatar) → habits via Scout or seeds → adventures via Scout or seeds → done | Must produce a working app in under 5 minutes, no seed scripts |
| **Scout** (see §5a) | Conversational setup: parent describes the kid, Scout proposes habits & adventures as accept/edit/skip draft cards | The front door of the wizard; also re-runnable later for menu refreshes |

**Access model:** parent has email/password auth; the kid enters by **tapping their avatar — no PIN by default**. The only sibling-mischief threat (checking off each other's habits, spending each other's stars) carries no real harm, is visible in the star ledger and weekly digest, and is a parenting conversation, not a security feature — consistent with the trust-first principle. A **per-child "secret code" is an optional toggle** (default off), and the toggle is **only visible when the family has 2+ children** — with one kid there is no sibling to protect against, so don't show a setting that solves an impossible problem. When visible, it's framed to the kid as an ownership ritual ("your secret code") and available to the parent as an escalation if sibling mischief becomes real. Parent area is gated behind a parent PIN so kids can't wander in.

**Parent gate philosophy — tamper-evident, not tamper-proof.** The threat is a resourceful kid on a shared device, not an attacker. The PIN is a light lock; the real defense is visibility:

- Parent PIN must differ from any kid secret code; reject birth-year-of-child as a PIN suggestion.
- Exponential cooldown after failed attempts (no permanent lockout — the parent is standing right there).
- Failed parent-PIN attempts and **all parent-side edits** (habit changes, cost changes, manual star adjustments) appear in the weekly digest — even a kid who gets in leaves footprints the parent sees within days.
- Nothing destructive is one tap deep: archive instead of delete, undo windows on edits.

### 5a. The Scout — conversational setup (agentic mode)

Instead of filling forms, the parent talks. The Scout turns a short conversation into a personalized, schema-valid habit set and adventure menu — per child, calibrated to age, interests, and what the parent is actually struggling with. This is the answer to the blank-canvas problem and what makes the app work for families beyond Zen & Zia.

**Conversation flow:**

1. **Intake** — Scout asks about the kid: age, personality, current interests, what mornings/evenings look like, what the parent wants to improve ("he never tidies up", "she won't read").
2. **Habit proposals** — 3–4 core candidates + 2–3 bonus candidates, each pre-mapped to a time block, core/bonus flag, and active days. **Grounded in the Habit Library (§4d) and its balance heuristics** — age-scaled core count, category spread, one new habit at a time. Each proposal carries its "why it matters" line so the parent learns the reasoning, not just the answer. Parent reacts in natural language ("mornings are chaos, move those" / "he already does that on his own") and the Scout revises.
3. **Adventure proposals** — asks what's nearby, the family's time/budget reality, and what the kid loves; proposes a tiered menu that respects the souvenir rule (§4), including the 0-star fallback. **Grounded in the Adventure Library (§4c):** select + personalize curated entries first, generate novel ideas second.
4. **Accept** — chosen drafts are written as real `habits` / `adventures` rows. The manual editors remain the backbone; the parent can tweak anything afterward.

**Re-run triggers (parent-initiated only):** new school year, birthday, adding a second child (different age + interests → genuinely different set), a habit graduating (§4d — the slot opens and the Scout proposes what's next), or "the menu feels stale." Multiple kids each get their own conversation context — this is how Zia's onboarding becomes a 5-minute chat instead of a design session.

**The Scout asks good questions.** Its job is not just output — it deepens the parent's understanding of their own kid. Questions like "What does he do without being asked?" "Where do mornings break down?" "What's something she's been curious about lately?" are part of the product: the parent should finish a Scout conversation knowing their kid slightly better. Answers accumulate into the child's `focus_notes`, so each conversation starts smarter than the last.

**Hard rules:**

- The Scout exists **only on the parent side**. The kid never talks to an LLM — no AI mascot, no chat in the kid loop.
- The LLM **never computes stars, streaks, or completions**. The economy in §4 is deterministic code, fully unit-tested, LLM-free.
- All suggestions are emitted via **structured output matching the schema** (tool use / JSON schema), rendered as draft cards — accept, edit, or skip. No free text ever writes to the database.
- The system prompt embeds this brief's principles (§2, souvenir rule, age calibration, non-goals). A suggestion like "20 stars = a toy" is a prompt bug — test for it.
- **Privacy:** send the minimum — age, interests, parent's stated goals. Child's name is optional in prompts; never send PINs or auth data.
- Conversations are ephemeral by default; only the accepted rows persist.
- **Rate-limit Scout calls per account** (e.g. a handful of sessions per day). The app is free and public — the LLM proxy must not become an open faucet.

---

## 6. Explicit non-goals

Do not build any of these, even as stubs:

- Monetization, subscriptions, paywalls — **always free**
- Approval queues or per-completion parent review
- Standalone material rewards / toy store / money — objects are allowed only as part of an adventure under the souvenir rule (§4), never as direct star-for-thing line items
- Cross-family social features, leaderboards, sharing between families. (Multi-tenant signup is **in scope** — any parent can register — but families are fully isolated and never see each other)
- User-generated library content — the Adventure Library (§4c) is curated by us only; no submission/sharing pipeline
- Venue/maps database or places API integration — location types only; parents attach their own venues
- AI theme generation, avatar leveling, pets, mini-games (v1 roadmap baggage — cut)
- Any LLM in the kid loop — no AI chat for the kid, no LLM-computed stars. The Scout (§5a) is parent-side setup tooling only. (The mascot Zee is allowed and canonical — see §5 — because his lines are scripted, never generated)
- Push-notification nagging. One optional Sunday-ceremony reminder max
- Android/iOS native builds at launch — PWA first (Capacitor wrapper can return later)

---

## 7. Tech stack (proven in v1 — reuse)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Vite + TypeScript | v1 used React 19; fine |
| Styling | Tailwind CSS | Visual direction is defined in [DESIGN_BRIEF.md](DESIGN_BRIEF.md) — from-scratch identity, two registers (loud kid side, calm parent side). Do not inherit v1's styling |
| Data/auth | Supabase: Auth, Postgres + RLS, RPCs | See lessons in §8 — RLS and atomicity are where v1 got burned |
| Hosting | Vercel, auto-deploy on push to `main` | |
| Form factor | PWA (installable, offline-tolerant for the kid view) | The board is checked daily on a shared tablet/phone |
| LLM (Scout only) | Claude API via a Supabase Edge Function (key server-side), structured output / tool use | Cheap fast model (Haiku-class) is enough; calls are rare (setup + occasional refresh), cost ≈ zero. The kid loop makes no LLM calls |
| Testing | Vitest + Testing Library | Star economy and streak logic must be unit-tested — they're the trust contract with the kid |

### Data model sketch

```
parents      (id, email, parent_pin_hash)
children     (id, parent_id, name, avatar, secret_code_hash (nullable — optional toggle), star_balance,
              birth_year, interests: text[], focus_notes)  -- feeds the Scout prompt
habits       (id, child_id, name, icon, time_block: morning|afternoon|evening,
              is_core: bool, active_days: int[], sort_order, archived_at)
completions  (id, habit_id, child_id, completed_on: date, created_at)
              -- unique (habit_id, completed_on)
star_events  (id, child_id, delta, reason: habit_checkoff|bonus_habit|streak_3|perfect_week|redemption,
              ref_id, created_at)   -- append-only ledger; balance is derived/cached
adventures   (id, parent_id, name, illustration, cost, tier, archived_at)
planned_adventures (id, adventure_id, child_id, planned_for: date,
              status: planned|done|skipped, created_at)
dreams       (id, child_id, name, illustration, pledge_text, stars_required,
              stars_earned, anchor_date, status: active|achieved|retired, created_at)
              -- max ONE active per child (partial unique index); stars_earned
              -- incremented only by the weekly perfect-week RPC
```

**The ledger is the source of truth.** `star_balance` is a cached aggregate updated only inside RPCs. Streaks are computed from `completions` (a day counts when all active core habits for that day have completions).

---

## 8. Lessons from v1 (do these from day one)

v1 lives in this repo — readable for reference, but **do not port code**; the reward model and approval flow are conceptually wrong for v2.

1. **Atomic star operations via Postgres RPCs.** v1 initially did read-modify-write star math client-side and had to retrofit RPCs (`004_atomic_redemptions.sql`). v2: every star mutation (daily award, streak bonus, redemption) is a single RPC with the balance check inside the transaction.
2. **RLS ownership checks everywhere.** v1 shipped a bug where a child route didn't verify the child belonged to the authenticated parent. Write RLS policies first, and test them.
3. **PIN hashing in an Edge Function** (bcrypt) — v1's `verify-pin` pattern was right; reuse the approach.
4. **Setup wizard before anything else needs it.** v1 ran on seed scripts for months and the wizard never shipped. In v2 the wizard is part of the MVP cut, not a fast-follow.
5. **Docs drift.** Keep one `STATUS.md`, update it in the same commit as the feature, delete stale specs.

---

## 9. Build order

| Phase | Scope | Done means |
|---|---|---|
| **1 — Foundation** | Schema + RLS + RPCs + auth + setup wizard | Parent can sign up, create Zen, get seeded habits & adventures, set the parent PIN |
| **2 — Kid loop** | Routine board, completion flow, star ledger, streak logic, star jar | Zen can run a full day unaided; stars and streaks correct, unit-tested |
| **3 — Adventure loop** | Adventure menu, redemption RPC, planned adventures, Star Ceremony mode | Sunday ritual works end-to-end on the couch |
| **4 — Parent surface** | Habit/adventure editors with library browsers, weekly digest, "adventure done", mastery & graduation flow | Ganis's weekly involvement ≤ 2 minutes; a habit can graduate end-to-end (suggest → confirm → celebrate → slot opens) |
| **5 — Scout** | Edge Function LLM proxy, conversational intake in the wizard, structured draft cards, re-run flows | A new parent goes from signup to a personalized working app in under 10 minutes via conversation; seeds remain the no-LLM fallback |
| **6 — Polish** | PWA install, offline tolerance, sounds/animations, Zia readiness (multi-child paths verified) | Installed on the family device; second child can be added cleanly — via her own Scout conversation |

---

## 10. Success criteria

The app works if, after 4 weeks of real use in the founding family:

- **"What do I need to do?" asked to Dad → near zero.** Zen checks the board instead.
- **Core streak ≥ 5 days in a typical week** without parental prompting.
- **The ceremony happens weekly** and Zen looks forward to it.
- **The adventure happens weekly** — including in low-star weeks (fallback tier used).
- **Parent app time ≤ 2 min/week** outside the ceremony.

And it's ready to publish if:

- **A stranger can do it:** a parent with zero context signs up and reaches a working, personalized board in one sitting (< 10 min via Scout, no docs needed).
- **Families are provably isolated:** RLS policies tested so no parent can ever read another family's children, habits, or completions.
- **Free stays sustainable:** Scout rate-limited, no per-user costs beyond rare LLM calls and Supabase/Vercel free-tier-friendly usage.

If kids game the system (mass-tapping at 9 PM), do not add surveillance features — that is a conversation for the parent, not a feature. Trust-first is the design.

---

*Built with ❤️ for Zen & Zia by Synetica — published free for every family.*

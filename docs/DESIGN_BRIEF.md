# Starquezz v2 — Design Agent Brief

> **Purpose of this document:** complete context for a design agent producing the screens, flows, and motion design for Starquezz v2. Read [AGENT_BRIEF.md](AGENT_BRIEF.md) first — it is the product source of truth (concept, principles, star economy, screen logic). This brief covers what that one doesn't: visual direction, the full screen/flow inventory including splash and onboarding, the delight & animation system, and expected deliverables.
>
> **Rule zero:** nothing you design may violate the four principles in AGENT_BRIEF §2. In particular: never render copy or imagery implying a child *earns time with a parent* — stars pick *which* adventure, never *whether*.

---

## 0. Goal & objectives of the app

**Starquezz turns a kid's daily routine into a self-run quest, and turns the rewards into shared experiences with their parents.** It is a free, published web app (PWA), designed first for one real family — Zen (8) and Zia (5) — and built to work for any family.

The app exists to solve **three problems** at once (canonical framing — see AGENT_BRIEF §1):

1. **The kid's problem:** "What do I need to do?" asked to a parent several times a day. The app answers instead, so the routine becomes the kid's own.
2. **The parent's design problem (the core value proposition):** designing a well-balanced habit set tailored to a specific kid is genuinely hard — which habits matter at this age, how many is too many, what to do when one is mastered. The app helps the parent *design and evolve* the set: good questions, research-informed suggestions, habits that graduate when mastered.
3. **The parent's ideation problem:** inventing bonding activities on demand. The reward catalog is a pre-decided menu of shared adventures — bookshop trips, playgrounds, treasure hunts — never toys or money. Stars buy *agency over shared time*, not stuff.

### Objectives — and what each demands from the design

| # | Objective | What it demands from the design |
|---|---|---|
| 1 | **Kid autonomy** — the kid runs the daily loop unaided; "what do I do?" questions drop to near zero | The routine board must be self-explanatory to an early reader and operable by a pre-reader: icon-first, current-time-block-first, zero dead ends |
| 2 | **Habit consistency** — streaks of "all core habits done" become the kid's proud possession | Streak and stars are always visible; celebrations scale with rarity; a broken streak is quiet, never shamed |
| 3 | **Weekly bonding, guaranteed** — a shared adventure happens every week, even in low-star weeks | The 0-star fallback adventure must feel warm, never like a consolation prize; the ceremony and the adventure "ticket" make anticipation visible all week |
| 4 | **Near-zero parent burden** — ≤ 2 minutes/week in the app, zero ideation burden | Parent surfaces are calm, dense, and fast; the Scout conversation and Adventure Library carry the thinking |
| 5 | **The check-off beats being told** — the emotional core | Completing a habit in the app must *feel better* than a parent's reminder. If the delight layer fails, the product premise fails — this is why motion is a deliverable, not polish |
| 6 | **Habit design, not just tracking** — the value proposition | The app helps parents *design* a balanced, age-right, research-informed habit set and evolve it: habits graduate when mastered (Hall of Fame), new ones take the slot. Surfaces: the Scout conversation, Habit Library browser, balance nudges, and the graduation celebration |

**These three problems are the app's story everywhere.** Manifesto beats, onboarding slides (one problem per slide), empty states, and marketing copy all map back to them — never tell just one third of the story.

### What the app is not

Not a chore-wage app (no money, no toys as line items), not a screen-time destination (sessions are seconds long by design; the app points *away* from itself, toward the routine and the family), and not a surveillance tool (completions are trusted, not policed).

Success, concretely: after four weeks the founding family sees "what do I need to do?" near zero, a ≥ 5-day typical streak, and the ceremony + adventure happening weekly — and a stranger parent can sign up and reach a working board in one sitting. (Full criteria: AGENT_BRIEF §10.)

---

## 1. Design mission

One app, two emotional registers:

| Register | Surfaces | Feel |
|---|---|---|
| **Kid side** | Splash, avatar select, routine board, star jar, adventure menu, ceremony | Loud, joyful, physical. A toy that happens to be an app. This is where ~90% of the delight budget goes |
| **Parent side** | Onboarding, signup, wizard/Scout, digest, editors | Calm, fast, trustworthy. Quietly well-made. Boring is acceptable; slow is not |

**Delight is a feature, not garnish.** The product's habit mechanic depends on the check-off moment feeling *better than being asked by Dad*. If the celebration animations get cut, the product premise fails. Design them as specs an engineer can implement, not as decoration to add later.

**Audience reality check:** primary user is an 8-year-old early reader (reference persona: Zen), with a 5-year-old sibling joining later (Zia — pre-reader, so the system must work icon-first). Adult surfaces are used by a busy parent in under 2 minutes a week.

---

## 2. Visual direction — DECIDED: Cosmic

> **Status (June 2026):** the direction-proposal process below was run — six directions were explored in an interactive wireframe prototype (Storybook, **Cosmic**, Toybox, Papercraft, Sketchbook, Aurora) and **Cosmic won**: a deep night-sky world (indigo `#0E1336`-family backgrounds, glowing gold `#FFD66B` / cyan `#8DEBFF` / pink `#FF87C4` accents), Fredoka display + Mulish body type, the constellation as the Big Dream visual, and **Zee** — a star-sprite mascot whose snooze is the "ZZ" in the wordmark (he wakes when you tap). The prototype lives in `Starquezz Wireframe/` (Downloads) — treat it as the visual source of truth to refine, not a sketch to replace. The criteria below remain the governing rules for all further design work; the original open-brief process is kept for reference.

**This is a from-scratch project with no inherited visual identity.** Do not carry over v1's styling, do not use Synetica's corporate brand (this is a consumer kids product, not an agency site), and do not default to the generic kid-app look (flat pastel blobs, rounded-everything, stock confetti) or generic AI-generated aesthetics. The direction is yours to invent — propose it, don't inherit it.

**Process:** present **2–3 genuinely distinct direction proposals** (style tile + one hero screen each — the routine board is the best test subject), with a one-paragraph rationale per direction scored against the criteria below. Converge on one *before* full screen production.

**Criteria every proposed direction must satisfy:**

| Criterion | Test |
|---|---|
| **Two registers, one world** | The style must turn *up* for the kid and *down* for the parent and still feel like one app |
| **Ownable** | A screenshot is recognizable as Starquezz with the logo covered; doesn't resemble existing kids/chore apps |
| **Kid-legible** | Big shapes, high contrast, icon-first; works for a pre-reader (Zia, 5) |
| **Motion-native** | The style implies a motion language — the delight system (§4) must feel like it grew from the visuals, not bolted on |
| **Illustration-driven** | Supports a consistent illustration style across adventure cards, avatars, empty states, onboarding — illustration is a primary delight carrier |
| **Accessibility-compatible** | AA contrast achievable without gutting the palette (§5) |

**System requirements regardless of direction:**

- **Two palettes, one system** — kid side loud, parent side the same hues calmed; one world, volume knob.
- **Typography:** a display face with personality for kid-side headings; a workhorse sans for everything else. Kid-side text is minimal by design — icons + 1–3 word labels.
- **Iconography:** every habit and adventure has an icon; a pre-reader must be able to run her whole routine without reading a word.

---

## 3. Screen & flow inventory

![Screen flow map](assets/screen-flow.svg)

Every screen below needs explicit **states**: default, empty, loading, error, and (kid side) celebration. Empty states are illustration moments, never blank lists.

### 3a. Splash screen *(required — two distinct variants)*

The splash is not one screen; it is two jobs. The **first open ever** is a parent holding the phone, deciding whether this app has a soul. **Every open after that** is a kid who wants their board *now*. Design both; never mix them.

**Variant 1 — First-run manifesto (parent, once).** Before onboarding, the app states why it exists. A quiet, typographic, line-by-line reveal — each line lands, breathes, gives way to the next. Total ~8–10 seconds, tappable to advance, skippable. The copy spine maps to the **three canonical problems** (AGENT_BRIEF §1) — design agent may tune rhythm and wording, but all three problems must appear; never narrow to just one story (e.g. mornings only, or rewards only):

> We live in the most distracting world ever built. *(the quiet truth)*
>
> Starquezz gives your kid their own quest — no more "what do I need to do?" *(problem 1: kid autonomy)*
>
> We help you choose habits that fit your kid — and grow as they do. *(problem 2: habit design)*
>
> And every reward is an adventure you have *together*. A playful childhood. With you in it. *(problem 3 + invitation)*

The visual register starts calm and grown-up (this is the parent's moment), and on the final line Zee and the star motif ignite — the first hint of the kid world inside. Then it flows directly into onboarding screen 1. **Because the manifesto carries the emotional why, onboarding screens 1–3 explain the how — one problem per slide (any order), demonstrated rather than re-pitched.**

**Variant 2 — Daily launch (everyone, every time).**

| Aspect | Spec |
|---|---|
| Duration | < 2 seconds, never blocks on network; doubles as the PWA launch screen |
| Content | Starquezz logo/wordmark + signature star motif |
| Motion | One delightful beat — e.g. a star streaks in, lands, bursts into the wordmark. The app's "hello," not a speech |
| Variants | Cold start (full beat) vs. resume (instant, no animation). Reduced-motion: simple fade — applies to the manifesto too (static lines, no choreography) |

### 3b. First-run flow (parent, once)

`Splash → Onboarding (3 screens) → Sign up → Setup Wizard (Scout) → Home`

| Screen | Job | Design notes |
|---|---|---|
| **Onboarding 1 — kid autonomy** (problem 1) | "Your kid checks the board, not you — the routine becomes theirs." | Swipeable, skippable, illustrated. One problem per screen, one line of copy each |
| **Onboarding 2 — habit design** (problem 2) | "Not sure which habits fit your kid? We'll help you pick a small, doable handful — and evolve them as they grow." | The core value proposition; the prototype's "no giant chore chart" line is a keeper |
| **Onboarding 3 — adventures together** (problem 3) | "Stars buy adventures together — bookshop trips, playgrounds — never toys or money." | The differentiator; make it land visually (kid + parent in the illustration, always together). End on the CTA: *Get started — free, always* |
| **Sign up** | Email + password, then create parent PIN | Plain and fast. Include forgot/reset flows (utilitarian — design once, no delight budget) |
| **Setup Wizard** | Add child (name, age, interests, avatar) → habits → adventures → done | The Scout conversation is the front door: chat-style intake, suggestions arrive as **draft cards** to accept/edit/skip. Manual forms are the visible fallback ("skip — I'll do it myself"). Must reach a working board in < 10 min. Design the draft-card pattern carefully — it's the signature interaction of the parent side |
| **Wizard finale** | Handoff moment | A "give the device to your kid" screen — the app literally changes register here; make the transition theatrical (calm parent UI opens into the loud kid world) |

### 3c. Kid daily loop (the heart)

`Splash → Avatar select → Routine Board ↔ Star Jar ↔ Adventure Menu`

| Screen | Job | Design notes |
|---|---|---|
| **Avatar select** | "Which kid are you?" | Big tappable faces. Tapping your avatar *is* the login — the selected avatar reacts (bounce/wave) and the board opens. No PIN by default |
| **Secret code** (optional) | Only when the parent enables it per child — and the enabling toggle only appears for families with 2+ children | 4-digit entry, kid-proportioned: large keypad, instant feedback per digit, gentle shake on a wrong code — never punitive language. Framed as the kid's own secret code (ownership ritual), not a lock |
| **Routine Board** (home) | Answer "what now?" | Defaults to current time block (morning / after school / evening); other blocks one swipe away. Habit cards: icon-dominant, 64px+ touch targets. Core habits visually distinct from bonus; bonus cards visibly *locked* until cores are done (lock that begs to be opened). Persistent star counter + streak flame. Undo affordance for 5 min after a check-off |
| **Star Jar** | Make the balance feel physical | Stars as objects in a jar (stacking, settling). Week calendar of star-days. Streak history. Counting is the fun — let kids *see* quantity. When a **Big Dream** is active (AGENT_BRIEF §4b): a **constellation** that fills star-by-star per perfect week, with the pledge and anchor event visible — designed as anticipation, never as pressure; completed dreams gather into the kid's **galaxy**. Constellation stars must read differently from spendable star tokens. The **Hall of Fame** (AGENT_BRIEF §4d): graduated habits as trophies on a shelf — identity made visible, growing slowly over years |
| **Adventure Menu** | Motivation through browsing | Tier cards with illustrations + star prices. Affordable = glowing/unlocked; unaffordable = visible with "X more ⭐" progress, never hidden. The 0-star fallback adventure is always present and warm — it must never read as a consolation prize |

### 3d. Sunday Star Ceremony (the ritual)

A guided, full-screen, couch-together mode — the emotional peak of the week. Design it as a sequence, not a screen:

1. **Recap** — the week replays: star-days light up one by one on a calendar, stars fly into the jar with a count-up.
2. **Streak reveal** — did the perfect week land? Big payoff either way (triumph vs. warm "next week!" — never shame). If a Big Dream is active and the week was perfect, a **new star ignites in the dream constellation** here — a slow, glowing beat distinct from the snappy star-token effects.
3. **Adventure pick** — the menu in ceremony dress; the kid picks; picking feels like a slot-machine-pull of joy.
4. **Sealed!** — the planned adventure gets a "ticket" (date + illustration). The ticket is a designed object — it may reappear on the routine board all week as the thing being looked forward to.

### 3e. Parent surfaces (rare, calm)

`Home → Parent PIN → Digest ↔ Habit Editor ↔ Adventure Editor ↔ Scout re-run`

| Screen | Job | Design notes |
|---|---|---|
| **Weekly Digest** | The whole week in one glance | Completion grid per child, stars earned, streak, planned-adventure status with one-tap "adventure done ✓". Target: parent in-and-out in 2 minutes |
| **Habit Editor** | CRUD habits + Habit Library browser + mastery | Dense list, inline edit, time-block grouping, core/bonus toggle, icon picker. Library browser mirrors the adventure one (filter by category/age; each card leads with its "why it matters" line). Inline **balance nudges** (core count, category spread) as gentle hints, never blockers. "Mark as mastered" lives here |
| **Adventure Editor** | CRUD adventures + Adventure Library browser | Tier structure visible; a gentle inline reminder of the souvenir rule where objects are attached. The **library browser** (AGENT_BRIEF §4c) is a browsable, filterable card grid (indoor/outdoor · free · age · duration) where each card leads with its illustration and 2–3 sentence explainer — design the explainer card to be read in 10 seconds and acted on tonight |
| **Scout re-run** | Refresh suggestions | Same chat + draft-card pattern as the wizard |

---

## 4. Delight & animation system

### Motion principles

1. **Snappy, then juicy.** UI response is instant (≤ 150ms acknowledgment); celebration layers on top without blocking the next tap. A kid should be able to machine-gun through three habits and get three overlapping celebrations.
2. **Physical, springy easing** — things bounce, settle, and have weight (spring curves, squash & stretch). Nothing fades politely on the kid side.
3. **Earn the big moments.** Reserve the largest animations for the rarest events. Scale: check-off < daily win < streak milestone < ceremony. If everything explodes, nothing does.
4. **Respect `prefers-reduced-motion`** — every signature moment needs a reduced variant (state change + gentle fade) with the same information content.
5. **Sound is optional garnish** — short, soft, charming effects on signature moments only; globally mutable; never required to understand state.

### Signature moments (ranked by delight budget)

| # | Moment | Trigger | Sketch of the beat |
|---|---|---|---|
| 1 | **Check-off star-flight** | Any habit completed | Card stamps ✓ with squash; a star leaps out and arcs into the persistent counter; counter pops |
| 2 | **Daily win** | All cores done | Board-wide burst (confetti/starfield), streak flame ignites or grows; bonus cards unlock with a visible "click" |
| 3 | **Streak milestone** | 3-day / 7-day reached | Flame levels up; +1/+3 bonus stars rain into the jar one by one |
| 4 | **Habit graduation** | A mastered habit enters the Hall of Fame | The rarest, biggest personal moment outside the ceremony: the habit card transforms into a trophy and travels to the shelf; one-time bonus stars rain. Tone: leveling up, "this is part of who you are now" — never a goodbye |
| 5 | **Ceremony count-up** | Sunday ritual step 1–2 | The week replays; jar fills star by star with escalating tempo |
| 6 | **Adventure unlock / pick** | Affordable tier or ceremony pick | Locked card shakes loose, glows, opens; picking prints the ticket |
| 7 | **Splash hello** | Cold start | Star streak → wordmark burst (< 2s) |
| 8 | **Scout draft-card arrival** | Parent side | Cards deal in with a soft stagger — the one parent-side flourish |

### Anti-patterns

- No idle/looping animations begging for attention; motion only responds to the kid's actions.
- No streak-loss drama — a broken streak is quiet (flame simply resets); never animate failure.
- No dark patterns: no countdown pressure, no artificial scarcity, no variable-reward gambling mechanics. The slot-machine *feel* of the ceremony pick is in the kid's hands (they choose), not in randomness.

---

## 5. Ergonomics & accessibility

| Requirement | Spec |
|---|---|
| Touch targets | Kid side ≥ 64px; parent side ≥ 44px |
| Contrast | WCAG AA minimum everywhere, including text on saturated fills (test the proposed palette, don't assume) |
| Reading level | Kid side: icon + 1–3 word labels, no sentences required to operate; everything Zia (5, pre-reader) needs is icon-first |
| Mis-tap forgiveness | Check-offs reversible for 5 minutes via a visible undo affordance |
| Form factors | Design mobile-first (shared phone/tablet, portrait). PWA — include installed-app states and the splash-as-launch-screen |
| One-handed kid use | Primary actions in the lower 2/3 of the screen |

---

## 6. Deliverables

1. **Direction proposals** — 2–3 distinct style tiles + hero screens with rationale (§2); converge before anything below begins.
2. **Design tokens** — color (both registers), type scale, spacing, radii, shadow style, motion durations/curves. Named and export-ready (the build stack is Tailwind; token names should map cleanly).
3. **Component library** — habit card (all states, including the "now" spotlight state from the prototype), adventure card (locked/affordable/fallback/ticket), star counter, streak flame, Big Dream constellation (empty/filling/complete states) + galaxy of past dreams, Hall of Fame for graduated habits, library browse card (adventure & habit variants — the habit card leads with its "why it matters" line), draft card (Scout), **Zee the mascot** (asleep/awake/cheer states; scripted speech bubble), keypad, buttons/inputs in both registers.
4. **All screens** from §3 with their states (default, empty, loading, error, celebration where applicable).
5. **Three prototyped flows:** ① first-run (splash → onboarding → wizard → handoff), ② kid daily loop (avatar tap → board → check-off → daily win), ③ Sunday ceremony end-to-end.
6. **Motion specs** for the 8 signature moments — timing, easing, choreography notes, reduced-motion variant each. Implementation-friendly (CSS/spring parameters or Lottie where genuinely needed).
7. **Illustration direction sheet** — style reference, the starter set (3 onboarding scenes, 4–6 avatars, empty states), and a **scalable recipe for Adventure Library illustrations**: ~30 entries at launch, so define a template/system (composition rules, palette, motif grammar) that keeps the set producible and consistent rather than 30 bespoke pieces. Illustrate ~8 hero entries fully as the reference.

**Out of scope for design:** marketing site, app-store assets, dark mode, Android/iOS-native conventions (PWA only), and anything in AGENT_BRIEF §6 non-goals.

---

*Companion to [AGENT_BRIEF.md](AGENT_BRIEF.md). Built with ❤️ for Zen & Zia by Synetica — published free for every family.*

# Handoff: ipon — Revamped Goal-Tracking UI

## Overview
**ipon** is a goal-based savings tracker. This handoff covers the revamped single-page experience: a chosen goal displayed as a large hero (ring or bar progress), a stats row, a quick-action rail for adding contributions, and a chronological contribution feed. The user can switch between goals via a left drawer or a horizontal chip rail, create/edit goals, and add money to a goal.

The design direction is **editorial-minimal × soft-playful fintech** — warm paper-like surfaces, generous whitespace, a serif display voice (Instrument Serif) accented against a neutral Inter sans, and one configurable accent color per goal.

## About the Design Files
The files in `reference/` are **design references created in HTML** — a clickable React-in-a-single-HTML-file prototype that illustrates intended look, hierarchy, and behavior. **They are not production code to copy directly.**

The task is to **recreate these designs inside the target codebase** (the user's Vercel/Supabase/GitHub project) using the app's existing framework and patterns — component library, routing, data layer, auth, etc. If the target project is greenfield, pick the most appropriate stack for it (Next.js + Tailwind + shadcn/ui is a natural fit for this aesthetic) and implement the designs there. Do not ship the HTML prototype as-is.

## Fidelity
**High-fidelity.** Colors, typography, spacing, border radii, animation timings, and interactions are all intentional. Recreate them as specified. Where values aren't called out explicitly below, lift them directly from `reference/styles.css`.

## Target stack assumptions
The user mentioned Vercel, Supabase, and GitHub. A reasonable target stack — adjust to whatever actually exists in their repo:
- **Next.js** (App Router) on Vercel
- **Supabase** for auth + Postgres (goals + contributions tables)
- **Tailwind CSS** with CSS variables for theme tokens
- **shadcn/ui** or equivalent for drawer, sheet, button, input primitives
- **Framer Motion** for the progress-bar spring and count-ups

If the repo already has a component library / styling approach, use that instead.

---

## Screens / Views

There is effectively **one screen** (the home/goal view), with modals and a drawer layered on top. All screens share the same app shell.

### 1. App shell

**Layout (top to bottom):**
1. **Top bar** (`.topbar`, sticky, height auto, padded `14px 18px`):
   - Left: menu icon button (hamburger) — opens the left drawer.
   - Center: brand — a small wordmark reading `hello, ipon •` where `hello,` is Inter at 15px/regular/muted, `ipon` is Instrument Serif italic at ~22px, and `•` is a 6px dot colored with the current goal's accent.
   - Right: an invisible spacer matching the icon button's footprint so the brand stays centered.
   - The top bar gets a subtle shadow + blurred background when `scrolled` (page scrollY > 4).
2. **(Optional) Chip rail** — only shown when `tweaks.nav === "chips"`. A horizontal scroll-snap row of goal chips with a trailing `+` button. Hidden when `nav === "drawer"` (the default).
3. **Hero** — the current goal. Two variants (see below).
4. **Stat grid** — 3 cards: Monthly target (feature, full-width on top), Remaining, Time left.
5. **Quick-add rail** — horizontal row of preset amount buttons + a custom "+" button.
6. **Contribution list** — reverse-chronological list of contributions for the active goal.
7. **Safe-area bottom padding** — `env(safe-area-inset-bottom)` + 24px.

Max content width: **520px**, centered. The shell is intentionally phone-shaped but works on desktop.

**Overlays** (not screens, portaled/positioned over the shell):
- **Left drawer** (`.drawer`, slides in from left, width 86vw max 340px) — goals list + settings.
- **Edit/New goal sheet** — bottom sheet, rounded top (28px), full-width within content max-width.
- **Add contribution sheet** — same sheet treatment.
- **Tweaks panel** (dev-only, toggled by host) — bottom-right floating card.

### 2. Hero — Ring variant (`tweaks.hero === "ring"`)

A centered, card-less block:

- Eyebrow row: flex `space-between`.
  - Left: `"saving toward"` in uppercase, 11px, letter-spacing `0.12em`, color `var(--text-mute)`.
  - Right: **Edit pill** — `<button>` with pencil icon + `EDIT` label.
    - `inline-flex`, gap 5, padding `4px 10px`, `border-radius: 999px`.
    - Background: `var(--surface)`. Border: `1px solid ${accent.hex}55` (33% opacity of accent).
    - Text: 11px, 600, uppercase, `letter-spacing: 0.02em`, color = accent-ink.
- Title row: `flex, align-center, gap 10, justify-center, flex-wrap: wrap`.
  - Emoji (~44px). Goal name in Instrument Serif 40px/italic optional per taste; in the prototype it uses `--font-display` at 34px/600. Pick one and stick with it.
  - **Do not truncate the goal name** — wrap naturally to multiple lines.
- Meta row: `by {date} · {time left}` in 13px muted.
- **RingProgress** — SVG, 260×260, stroke 14.
  - Track circle: `var(--border)` at 8px.
  - Progress arc: rounded cap, stroke = accent hex, `stroke-dasharray` animated on mount from `0 → percent` over 900ms using a spring-like cubic-bezier.
  - 4 tick marks at 25/50/75/100%: tiny circles that flip from outline to filled accent as they're reached.
  - Inside the ring:
    - Percent: Instrument Serif 56px with a smaller `<sup>%</sup>`.
    - Saved amount: Inter Display 20px/600 tabular-nums.
    - `of $X,XXX goal` in 13px muted.

### 3. Hero — Bar variant (`tweaks.hero === "bar"`, default)

A full-width card `padding: 16px 22px 20px`, no background (transparent over shell), containing:

- Same eyebrow row + edit pill as ring variant (left-aligned instead of centered).
- Title row: left-aligned, emoji 30px + name 30px (Instrument Serif italic works well here), wrap allowed.
- Meta: `by {date} · {time left}`.
- **Big number**: `--font-display` 44px/600, letter-spacing -0.03em, tabular-nums — the current saved amount.
- Below it, muted 14px: `of $X,XXX · {percent}%`.
- **Progress bar**: 10px tall, full width, `border-radius: 999px`, track `var(--border)`. Fill = accent hex, animated from 0 → target width with a spring (Framer Motion `type: "spring", stiffness: 120, damping: 22`).
  - Small tick labels below at 25/50/75/100%.

### 4. Stat grid

CSS grid, `grid-template-columns: 1fr 1fr`, gap 10. First card spans both columns (`grid-column: 1 / -1`, class `.feature`).

- `.stat-card`: `padding: 16px 18px`, `border-radius: var(--radius-md)` (20px), background `var(--surface)`, border `1px solid var(--border)`.
- `.stat-label`: 11px uppercase letter-spacing 0.1em, muted, margin-bottom 6px.
- `.stat-value`: Instrument Serif / Inter Display 24px 600 tabular-nums.
- `.stat-sub`: 12px muted.
- Feature card value is larger (32px) and may read `"🎉 Reached!"` when `remaining === 0`.

Copy:
- Monthly target: `$X / mo` with sub `≈ $Y per week · on track` OR `· behind pace`.
- Remaining: `$Z` with sub `NN% to go`.
- Time left: `Nmo` or `Nd`, sub `NN days total` or `deadline passed`.

### 5. Quick-add rail

Horizontal row, `overflow-x: auto`, `scroll-snap-type: x mandatory`. Four preset pills (`$25`, `$50`, `$100`, `$250`) and a trailing custom pill (`+ Custom`). Each pill:
- `padding: 10px 18px`, `border-radius: 999`, border `1px solid var(--border)`, background `var(--surface)`, font 14/600, tabular-nums.
- Tap → opens the **Add contribution** sheet with the amount prefilled (or empty for custom).

### 6. Contribution list

Header: `Contributions` (Instrument Serif 20px italic) + muted count on the right.

Each row (`.contrib-row`):
- Layout: `grid-template-columns: 36px 1fr auto`, align-center, gap 12, padding `14px 4px`.
- Marker: 36×36 rounded-full, filled with `accent.soft`, centered month glyph (3-letter month abbreviation, 10px/600, uppercase, color `accent.ink`).
- Main column:
  - Note (or `"Contribution"`), 15px/500.
  - Date (short format "Mar 4") in 12px muted.
- Trailing: amount in Inter Display 16/600 tabular-nums, `+$XX`.
- Swipe-left or long-press reveals delete (optional enhancement); prototype has a discreet trash icon on hover.

Empty state: centered illustration placeholder + copy `"No contributions yet — add your first one above."` in 14px muted.

### 7. Drawer (left)

- Scrim (`.drawer-scrim`): `position: fixed, inset: 0`, background `rgba(20,17,13,.35)`, fades in.
- Drawer: `position: fixed, left: 0, top: 0, bottom: 0, width: 86vw, max-width: 340px`, background `var(--surface)`, right border, `border-top-right-radius: 28px`, `border-bottom-right-radius: 28px`, `--shadow-lg`. Slides in with `transform: translateX(-100%) → 0`, 280ms cubic-bezier.
- Contents:
  - **Head**: user greeting (`Hello,`/user name if available) + close button.
  - **"Your goals"** section: list of goals, active one highlighted with accent-soft background + accent border-left. Each row shows emoji, name, and small progress bar.
  - `+ New goal` button (full width, ghost).
  - **Settings**: theme toggle button — `<Sun/> Light mode` when dark, `<Moon/> Dark mode` when light. Signs out below it.

### 8. New/Edit goal sheet

Bottom sheet, slides up. Header: "New goal" or "Edit goal" (Instrument Serif 22px italic) + close X on right.

Fields (stacked, gap 18):
1. **Name** — text input.
2. **Icon** — single-character input, `text-align: center, font-size: 22, height: 46`. On focus, selects existing content. `onBeforeInput`/`onChange` enforces a single glyph. No `inputMode="none"` — we WANT the emoji keyboard to show on tap.
3. **Target amount** — number input, prefixed with `$`.
4. **Target date** — `<input type="date">`. **Must include** the webkit-specific resets in `styles.css` or the control overflows on iOS:
   ```css
   .field-input[type="date"] {
     -webkit-appearance: none;
     appearance: none;
     min-width: 0;
     min-height: 46px;
     font-family: var(--font-sans);
     display: block;
   }
   .field-input[type="date"]::-webkit-date-and-time-value {
     text-align: left;
     min-height: 1.2em;
   }
   ```
5. **Color** — row of accent chips (see palette below). Selected chip gets a double-ring treatment.

Footer: primary `Save goal` button (accent-filled, full-width, radius 999, 52px tall) + secondary ghost `Cancel`.

### 9. Add contribution sheet

Same sheet chrome. Fields:
1. **Amount** — number, big input (`font-size: 32`).
2. **Note** — optional text, placeholder `"What was this for?"`.
3. **Date** — defaults to today, same date-input treatment.

Footer: primary `Add contribution` button.

---

## Interactions & Behavior

- **Goal switching**: drawer item click → set active goal ID → hero + stats + list animate by re-mounting with a slight fade + 8px translate-y (`opacity 0→1, translateY 8→0`, 400ms).
- **Count-ups**: saved amount and percent animate from their previous value to the new value over 900ms using a custom cubic ease (`cubic-bezier(.22,1,.36,1)`). Implementation: `useCountUp(target, duration)` hook — tracks a ref for the start value, uses `requestAnimationFrame`, returns a live number.
- **Progress ring/bar**: spring-animate on goal change or contribution add.
- **Add contribution**: optimistic update — push to local state, fire the mutation, reconcile on response; on failure, toast + roll back.
- **Top-bar shadow**: toggle class when `scrollY > 4`.
- **Keyboard**: on iOS, tapping an input scrolls so the field stays above the keyboard (let the browser handle it; ensure sheets use `max-height: 90vh` with internal scroll).
- **Reduced motion**: respect `prefers-reduced-motion` — disable count-ups and spring animations, snap to end state.

## State Management

Client state (Zustand or React context):
- `goals: Goal[]`
- `activeGoalId: string | null`
- `theme: "light" | "dark"`
- UI flags: `menuOpen`, `showEditGoal`, `showAddGoal`, `showAddContribution`, `scrolled`.

Server state (via Supabase):
- `goals` table: `id, user_id, name, emoji, target_amount (int, cents), deadline (date), color (hex), created_at`.
- `contributions` table: `id, goal_id, user_id, amount (int, cents), note, date, created_at`.
- Derive `totalSaved(goal) = sum(contributions where goal_id = goal.id)`.
- RLS: users can only read/write their own goals and contributions.

Fetching:
- On auth, fetch all goals + contributions in parallel. Subscribe to Supabase realtime channels for contributions so another device stays in sync (optional).

---

## Design Tokens

Pulled verbatim from `reference/styles.css`. Copy these into `globals.css` (or Tailwind config) before anything else.

### Light
```
--bg:            #F6F4EF
--surface:       #FFFFFF
--surface-2:     #FBF9F4
--border:        #ECE7DA
--border-strong: #D9D2C1
--text:          #14110D
--text-sub:      #5B554A
--text-mute:     #8E8676
--text-faint:    #B5AD9C

--accent:        #2C5F3F   /* deep forest — default */
--accent-soft:   #E7F0EA
--accent-ink:    #1B3D28

--pos:           #2C5F3F
--warn:          #B8651E
--danger:        #C24A3E
```

### Dark (`.theme-dark`)
```
--bg:            #0E0D0B
--surface:       #171613 (36% alpha handled in CSS)
--surface-2:     #1C1A16
--border:        #26231E
--border-strong: #36322B
--text:          #F4F1EA
--text-sub:      #BDB6A6
--text-mute:     #8B8472
--text-faint:    #5C564B
--accent-soft:   #1E2A22
--accent-ink:    #9BD1AE
```

### Accent palette (one per goal)
| Name   | Hex       | Soft tint  | Ink        |
|--------|-----------|------------|------------|
| Forest | `#2C5F3F` | `#E7F0EA`  | `#1B3D28`  |
| Plum   | `#6B3E5E` | `#F1E7EE`  | `#47283E`  |
| Ember  | `#B8651E` | `#F7E9DA`  | `#6E3B10`  |
| Ink    | `#2F3E52` | `#E5EAF0`  | `#1C2734`  |
| Sage   | `#6B8E5A` | `#ECF1E5`  | `#3F5934`  |
| Clay   | `#9E5746` | `#F4E3DC`  | `#5D2F22`  |

### Radii
```
--radius-xs: 10
--radius-sm: 14
--radius-md: 20
--radius-lg: 28
--radius-xl: 36
```

### Shadows
```
--shadow-sm: 0 1px 2px rgba(20,17,13,.04), 0 1px 1px rgba(20,17,13,.02)
--shadow-md: 0 6px 20px -8px rgba(20,17,13,.12), 0 2px 6px rgba(20,17,13,.04)
--shadow-lg: 0 24px 60px -20px rgba(20,17,13,.18), 0 8px 20px -8px rgba(20,17,13,.08)
```

### Typography
```
--font-sans:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
--font-display: "Inter Display", "Inter", system-ui, sans-serif
--font-serif:   "Instrument Serif", Georgia, serif
--font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace
```

Load via `next/font` (for Inter + Inter Display) or `@import` (for Instrument Serif from Google Fonts).

Key type treatments:
- Goal names & hero headings: **Instrument Serif, italic, ~30–40px**.
- Big numbers (saved amount, percent, stats): **Inter Display, 600, tabular-nums, letter-spacing -0.03em**.
- Body: **Inter, 400/500, 14–15.5px**.
- Eyebrows / section labels: **Inter, 11px, 600, uppercase, letter-spacing 0.1em, muted**.

### Spacing
Page padding: 18–22px. Card padding: 16–22px. Gap between cards: 10px. Gap inside a card: 6–12px.

---

## Assets
No raster assets. Everything is SVG (icons are inline in `reference/utils.jsx`) or emoji. Icons needed: Menu, Plus, Close, Edit (pencil), Sun, Moon, Chevron, Trash, Check. Either inline them or pull from `lucide-react`.

---

## Files in this bundle
- `reference/index.html` — self-contained prototype (React + Babel in one HTML file).
- `reference/app.jsx` — top-level app shell, drawer, sheets, state.
- `reference/hero.jsx` — Ring and Bar hero variants, stat grid, contribution row/list.
- `reference/utils.jsx` — formatters, `useCountUp` hook, `Icon` component, accent palette, sample data.
- `reference/styles.css` — all CSS tokens and component styles. **Start here.**

Open `reference/index.html` directly in a browser to see the prototype.

---

## Implementation checklist

1. Copy `styles.css` tokens into the project (convert to Tailwind theme if the repo uses Tailwind).
2. Wire up fonts (Inter, Inter Display, Instrument Serif).
3. Scaffold Supabase tables + RLS policies as described.
4. Build shared primitives: `Button`, `Input`, `Sheet`, `Drawer`, `IconButton`, `Pill`.
5. Build feature components in this order:
   - `AppShell` (topbar + layout)
   - `Hero` (bar variant first — it's the default)
   - `StatGrid`
   - `QuickAddRail`
   - `ContribList`
   - `Drawer` (goals list + settings)
   - `GoalSheet` (new/edit)
   - `ContributionSheet` (add)
6. Wire animations last (count-ups, progress spring, drawer/sheet transitions).
7. QA on iOS Safari specifically — date input width, safe-area insets, keyboard overlap on sheets.

If anything is ambiguous, the HTML prototype is the source of truth — match it.

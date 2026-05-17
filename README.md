# Handoff: Newsroom Article Page (Drupal → Next.js)

## Using this with Claude Code (parallel agents)

This bundle is set up to be built with Claude Code using **parallel sub-agents**. Each agent has a self-contained prompt under `agents/` that scopes its work and names exactly which files it owns. Start here:

1. Clone or copy this folder into a fresh project directory.
2. Open Claude Code in that directory. The root `CLAUDE.md` is auto-read and gives Claude the full project brief.
3. Tell Claude: **"Read `CLAUDE.md` and `agents/00-orchestrator.md`, then execute the orchestration plan."**
4. The orchestrator scaffolds the monorepo, then spawns Agents A/B/C/D in parallel, then runs Agent E to integrate.

Skim `CLAUDE.md` first if you want to understand the work split before kicking it off.

## Overview

This bundle contains a **high-fidelity HTML design reference** for a Newsroom article detail page. The end goal is a **Next.js application** that fetches structured JSON from a **Drupal headless backend** and renders it through a fixed set of React components.

The design files here are **references, not production code**. They show intended layout, typography, color, and component decomposition. The task for the dev is to recreate them as a Next.js app whose components consume the JSON contract spelled out in `JSON_CONTRACT.md`.

## About the design files

- `Article Page.html` — the reference page, opens in any browser.
- `article-data.jsx` — a **mock JSON payload** matching the contract the Drupal endpoint should return. Treat this as the source of truth for field shape and naming.
- `article-components.jsx` — the design's React components, one per Drupal content block. Each component's root carries a `data-jsonblock="..."` attribute naming its Drupal field, so the mapping is visible in DevTools.
- `article-app.jsx` — wires everything together.
- `Article Page (standalone).html` — single-file bundled version, emailable / shareable / openable offline.

## Fidelity

**High-fidelity — replicate the prototype's visual design pixel-for-pixel.** All colors, typography, spacing, component layout, AND the floating dev-utility panel in the bottom-right are intentional and ship as-is. The Next.js implementation should be visually indistinguishable from `Article Page (standalone).html` opened in a browser.

Use:
- **Next.js** (App Router) with React Server Components for the article fetch
- **Drupal JSON:API** on the backend
- **CSS Modules** or **Tailwind** for styling (the inline styles in the prototype are for portability — port them, don't ship them as inline)
- **Google Fonts** loaded via `next/font` (Barlow Condensed, IBM Plex Sans, IBM Plex Serif, IBM Plex Mono)

## Replicate exactly

These pieces are part of the design and must ship in the production app:

- **Top utility bar** with the 3px amber top border
- **Logo wedge mark** (clip-path polygon) — not a simple square
- **Breadcrumb pill chips** on a paper-toned background
- **Hero media block** on the dark navy band with the play overlay
- **Amber title band** (`--accent`) wrapping title + dateline + summary + share row
- **Dark navy pull-quote band** with the 240px portrait column and 1px left border
- **Tag pills** as outlined accent-colored chips
- **Bottom-right floating utility stack** containing:
  - 56×56 "Back to top" tile (paper bg)
  - 56×68 "Live Chat" tile (accent bg, icon + 2-line label)
  - **Article Reference / Tweaks panel** (see next section)

## Article Reference panel (bottom-right)

This floating panel is part of the shipped UI. It contains two controls:

1. **"Show JSON mapping"** toggle — when on, adds a `show-json` class to `<body>`, which makes every component root with `data-jsonblock="..."` display a small dark label naming its Drupal field, plus a dashed outline. This is the dev/QA/editor affordance for verifying what content is rendering where.
2. **"Accent"** radio — swaps `--accent` between amber / emerald / cobalt / scarlet for theming previews.

### Implementation notes

- Every component root should keep its `data-jsonblock` attribute exactly as in the prototype. Search `article-components.jsx` for `data-jsonblock` — every value there must port over.
- The CSS that drives the overlay is in `Article Page.html`:
  ```css
  body.show-json [data-jsonblock]{ outline:1px dashed rgba(194,65,12,.5); outline-offset:-1px; }
  body.show-json [data-jsonblock]::before{
    content:attr(data-jsonblock);
    position:absolute; top:-1px; left:-1px; z-index:50;
    background:#0B1F3A; color:#F4F1EB;
    font-family:"IBM Plex Mono",monospace; font-size:10px; letter-spacing:.04em;
    padding:3px 7px; border-bottom-right-radius:4px;
    pointer-events:none;
  }
  ```
  Port verbatim. Toggle the class via React state in a client component that mounts the panel.
- Persist the toggle in `localStorage` so refreshes preserve the chosen mode.
- **Recommended gating:** show the panel only when `process.env.NEXT_PUBLIC_SHOW_DEV_PANEL === 'true'` (preview/staging) OR when the visitor is an authenticated Drupal editor. Don't ship it to anonymous production traffic unless that's the explicit intent.
- Visual spec for the panel itself lives in the prototype's `tweaks-panel.jsx` — copy that file as a reference for the panel chrome (glass-blur background, drag handle, close button, section dividers, segmented radio control). It does not need to support every control the prototype shipped — just the toggle + radio.

## Design tokens

```css
--ink:        #0B1F3A   /* primary navy — header, footer, pull-quote bg */
--ink-soft:   #1E3556
--paper:      #F4F1EB   /* page background */
--paper-2:    #ECE7DD
--rule:       #D5CFC2   /* hairline rules */
--body:       #1D2A40   /* body text */
--body-soft:  #475569
--accent:     #C2410C   /* title-band amber — swappable per the Tweaks panel */
--link:       #1F4F8F
```

**Fonts** (Google Fonts):
- `Barlow Condensed` 700/800 — display + headings (uppercase, condensed)
- `IBM Plex Sans` 400/500/600 — body
- `IBM Plex Serif` italic — dateline + pull-quote
- `IBM Plex Mono` — eyebrow / annotation labels

## Page structure (top → bottom)

| # | Component        | Drupal source                              |
|---|------------------|--------------------------------------------|
| 1 | `SiteHeader`     | Menu blocks (utility + primary nav) + region |
| 2 | `Breadcrumb`     | Breadcrumb block                           |
| 3 | `HeroMedia`      | `field_hero_media` (media reference)       |
| 4 | `ArticleHero`    | Title + summary + dateline + share         |
| 5 | `ArticleBody`    | `field_body` (paragraph collection)        |
| 5a |  `RichText`     | `paragraph--rich_text`                     |
| 5b |  `PullQuote`    | `paragraph--pull_quote`                    |
| 6 | `ContactBlock`   | `field_press_contact` (entity ref)         |
| 7 | `LegalNotes`     | `field_legal_notes` (string list)          |
| 8 | `TagList`        | `field_tags` (taxonomy term refs)          |
| 9 | `SiteFooter`     | Menu blocks + footer config block          |

The body is rendered by **iterating `field_body`** in order — each entry's `kind` field selects the right paragraph component. New paragraph types can be added by extending the discriminator.

## Component specs

### SiteHeader
- Utility bar: 44px tall, `#E9E5DC` bg, 3px `--accent` top border
- Utility items render with icon + label, gap 8, padding 0/18
- Region tag: `IBM Plex Mono` 11px, letter-spacing .1em, slightly darker chip `#D8D2C2`
- Main row: 88px tall, paper bg, `--rule` bottom border
- Logo: 46px wedge mark (clip-path polygon) + brand wordmark (Barlow Condensed 30px) + accent eyebrow
- Primary nav: Barlow Condensed 16px, uppercase, letter-spacing .03em, active item underlined

### Breadcrumb
- 52px row, paper bg, `--rule` bottom border
- Home icon link, then chevron-separated pill chips (`#E9E5DC` bg, 999px radius, 6/12 padding)
- Current item: muted color, may truncate with ellipsis

### HeroMedia
- Wrapper: `--ink` bg, full bleed
- Inner: max-width 1120, 40px gutters
- Aspect 16:9, striped placeholder texture (currently using a gradient + repeating-linear-gradient — swap for `<video>`/`<Image>`)
- Centered play button: 96px circle, 1.5px paper border, blurred dark inner fill

### ArticleHero (title band)
- Background: `--accent`, color `--paper`, padding 44/0 56
- Title: Barlow Condensed 800, `clamp(40px, 5.2vw, 72px)`, uppercase, max-width 920
- Dateline: IBM Plex Serif italic 15px, divider pipe between date and read-time
- Summary: 19px / line-height 1.55, max-width 780
- Share row: separated by 1px translucent rule (`rgba(244,241,235,.45)` top border, 22px padding); 40px square outlined icon buttons

### ArticleBody → RichText
- Container max-width 720, centered, paper bg
- Body 17px / 1.72
- `<strong>` in opening dateline cap; `<sup>` for footnote refs

### ArticleBody → PullQuote
- Full-bleed `--ink` band, padding 80/0
- 2-column grid: 240px portrait column + flex quote column, gap 56
- Left border (1px translucent) on the row, padding-left 24
- Portrait: 220px square, gradient placeholder, mono label
- Author block: name 600, title + org lighter, 14px / 1.5
- Quote: IBM Plex Serif 26px / 1.45, smart quotes around the string

### ContactBlock / LegalNotes / TagList
- Same max-width 720 column as body
- "For Further Information" heading: Barlow Condensed 22px, ink color
- Legal notes: 14px / 1.6, gap 12 between items
- Tags: 1.5px accent-color outlined pills, accent text, 999px radius

### SiteFooter
- `--ink` bg, paper text, 64/0/56 padding, 1280 max-width
- 4-column grid: Learn More / Useful Links / Partnerships / Social+Legal+Tagline
- Social row: 22px icons, 18 gap
- Tagline lockup: wedge mark + Barlow Condensed 22px primary line + mono 10px secondary

### FloatingUtils
- Fixed bottom-right column
- 56px "back to top" tile (paper bg)
- 56×68 "Live Chat" tile (accent bg, icon + 2-line label)

## Interactions

- Header utility links: standard `<a>` navigation
- Play button: opens video player (out of scope — render whatever the codebase uses)
- Share buttons: open respective share intents; `copy` button copies `window.location.href`
- Back-to-top: smooth scroll to 0
- Live Chat: opens chat widget (out of scope)
- **Article Reference panel** (bottom-right): part of the shipped UI — see the dedicated section above. Gated to preview/staging or authenticated editors.

## State

Article page is **mostly static**, server-rendered from the JSON payload. Client state is minimal:
- Share-copy success toast (transient)
- Video play state (delegated to player)
- Live Chat panel (delegated to widget)

For Next.js: render in a React Server Component, fetch the article via `fetch('/jsonapi/node/article/{id}?include=...')` with ISR or on-demand revalidation triggered by Drupal webhooks.

## Files

- `README.md` (this file) — design spec
- `CLAUDE.md` — **orchestrator brief read first by Claude Code** (auto-picked up at repo root)
- `JSON_CONTRACT.md` — TypeScript types + Drupal field mapping
- `COMPONENT_MAP.md` — component → field lookup
- `agents/00-orchestrator.md` — kickoff plan (parallel agent sequencing)
- `agents/A-drupal-backend.md` — Agent A prompt
- `agents/B-nextjs-scaffold.md` — Agent B prompt
- `agents/C-frontend-components.md` — Agent C prompt
- `agents/D-reference-panel.md` — Agent D prompt
- `agents/E-integration.md` — Agent E (integration & QA) prompt
- `Article Page.html` + `*.jsx` — the live prototype
- `Article Page (standalone).html` — single-file offline version

## Out of scope for this handoff

- Listing / index page for the newsroom
- Search, filtering, pagination
- Auth, gating, personalization
- Localization (the region pill is illustrative — wire to Next.js i18n)
- Analytics

Ask before adding pages, sections, or copy that aren't in these files.

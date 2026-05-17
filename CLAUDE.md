# CLAUDE.md — Orchestrator Brief

> **You are working from a design handoff.** This file is your single source of truth for what to build, how to split the work, and how to verify it. Read this end-to-end before doing anything else.

---

## What is this project?

A **headless CMS website** with two halves:

- **Backend:** Drupal 11 (local via DDEV) — models the content, exposes JSON:API.
- **Frontend:** Next.js 14+ (App Router, TypeScript, React Server Components) — fetches the JSON:API output, renders the article page **pixel-for-pixel** matching the bundled HTML prototype.

The reference design is `Article Page (standalone).html` — open it in a browser. The production app must look identical to that file when rendered against real Drupal data.

## Files in this handoff

| File                             | What it is                                                  |
|----------------------------------|-------------------------------------------------------------|
| `README.md`                      | Human-readable design spec — read this second.              |
| `JSON_CONTRACT.md`               | TypeScript types + Drupal field mapping. **Source of truth for the data contract.** |
| `COMPONENT_MAP.md`               | Component → field lookup table.                             |
| `Article Page.html`              | The live prototype (loads .jsx files).                      |
| `Article Page (standalone).html` | Single-file bundled version. Open this to view the design.  |
| `article-data.jsx`               | Sample JSON payload — matches `JSON_CONTRACT.md` exactly.   |
| `article-components.jsx`         | React components — port these to TSX.                       |
| `article-app.jsx`                | App wiring + dev panel state.                               |
| `tweaks-panel.jsx`               | Reference panel chrome — port to a Next.js client component.|
| `agents/00-orchestrator.md`      | **Start here** — sequencing & kickoff plan.                 |
| `agents/A-*.md` … `agents/E-*.md`| Per-agent prompts. Paste into parallel chats.               |

---

## Parallel work plan (TL;DR)

You'll run **five agents** across two phases:

```
Phase 1 — parallel (~4 agents at once)
  ┌─────────────────────────────────────────────────────────────┐
  │ Agent A  Drupal Backend       → JSON:API endpoint           │
  │ Agent B  Next.js Scaffold     → TS types + JSON:API adapter │
  │ Agent C  Frontend Components  → TSX article components      │
  │ Agent D  Reference Panel      → Dev affordance + theming    │
  └─────────────────────────────────────────────────────────────┘
              (B, C, D work against the mocked payload first)

Phase 2 — single agent
  ┌─────────────────────────────────────────────────────────────┐
  │ Agent E  Integration & QA     → Wire A→B, side-by-side check│
  └─────────────────────────────────────────────────────────────┘
```

**Boundary rules** (so the parallel agents don't collide):

- Agent A owns everything in `apps/drupal/` only.
- Agent B owns `apps/web/lib/`, `apps/web/types/`, `apps/web/app/news/[slug]/page.tsx`.
- Agent C owns `apps/web/components/article/**` and `apps/web/components/site/**`.
- Agent D owns `apps/web/components/dev/**` and `apps/web/lib/dev-flags.ts`.
- Only Agent E may modify files written by other agents.
- The shared **contract** is `apps/web/types/article.ts` (Agent B writes it; B/C/D import it).

---

## Target repo layout

```
<repo-root>/
├── README.md                       ← copy this handoff's README into here
├── CLAUDE.md                       ← copy this file
├── design_handoff_article_page/    ← keep the handoff in-tree for reference
├── apps/
│   ├── drupal/                     ← Agent A
│   │   ├── .ddev/
│   │   ├── config/sync/            ← exported config (content types etc.)
│   │   ├── web/                    ← Drupal docroot
│   │   └── composer.json
│   └── web/                        ← Agents B, C, D, E
│       ├── app/
│       │   ├── layout.tsx
│       │   └── news/[slug]/page.tsx
│       ├── components/
│       │   ├── article/            ← Agent C
│       │   ├── site/               ← Agent C
│       │   └── dev/                ← Agent D
│       ├── lib/
│       │   ├── drupal/             ← Agent B (fetch + adapter)
│       │   └── dev-flags.ts        ← Agent D
│       ├── types/article.ts        ← Agent B
│       ├── styles/                 ← Agent C (tokens.css, fonts)
│       ├── public/
│       ├── package.json
│       └── tsconfig.json
└── package.json                    ← workspaces root (pnpm or npm)
```

Use **pnpm workspaces** (or npm workspaces) so both apps live under one repo.

---

## Non-negotiables

1. **Visual parity.** Every section in the bundled HTML must render identically in Next.js, including the bottom-right Article Reference panel.
2. **Type-safe contract.** Components consume the `Article` type from `apps/web/types/article.ts`. No `any`. No untyped fetch.
3. **Sanitize HTML server-side.** The `rich_text` paragraph's `html` field must be sanitized by Drupal (e.g. with the Filtered HTML text format or a custom DOMPurify pass) — the frontend renders with `dangerouslySetInnerHTML` only on trusted input.
4. **Don't ship the dev panel to anonymous traffic.** Gate behind `NEXT_PUBLIC_SHOW_DEV_PANEL === 'true'` (or an editor auth check).
5. **No inline styles in production.** The prototype uses them for portability — port to CSS Modules (preferred) or Tailwind. Keep the design tokens centralized in `apps/web/styles/tokens.css`.

---

## How to kick off

Open **`agents/00-orchestrator.md`** and follow it. If you're the orchestrator agent, you run Phase 0 (scaffold), then spawn A/B/C/D in parallel, then run E.

If a user has dropped you straight into one agent's prompt (e.g. `agents/A-drupal-backend.md`), trust that file — it's self-contained for your slice.

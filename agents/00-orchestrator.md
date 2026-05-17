# Agent 00 — Orchestrator

You are the **orchestrator**. Your job is to scaffold the repo, then spawn parallel sub-agents and integrate their work. Do **not** implement the article components yourself — delegate.

## Phase 0 — Scaffold (you do this; ~15 min)

1. **Read context** (in this order, stop after each is understood):
   - `CLAUDE.md` (root of handoff)
   - `README.md`
   - `JSON_CONTRACT.md`
   - Open `Article Page (standalone).html` in a browser. Toggle the "Show JSON mapping" switch in the bottom-right panel. Take a screenshot for reference.

2. **Confirm prerequisites are installed** on the dev machine:
   - Docker Desktop (or Colima)
   - DDEV ≥ v1.23 — install via the official guide: <https://docs.ddev.com/en/stable/users/install/ddev-installation/>
   - Node ≥ 20, pnpm ≥ 9
   - Git

   If any are missing, install them before proceeding. Reference: <https://www.drupal.org/docs/getting-started/installing-drupal/install-drupal-using-ddev-for-local-development>

3. **Create the monorepo skeleton**:
   ```bash
   mkdir -p apps
   pnpm init
   # Add workspaces to root package.json:
   #   "workspaces": ["apps/*"]
   ```

4. **Copy the handoff into the repo** as a permanent reference:
   ```bash
   cp -r <path-to>/design_handoff_article_page ./design_handoff_article_page
   cp ./design_handoff_article_page/CLAUDE.md ./CLAUDE.md
   ```

5. **Commit the empty scaffold** so each sub-agent starts from the same baseline:
   ```bash
   git init && git add -A && git commit -m "chore: monorepo scaffold + design handoff"
   ```

## Phase 1 — Spawn parallel agents

Open four parallel chats (or sub-agent invocations). For each, paste the corresponding prompt file **as the first message** and let it run to completion. The four are independent — they do **not** depend on each other inside Phase 1.

| Agent | Prompt file                    | Working directory          |
|-------|--------------------------------|----------------------------|
| A     | `agents/A-drupal-backend.md`   | `apps/drupal/`             |
| B     | `agents/B-nextjs-scaffold.md`  | `apps/web/`                |
| C     | `agents/C-frontend-components.md` | `apps/web/`             |
| D     | `agents/D-reference-panel.md`  | `apps/web/`                |

> Each agent prompt names exactly which files it owns and which it must NOT modify. Trust those boundaries; if two agents both need to touch the same file, escalate to you.

### How B/C/D can work without A finished

Until Agent A is live, Agents B/C/D should consume the **mock payload** at `design_handoff_article_page/article-data.jsx` (port it to `apps/web/lib/drupal/mock-article.ts`). Set an env flag:

```
# apps/web/.env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
DRUPAL_BASE_URL=http://localhost  # set later when A is up
```

Phase 2 (Agent E) replaces the mock with real fetches.

## Phase 2 — Integration (you do this; ~30 min)

1. **Wait for all four Phase 1 agents to mark their work complete.** Each agent's exit criteria are in its prompt file.
2. **Run Agent E's prompt** (`agents/E-integration.md`) yourself, in this chat, in the repo root.
3. **Visual diff:** open `Article Page (standalone).html` and `http://localhost:3000/news/<sample-slug>` side-by-side. They must look identical. Fix any deltas before declaring done.
4. **Toggle "Show JSON mapping"** in the Next.js app — every `data-jsonblock` label must appear over the correct DOM region.

## What "done" means

- `pnpm --filter web dev` boots the Next.js app on :3000
- `ddev launch` boots the Drupal admin on the DDEV URL
- Visiting `/news/<slug>` renders the article page indistinguishably from the prototype
- Drupal's JSON:API returns content that successfully hydrates the React components
- The Article Reference panel works (JSON-mapping toggle + accent radio)
- All four accent presets (amber / emerald / cobalt / scarlet) cleanly recolor the title band and tag chips
- `pnpm --filter web typecheck` passes with zero `any`

If anything's unclear, re-read `CLAUDE.md` and `README.md`. Ask before adding pages, sections, or copy that aren't in the handoff.

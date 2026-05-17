# Agent E — Integration & QA

You are the **integration agent**. You run after Agents A, B, C, and D have all marked their work complete. You're free to touch any file in the repo to resolve seams between agents.

## Goal

Connect the live Drupal endpoint to the Next.js app, verify the rendered page matches `Article Page (standalone).html` pixel-for-pixel, fix any seams between agents, and produce a working end-to-end demo.

## Required reading

1. `design_handoff_article_page/CLAUDE.md`
2. Each agent's exit criteria checklist (in their respective prompt files)
3. `apps/drupal/HANDOFF.md` (written by Agent A)
4. `apps/web/lib/drupal/README.md` (written by Agent B)

## Steps

### 1. Verify each agent's exit criteria

For each of A/B/C/D, walk the exit-criteria checklist in their prompt file. Note any unchecked items. **Do not proceed until each is satisfied** — go back to the relevant agent if needed (or fix it yourself if it's a 5-minute item).

### 2. Wire live data

1. Edit `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_USE_MOCK_DATA=false
   DRUPAL_BASE_URL=https://meridian.ddev.site   # whatever Agent A's DDEV URL is
   NEXT_PUBLIC_SHOW_DEV_PANEL=true
   REVALIDATE_SECRET=<generate-one>
   ```
2. Boot both apps:
   ```bash
   # terminal 1
   cd apps/drupal && ddev start
   # terminal 2
   cd apps/web && pnpm dev
   ```
3. Visit `http://localhost:3000/news/<slug-from-Agent-A>`. Confirm a real article renders.

### 3. Visual parity sweep

Open the prototype and the live page side-by-side at 1440px wide. For each section, confirm a 1:1 match:

- [ ] Top utility bar (amber top border, items spacing, region pill)
- [ ] Logo lockup (wedge mark + wordmark + eyebrow)
- [ ] Primary nav (font, weight, letter-spacing, underline thickness on active)
- [ ] Breadcrumb pill chips (background, radius, spacing)
- [ ] Hero media (dark band, aspect 16:9, play button position/size)
- [ ] Title band (amber bg, Barlow Condensed title clamp, dateline italic, summary width, share row)
- [ ] Rich-text body (max-width 720, line-height 1.72, dateline cap with `<strong>`)
- [ ] Pull-quote band (dark navy, portrait column, left rule, serif quote at 26px/1.45)
- [ ] Contact / Legal / Tags column alignment
- [ ] Footer (4-column grid, social icons, tagline lockup)
- [ ] Floating utilities (back-to-top, live chat, reference panel) — z-stack correctly

Then toggle the dev panel's accent to **emerald**, **cobalt**, and **scarlet** in turn. Confirm each cleanly recolors the title band, share-row outlines, tag chips, and the dev panel's own accent — with no other elements affected.

### 4. JSON-mapping toggle sweep

Turn ON "Show JSON mapping". Confirm each block label appears at top-left of the correct DOM region:

```
block: site_header
block: breadcrumb
field_hero_media (media reference)
node: title + summary + dateline + share
field_body (paragraphs)
  paragraph: rich_text
  paragraph: pull_quote
  paragraph: rich_text
field_press_contact
field_legal_notes
field_tags
block: site_footer
```

If any label is missing or mispositioned, find the component in `apps/web/components/` and confirm its root element carries the `data-jsonblock` attribute. Agent C may have dropped it during the port — restore.

### 5. Smoke-test edge cases

For each, manually trigger by editing the article in Drupal then `revalidatePath`:

- [ ] Remove the press-contact reference → `ContactBlock` disappears, no layout collapse
- [ ] Empty the legal-notes field → section hides
- [ ] Remove all tags → `TagList` hides
- [ ] Remove the pull-quote paragraph → body renders rich-text only, no gap
- [ ] Add a second pull-quote → renders correctly with its own dark band

### 6. Revalidation

Trigger Agent B's revalidation endpoint manually:

```bash
curl -X POST "http://localhost:3000/api/revalidate?secret=<REVALIDATE_SECRET>&path=/news/<slug>"
```

Edit the article title in Drupal, hit the endpoint, refresh the Next.js page → new title appears without a full rebuild.

### 7. Type-check + build

```bash
pnpm --filter web typecheck
pnpm --filter web build
```

Both must pass with zero errors and zero `any` warnings.

### 8. Write the run-book

Create `RUNBOOK.md` at the repo root with:

- "How to start the project from scratch" (clone → install → ddev start → config import → pnpm dev)
- "How to add a new paragraph type" (Drupal bundle + adapter case + new TSX component + JSON-mapping label)
- "How to deploy" — stubbed sections for Drupal (Pantheon / Acquia / DDEV-Live) and Next.js (Vercel / self-host)
- "Common issues" — DDEV port conflicts, JSON:API CORS, ISR-not-revalidating

### 9. Final commit

```bash
git add -A
git commit -m "feat: wire Drupal JSON:API → Next.js article page, integration verified"
git tag v0.1.0
```

## Exit criteria

- [ ] Every checklist box in §3, §4, §5, §7 above is checked
- [ ] `pnpm --filter web build` succeeds
- [ ] `ddev start` + `pnpm --filter web dev` together produce a working article page
- [ ] Dev panel works in all four accent presets
- [ ] `RUNBOOK.md` exists and a fresh developer could clone + run by following it
- [ ] No `// @ts-expect-error` left behind
- [ ] No `console.log` left behind
- [ ] No unused mock-data imports in production paths (the mock module stays — gated by env)

## Escalation

If you find a contract mismatch (e.g. Agent A named a field differently than `JSON_CONTRACT.md`), the contract wins. Push the fix into Drupal config (or the adapter, if it's a one-line translation). Document the deviation in `RUNBOOK.md` so future devs know.

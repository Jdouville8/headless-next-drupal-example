# RUNBOOK — Meridian Newsroom

This repo was built from the `design_handoff_article_page` design handoff (`CLAUDE.md`, `README.md`, `JSON_CONTRACT.md` at the root). It is a two-half headless project: **Drupal 11** (DDEV) content backend + **Next.js 14 App Router** frontend rendering one article page from the Drupal JSON:API.

> **First-time setup?** Read `docs/SETUP_GUIDE.pdf` first — it's a focused 4-page walkthrough for a clean clone-and-run. This RUNBOOK is the longer reference. Regenerate the PDF after editing `docs/setup-guide.html`:
> ```bash
> "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer \
>   --print-to-pdf=docs/SETUP_GUIDE.pdf "file://$PWD/docs/setup-guide.html"
> ```

## Current state

- **Backend (`apps/drupal/`)** — provisioned. Drupal 11 on PHP 8.4 via DDEV. JSON:API + paragraphs + pathauto + the custom `meridian_path_filter` module are enabled. Sample article `nid=3`, slug `meridian-industrial-debuts-continental-logistics-program-next-generation-fleet-operators` is seeded and reachable at `https://meridian.ddev.site`.
- **Frontend (`apps/web/`)** — wired to live Drupal JSON:API. Adapter normalizes the JSON:API envelope into the `Article` shape declared in `apps/web/types/article.ts`. `pnpm typecheck` and `pnpm build` both pass clean with zero errors and zero warnings. The build pre-renders the static shell and SSRs `/news/[slug]` on demand.
- **Integration verified end-to-end** (Agent E):
  - Live page returns 200 against `https://meridian.ddev.site` JSON:API
  - All 11 `data-jsonblock` markers render in the right DOM regions
  - 5 edge-case mutations (missing press contact, empty legal notes, no tags, no pull-quote, double pull-quote) all return 200 with the expected adapter-normalized shape
  - `POST /api/revalidate?secret=&path=` invalidates the path cache and the next request returns the updated title

## Start the project from scratch

```bash
# 1. Prerequisites (one-time)
brew install node pnpm git ddev mkcert
mkcert -install   # installs the mkcert root CA into the system trust store

# 2. Clone
git clone <repo-url> design_handoff_article_page
cd design_handoff_article_page

# 3. Install JS dependencies (workspace root)
pnpm install

# 4. Bring up Drupal
cd apps/drupal
ddev start
ddev composer install
ddev drush si --existing-config -y           # installs from config/sync, enables meridian_path_filter
ddev drush scr scripts/seed-content.php       # seeds the sample article (nid=3)
# Admin: https://meridian.ddev.site/user/login — user `admin`, pw `admin`

# 5. Configure the frontend
cd ../web
cat > .env.local <<'EOF'
NEXT_PUBLIC_USE_MOCK_DATA=false
DRUPAL_BASE_URL=https://meridian.ddev.site
NEXT_PUBLIC_SHOW_DEV_PANEL=true
REVALIDATE_SECRET=$(openssl rand -hex 32 | tr -d '\n')
EOF

# 6. CRITICAL: export NODE_EXTRA_CA_CERTS in the SAME shell *before* `pnpm dev`
#    (see "Common issues" below for why .env.local is too late)
export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"

# 7. Run the dev server
pnpm dev
# → http://localhost:3000/news/meridian-industrial-debuts-continental-logistics-program-next-generation-fleet-operators
```

Open `Article Page (standalone).html` from the repo root in a second browser tab at the same window width (1440 px works best) for the side-by-side visual-parity check.

## Env vars

| Name | Default | Purpose |
|------|---------|---------|
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | When `true`, `getArticleBySlug` short-circuits to `lib/mock/article.ts` and ignores the slug. Set `false` to talk to Drupal. |
| `DRUPAL_BASE_URL` | `https://meridian.ddev.site` | Origin for JSON:API requests. Only consulted when mock mode is off. |
| `REVALIDATE_SECRET` | (required) | Shared secret for `POST /api/revalidate`. Generate a long random string for non-dev environments (`openssl rand -hex 32`). |
| `NEXT_PUBLIC_SHOW_DEV_PANEL` | `true` | Mounts the bottom-right Article Reference panel. Set `false` for production unless editor-only gating is added. |
| `NODE_EXTRA_CA_CERTS` | (shell-export) | Path to the mkcert root CA so Node's TLS layer trusts `https://*.ddev.site`. Must be exported **before** `pnpm dev`. |

## Repo layout

```
/                                  ← repo root (also the handoff dir)
├── CLAUDE.md                       Orchestrator brief
├── README.md                       Design spec
├── JSON_CONTRACT.md                Data contract (frontend source of truth)
├── COMPONENT_MAP.md                Component → field lookup
├── RUNBOOK.md                      This file
├── article-{data,components,app}.jsx  Prototype source (reference only)
├── tweaks-panel.jsx                Reference panel chrome (reference only)
├── Article Page*.html              Live + bundled prototypes (visual target)
├── agents/                         Per-agent prompts
├── apps/
│   ├── drupal/                     Drupal 11 backend (Agent A)
│   │   ├── .ddev/                  DDEV project config (project name: meridian)
│   │   ├── HANDOFF.md              Agent A's handoff: URLs, sample article, deviations
│   │   ├── composer.json
│   │   ├── config/sync/            Exported config; restore via `drush si --existing-config`
│   │   ├── scripts/seed-content.php  Seeds the sample article (nid=3)
│   │   └── web/
│   │       └── modules/custom/meridian_path_filter/   Custom path.alias filter
│   └── web/                        Next.js app (Agents B/C/D)
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── news/[slug]/page.tsx     RSC, calls getArticleBySlug
│       │   └── api/revalidate/route.ts  POST endpoint, secret-gated
│       ├── components/
│       │   ├── article/            HeroMedia, ArticleHero, ArticleBody (RichText, PullQuote), ContactBlock, LegalNotes, TagList, ShareRow
│       │   ├── site/               SiteHeader, Breadcrumb, SiteFooter, FloatingUtils, Icon
│       │   └── dev/                ArticleReferencePanel (client, dev-gated)
│       ├── lib/
│       │   ├── drupal/             client.ts, article.ts (adapter), jsonapi-types.ts, README.md
│       │   ├── mock/article.ts     Canonical mock matching article-data.jsx
│       │   └── dev-flags.ts        SHOW_DEV_PANEL
│       ├── styles/                 tokens.css, globals.css
│       ├── types/article.ts        Verbatim from JSON_CONTRACT.md
│       ├── next.config.mjs         remotePatterns whitelisting *.ddev.site
│       └── package.json
└── package.json / pnpm-workspace.yaml
```

## How to add a new paragraph type

When the editorial team needs a new body block (e.g. `image_gallery`, `data_callout`, `oembed`):

1. **Drupal bundle** — create a new paragraph bundle in `/admin/structure/paragraphs_type`, add its fields (e.g. an image field for a gallery). Add the new bundle to `node.article.field_body`'s allowed types. Export config: `ddev drush cex -y` and commit `apps/drupal/config/sync/`.
2. **Contract type** — extend the discriminated union in `apps/web/types/article.ts`:
   ```ts
   export type BodyBlock = RichTextBlock | PullQuoteBlock | ImageGalleryBlock;
   export type ImageGalleryBlock = { kind: "image_gallery"; images: { src: string; alt: string }[] };
   ```
3. **Adapter case** — in `apps/web/lib/drupal/article.ts`, add a new branch in `normalizeBody` matching `para.type === "paragraph--image_gallery"`. Add the bundle's fields to the `FIELDS` sparse-fieldset map at the top of the file, and add any new relationship to `INCLUDE`.
4. **Component** — create `apps/web/components/article/ImageGallery.tsx` (+ a co-located `.module.css`). The root element must carry `data-jsonblock="paragraph: image_gallery"` so the dev panel's JSON-mapping toggle keeps working.
5. **Renderer switch** — add the `case "image_gallery":` arm in `apps/web/components/article/ArticleBody.tsx`. TypeScript's exhaustiveness check blocks you until you do.
6. **Mock + design** — add an example in `apps/web/lib/mock/article.ts` and (for the prototype) in `article-data.jsx`. Verify the visual treatment side-by-side with the standalone HTML.

That's the full surface — no other code touches a paragraph type.

## Drupal → Next.js revalidation

```bash
SECRET=$(grep '^REVALIDATE_SECRET=' apps/web/.env.local | cut -d= -f2)
curl -X POST "http://localhost:3000/api/revalidate?secret=$SECRET&path=/news/<slug>"
```

The endpoint accepts `?path=` and/or `?tag=`. It returns:
- `401 { "error": "Invalid secret" }` if the secret doesn't match
- `400 { "error": "Provide ?path= or ?tag=" }` if neither is set
- `200 { "revalidated": true, ... }` on success

For automated revalidation on Drupal save, configure a Drupal webhook (`webhook` contrib module, or a custom `hook_ENTITY_TYPE_update`) that hits this endpoint on article publish/update. The webhook should send `path=/news/{node.path.alias}` so only the touched article gets invalidated.

## Deploying

### Frontend (Next.js)

**Vercel** (fastest path):
```bash
cd apps/web
vercel
# In dashboard:
#  - Root Directory: apps/web
#  - Install command: pnpm install --frozen-lockfile (run at repo root)
#  - Env vars: NEXT_PUBLIC_USE_MOCK_DATA, DRUPAL_BASE_URL, REVALIDATE_SECRET, NEXT_PUBLIC_SHOW_DEV_PANEL=false (in prod)
```

Gotchas:
- The `pnpm-workspace.yaml` at the root means Vercel needs the install command set at the workspace root, not in `apps/web`.
- The dev panel must be gated off (`NEXT_PUBLIC_SHOW_DEV_PANEL=false`) for anonymous traffic.
- `next/image` needs `remotePatterns` to include your production Drupal hostname — already configured for `*.ddev.site` in `next.config.mjs`; add your prod host before deploying.

**Self-host** (any Node ≥ 20 box):
```bash
pnpm install --frozen-lockfile
pnpm --filter web build
pnpm --filter web start
```
Terminate TLS at a reverse proxy (nginx/Caddy). If the proxy and Drupal are on the same internal network, set `DRUPAL_BASE_URL` to the internal origin so the SSR fetches don't egress to the public DNS.

### Backend (Drupal)

Common targets (stubs — each needs its own checklist):

- **Acquia Cloud** — push the repo to an Acquia Cloud git remote, then run `drush deploy` in the destination environment. Composer build runs on push. Set `JSONAPI` permissions on the live environment for the anonymous role (matches `apps/drupal/HANDOFF.md` §Anonymous permissions).
- **Pantheon** — `terminus` CLI, Drupal 11 upstream. Use a `pantheon.upstream.yml` if you want to retain the custom `meridian_path_filter` module — it must be re-enabled after the import.
- **DDEV-Live** — turnkey if you already use DDEV locally; export with `ddev export-db` then import on the remote.
- **Self-host** — LAMP stack + composer + drush. Source of truth is `apps/drupal/config/sync/`; deploy via `drush deploy`. Enable `meridian_path_filter` after deploy or the JSON:API path-alias filter returns a 500.

Whatever host you pick:
- `DRUPAL_BASE_URL` in the Next.js env must point at its public origin.
- The JSON:API resource list must be reachable from the Next.js runtime (firewall / VPC rules / SSO bypass for service-to-service).
- CORS: only matters for client-side fetches; the SSR path in this app doesn't cross-origin.

## Common issues

**`UNABLE_TO_VERIFY_LEAF_SIGNATURE` when Next.js fetches from `https://meridian.ddev.site`**
The DDEV cert is signed by your local mkcert CA, which Node doesn't know about by default. The fix is to export `NODE_EXTRA_CA_CERTS` **in the shell that launches `pnpm dev`**, _before_ Next.js starts:
```bash
export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
pnpm dev
```
Why putting it in `.env.local` doesn't work: Node reads `NODE_EXTRA_CA_CERTS` at process startup, during TLS module initialization. Next.js loads `.env.local` later, after Node's TLS layer has already been configured. The env file is consequently too late.

**DDEV port conflicts** — another running DDEV project (or a host Apache/Caddy) may have bound 80/443 to its router. `ddev poweroff` and `ddev start` your project, or override `router_http_port`/`router_https_port` in `.ddev/config.yaml`.

**JSON:API returns 500 with `'path' not found in the entity type`** — the custom `meridian_path_filter` module is disabled. JSON:API's SQL EntityQuery cannot filter the computed `path.alias` field of a node (long-standing Drupal core issue #2980054). The custom module intercepts the filter and rewrites it to `drupal_internal__nid`. Re-enable: `ddev drush en meridian_path_filter -y`. See `apps/drupal/HANDOFF.md` §Custom module.

**JSON:API returns 403 from Next.js** — anonymous role missing `View resource lists` / `Access JSON:API resource list`. Set in `/admin/people/permissions`. The full anonymous permission list is documented in `apps/drupal/HANDOFF.md` §Anonymous permissions granted.

**ISR not revalidating after a Drupal edit** — `/api/revalidate` was not called. The dev server (`pnpm dev`) returns `Cache-Control: no-store` and re-fetches every request, so revalidation is only visible in `pnpm build && pnpm start` or a hosted deploy. To verify the endpoint works in dev, mutate the article in Drupal, hit the endpoint, and refresh — the page picks up the new value. Verify your `REVALIDATE_SECRET` matches between caller and `apps/web/.env.local`; a 401 means a mismatch.

**Hero placeholder image vs. video prototype** — `article-data.jsx` (the prototype mock) ships a `kind: "video"` hero with a play button. The seeded Drupal article uses an `image` media bundle (placeholder JPG). The adapter handles both bundles transparently — the divergence is visual-only and intentional per `apps/drupal/HANDOFF.md` §Known deviations. To match the prototype exactly, seed a `media--video` (or `media--remote_video`) and point `field_hero_media` at it.

**Field-name deviations from `JSON_CONTRACT.md`** — Agent A diverged in three places (documented in `apps/drupal/HANDOFF.md` §Known deviations):
- `node--press_person.field_org` and `node--press_contact.field_org` were renamed to `field_organization` (adapter reads `field_organization`).
- `node--press_person.field_portrait_alt` was added (the adapter expects this for portrait alt text).
- Hero seeded as image only (see above).

**Tag links 404** — tags link to `/news/tag/<id>`, which isn't implemented as a route. Either stub `app/news/tag/[id]/page.tsx` or rewrite the link target in `components/article/TagList.tsx`.

**Date renders with wrong day at SSR vs CSR** — `formatDate` in `ArticleHero.tsx` is pinned to `timeZone: "UTC"`. If you change it, keep the timezone explicit to avoid hydration mismatches.

**Page renders but accent doesn't change** — the accent radio writes `--accent`, `--accent-2`, `--tag` to `document.documentElement.style`. Hard-coded hex values in `components/**/*.module.css` won't follow. Search for hex literals and replace with the token (`var(--accent)` etc.).

**`pnpm` command not found** — install via Homebrew (`brew install pnpm`) or `npm install -g pnpm`. Corepack is the official path but ships disabled in Homebrew's Node.

## Deviations from the original plan

- **Repo layout** — the orchestrator plan called for copying the handoff into a `design_handoff_article_page/` subdirectory. We work in-place: handoff files (`CLAUDE.md`, `README.md`, `JSON_CONTRACT.md`, etc.) sit at the repo root and are checked into git.
- **Field names (`field_org` → `field_organization`, `field_portrait_alt` added)** — see `apps/drupal/HANDOFF.md` §Known deviations. The adapter is the source of truth; Drupal config follows.
- **Hero bundle** — seeded as image only; the adapter supports image + video + remote_video bundles.
- **`path.alias` filter** — implemented via the custom `meridian_path_filter` module (see Common Issues above and Agent A's handoff). The orchestrator plan didn't anticipate the core SQL-EntityQuery limitation.

---

## Visual parity checklist (human walkthrough)

Open `Article Page (standalone).html` and `http://localhost:3000/news/meridian-industrial-debuts-continental-logistics-program-next-generation-fleet-operators` side-by-side at 1440 px wide. Walk through each item — these are the §3 + §4 + §5 items the agent loop could not verify without a browser.

### Section-by-section parity (Agent E §3)

- [ ] Top utility bar — amber top border, item spacing, region pill
- [ ] Logo lockup — wedge mark + wordmark + eyebrow
- [ ] Primary nav — font, weight, letter-spacing, underline thickness on active
- [ ] Breadcrumb pill chips — background, radius, spacing
- [ ] Hero media — dark band, aspect 16:9, play button position/size (note: prototype shows video; seeded article shows image — both layouts must match the dark-band container)
- [ ] Title band — amber bg, Barlow Condensed title clamp, dateline italic, summary width, share row
- [ ] Rich-text body — max-width 720, line-height 1.72, dateline cap with `<strong>`
- [ ] Pull-quote band — dark navy, portrait column, left rule, serif quote at 26 px / 1.45
- [ ] Contact / Legal / Tags column alignment
- [ ] Footer — 4-column grid, social icons, tagline lockup
- [ ] Floating utilities (back-to-top, live chat, reference panel) — z-stack correctly

### Accent recolor sweep (Agent E §3)

Toggle the dev panel's accent radio between **amber** (default), **emerald**, **cobalt**, and **scarlet**. For each:

- [ ] Title band background recolors
- [ ] Share-row outlines recolor
- [ ] Tag chip background recolors
- [ ] Dev panel's own accent badge recolors
- [ ] No other element bleeds (logo wedge, footer, body copy stay neutral)

### JSON-mapping toggle (Agent E §4)

Turn on "Show JSON mapping" in the dev panel. Confirm each label appears at the top-left of the correct DOM region:

- [ ] `block: site_header`
- [ ] `block: breadcrumb`
- [ ] `field_hero_media (media reference)`
- [ ] `node: title + summary + dateline + share`
- [ ] `field_body (paragraphs)` (outer)
- [ ] `paragraph: rich_text` (first body block)
- [ ] `paragraph: pull_quote` (middle body block)
- [ ] `paragraph: rich_text` (last body block)
- [ ] `field_press_contact`
- [ ] `field_legal_notes`
- [ ] `field_tags`
- [ ] `block: site_footer`

### Edge cases (Agent E §5 — visual-only assertions)

The data-shape mutations and 200-status checks for each of these were verified programmatically (drush + curl). The "no layout collapse" assertion needs a browser. To reproduce: mutate the article via drush (recipes are in this RUNBOOK's git history under the integration commit), hit `/api/revalidate?secret=&path=/news/<slug>`, and reload.

- [ ] Remove the press-contact reference → `ContactBlock` disappears, no layout collapse
- [ ] Empty the legal-notes field → `LegalNotes` section hides without a hole
- [ ] Remove all tags → `TagList` hides without a hole
- [ ] Remove the pull-quote paragraph → body renders rich-text only, no gap between paragraphs
- [ ] Add a second pull-quote → renders correctly with its own dark band

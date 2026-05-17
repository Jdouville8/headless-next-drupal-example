# RUNBOOK — Meridian Newsroom

This repo was built from the `design_handoff_article_page` design handoff (CLAUDE.md, README.md, JSON_CONTRACT.md at the root). It's a two-half headless project: **Drupal 11** content backend + **Next.js 14 App Router** frontend rendering one article page from the Drupal JSON:API.

## Current state

- **Frontend (`apps/web/`)** — fully built. Renders end-to-end against a mock article payload (`apps/web/lib/mock/article.ts`). Build, typecheck, and runtime are all green.
- **Drupal backend (`apps/drupal/`)** — **not yet provisioned**. The adapter (`apps/web/lib/drupal/article.ts`) has a complete JSON:API → `Article` normalizer that will activate the moment `NEXT_PUBLIC_USE_MOCK_DATA=false` and `DRUPAL_BASE_URL` is reachable. See "Standing up Drupal later" below.

## Start the project from scratch

```bash
# 1. Install prerequisites (one-time)
#    - Node ≥ 20, Git, pnpm ≥ 9
brew install node pnpm git

# 2. Clone (or you're already inside the repo if you ran the handoff plan)
cd /path/to/design_handoff_article_page

# 3. Install dependencies
pnpm install

# 4. Copy env template
cp apps/web/.env.local.example apps/web/.env.local
# Defaults are fine — they ship in mock mode with the dev panel enabled.

# 5. Run the dev server
pnpm dev
#    → http://localhost:3000
#    Any slug resolves to the mock article: /news/anything works.

# Optional checks
pnpm typecheck     # tsc --noEmit, must be clean
pnpm build         # next build, must succeed
```

The page should render visually indistinguishable from `Article Page (standalone).html` (open that file in any browser side-by-side to compare).

## Env vars

| Name | Default | Purpose |
|------|---------|---------|
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | When `true`, `getArticleBySlug` short-circuits to `lib/mock/article.ts` and ignores the slug. Set `false` once Drupal is live. |
| `DRUPAL_BASE_URL` | `https://meridian.ddev.site` | Origin for JSON:API requests. Only consulted when mock mode is off. |
| `REVALIDATE_SECRET` | (required) | Shared secret for `POST /api/revalidate`. Generate a long random string for non-dev environments. |
| `NEXT_PUBLIC_SHOW_DEV_PANEL` | `true` | Mounts the bottom-right Article Reference panel. Set `false` for production unless editor-only gating is added. |

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
│   ├── web/                        Next.js app — built
│   │   ├── app/
│   │   │   ├── layout.tsx          next/font loaders, global CSS
│   │   │   ├── page.tsx            redirects / → /news/<placeholder>
│   │   │   ├── news/[slug]/page.tsx  Server Component, calls getArticleBySlug
│   │   │   └── api/revalidate/     POST endpoint, secret-gated
│   │   ├── components/
│   │   │   ├── article/            HeroMedia, ArticleHero, ArticleBody (RichText, PullQuote), ContactBlock, LegalNotes, TagList, ShareRow, index.ts
│   │   │   ├── site/               SiteHeader, Breadcrumb, SiteFooter, FloatingUtils, Icon, site-data.ts
│   │   │   └── dev/                ArticleReferencePanel (client, dev-gated)
│   │   ├── lib/
│   │   │   ├── drupal/             client.ts, article.ts (adapter), jsonapi-types.ts, README.md
│   │   │   ├── mock/article.ts     Canonical mock matching article-data.jsx
│   │   │   └── dev-flags.ts        SHOW_DEV_PANEL
│   │   ├── styles/                 tokens.css, globals.css
│   │   ├── types/article.ts        Verbatim from JSON_CONTRACT.md
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── drupal/                     Not yet created — see below
└── package.json / pnpm-workspace.yaml
```

## How to add a new paragraph type

When the editorial team needs a new body block (e.g. `image_gallery`, `data_callout`, `oembed`):

1. **Drupal** — add a new `paragraph--<kind>` bundle with its fields. Allow it on `node.article.field_body`.
2. **Contract** — extend the discriminated union in `apps/web/types/article.ts`:
   ```ts
   export type BodyBlock = RichTextBlock | PullQuoteBlock | ImageGalleryBlock;
   export type ImageGalleryBlock = { kind: "image_gallery"; images: { src: string; alt: string }[] };
   ```
3. **Adapter** — in `apps/web/lib/drupal/article.ts`, add the JSON:API → block-shape branch inside the paragraph mapper.
4. **Component** — create `apps/web/components/article/ImageGallery.tsx` with a co-located `.module.css`. Make sure the root carries `data-jsonblock="paragraph: image_gallery"`.
5. **Switch** — add the `case "image_gallery":` arm to `ArticleBody.tsx`. TypeScript's exhaustiveness check will block you until you do.
6. **Mock + design** — extend `article-data.jsx` and `lib/mock/article.ts` with an example; verify the visual treatment matches the design.

That's the full surface — no other code touches a paragraph type.

## Standing up Drupal later (Agent A, deferred)

The orchestration plan included a full Drupal/DDEV provisioning agent (`agents/A-drupal-backend.md`) that was deferred from this build to keep the loop tight. To run it now:

```bash
# Prereqs: Docker Desktop running, DDEV ≥ 1.23 installed
cd apps/
mkdir drupal && cd drupal
ddev config --project-type=drupal11 --project-name=meridian --docroot=web
ddev start
ddev composer create drupal/recommended-project
ddev composer require drupal/paragraphs drupal/jsonapi_extras drupal/pathauto
ddev drush site:install -y --account-name=admin --account-pass=admin
ddev drush en -y jsonapi jsonapi_extras paragraphs entity_reference_revisions media media_library pathauto token field_ui taxonomy
```

Then model the content types per `agents/A-drupal-backend.md` §3 (`article`, `press_person`, `press_contact`, taxonomy `article_tags`, paragraph types `rich_text` + `pull_quote`) and seed one node matching `article-data.jsx`. Field machine names must match `JSON_CONTRACT.md` exactly — the adapter resolves them by name, not position.

After seeding:

```bash
# Wire the frontend to live data
echo "NEXT_PUBLIC_USE_MOCK_DATA=false"       >  apps/web/.env.local
echo "DRUPAL_BASE_URL=https://meridian.ddev.site" >> apps/web/.env.local
echo "REVALIDATE_SECRET=$(openssl rand -hex 32)" >> apps/web/.env.local
echo "NEXT_PUBLIC_SHOW_DEV_PANEL=true"        >> apps/web/.env.local

pnpm dev
# Visit /news/<your-seeded-slug>
```

The adapter resolves nodes by `path.alias` (the field is `attributes.path.alias = "/news/<slug>"` in JSON:API). If your seeded node uses a different routing scheme, swap the filter in `apps/web/lib/drupal/article.ts` (`buildQuery`).

### Drupal → frontend revalidation

```bash
# Manually warm the cache for a specific path
curl -X POST "http://localhost:3000/api/revalidate?secret=$REVALIDATE_SECRET&path=/news/<slug>"
```

For automatic revalidation, configure a Drupal webhook (e.g. via the `webhook` contrib or a custom hook on `hook_ENTITY_TYPE_update`) that calls this endpoint on article publish/update.

## Deploying

### Frontend (Next.js)

**Vercel** (fastest path):
```bash
cd apps/web
vercel  # follow prompts; set the four env vars in the dashboard
```

Vercel auto-detects Next.js. The `pnpm-workspace.yaml` at the root means you'll want to set the "Root Directory" to `apps/web` in Vercel's project settings, and add a build install command of `pnpm install --frozen-lockfile` at the repo root.

**Self-host** (any Node ≥ 20 box):
```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start  # or pnpm --filter web start
```

Put it behind a reverse proxy (nginx/Caddy) terminating TLS.

### Drupal

Once `apps/drupal/` exists, common targets:

- **Acquia Cloud** — push to a managed Drupal stack; works with the standard Acquia BLT or DevDesktop flow.
- **Pantheon** — `terminus` CLI, the Drupal 11 upstream is available.
- **DDEV-Live** — turnkey if you already use DDEV locally.
- **Self-host** — LAMP stack + composer + drush. The exported config in `apps/drupal/config/sync/` is the source of truth; deploy via `drush deploy`.

Whatever host you pick, set `DRUPAL_BASE_URL` in the Next.js env to its public origin and ensure:
- The JSON:API resource list is reachable from the Next.js server (firewall / SSO bypass for service-to-service).
- CORS allows the Next.js origin (`Access-Control-Allow-Origin`) — only matters for client-side fetches; Server Components don't trigger CORS.

## Common issues

**`pnpm` command not found** — install via Homebrew (`brew install pnpm`) or `npm install -g pnpm`. Corepack is the official path but ships disabled with Homebrew's Node.

**Build fails with `react-hooks/rules-of-hooks` on a non-hook function** — ESLint reserves the `useFoo` naming convention for React hooks. Rename helper functions that start with `use` (e.g. `useMock` → `isMockMode`).

**Dev panel shows in production** — flip `NEXT_PUBLIC_SHOW_DEV_PANEL=false` in the production env. The component short-circuits to `null` on the gate; double-gated by `app/news/[slug]/page.tsx`.

**Page renders but accent doesn't change** — the accent radio writes `--accent`, `--accent-2`, `--tag` to `document.documentElement.style`. If a CSS Module specifies `color: #C2410C` instead of `color: var(--accent)`, the override won't apply. Search for hard-coded hex in `components/article/**/*.module.css` and replace with the token.

**Tag links 404** — tags link to `/news/tag/<id>`, which isn't implemented. Either stub the route (`app/news/tag/[id]/page.tsx`) or rewrite the link target in `components/article/TagList.tsx`.

**Date renders with wrong day at SSR vs CSR** — already fixed: `formatDate` in `ArticleHero.tsx` is pinned to `timeZone: "UTC"`. If you change the formatter, keep the timezone explicit to avoid hydration mismatches.

**DDEV port conflicts (Drupal)** — `ddev config` defaults to ports 80/443; if another service is bound there (Apache, Caddy) DDEV will fail to start. Set `router_http_port` / `router_https_port` in `.ddev/config.yaml`.

**JSON:API returns 403 from Next.js** — anonymous role needs `View resource lists` and `Access JSON:API resource list`. Set in `/admin/people/permissions`.

**ISR not revalidating** — verify `REVALIDATE_SECRET` matches between Drupal webhook and `apps/web/.env.local`. The route returns 401 on mismatch; check the Drupal webhook log.

## Deviations from the original plan

- **Agent A (Drupal) was deferred**, by request. The frontend ships mock-only. The contract is exercised end-to-end through the typed mock — once Drupal is provisioned with the field names from `JSON_CONTRACT.md`, the adapter handles it without code changes.
- **Repo layout** — the orchestrator plan called for copying the handoff into a `design_handoff_article_page/` subdirectory. We work in-place: the handoff files (CLAUDE.md, README.md, JSON_CONTRACT.md, etc.) sit at the repo root and are checked into git.
- **Slug resolution** — the contract example uses `/jsonapi/node/article/{uuid}`. The adapter resolves by `path.alias` filter instead, matching the natural `/news/<slug>` route shape. Swap if Drupal exposes a slug field directly.

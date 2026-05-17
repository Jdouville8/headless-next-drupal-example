# Agent B — Next.js Scaffold + Types + Drupal Adapter

You own:
- `apps/web/` scaffold (package.json, tsconfig, next.config, app/layout.tsx, app/news/[slug]/page.tsx)
- `apps/web/types/article.ts`
- `apps/web/lib/drupal/**`
- `apps/web/lib/mock/**`

**Do not touch:**
- `apps/web/components/article/**` (Agent C)
- `apps/web/components/site/**` (Agent C)
- `apps/web/components/dev/**` (Agent D)
- `apps/web/styles/**` beyond a placeholder `tokens.css` skeleton (Agent C owns the real values)

## Goal

Create the Next.js app shell, define the TypeScript contract from `JSON_CONTRACT.md`, build a JSON:API → `Article` adapter, and wire the article route. Until Agent A's Drupal endpoint is live, the route should hydrate from a mock module that mirrors `article-data.jsx`. A single env flag toggles between mock and live.

## Required reading

1. `design_handoff_article_page/CLAUDE.md`
2. `design_handoff_article_page/JSON_CONTRACT.md` — **this is your spec, copy types verbatim**
3. `design_handoff_article_page/article-data.jsx` — port to mock module
4. `design_handoff_article_page/COMPONENT_MAP.md`

## Steps

### 1. Scaffold Next.js

```bash
cd apps
pnpm create next-app@latest web --typescript --app --no-tailwind --eslint --src-dir=false --import-alias='@/*'
cd web
pnpm add @sindresorhus/slugify
pnpm add -D @types/node
```

Set Node engines and a `typecheck` script in `apps/web/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```

### 2. Write the types

Create `apps/web/types/article.ts` by copying the TypeScript block from `JSON_CONTRACT.md` verbatim. Export every type. This file is the **shared contract** — Agents C and D both import from it.

### 3. Mock data

Create `apps/web/lib/mock/article.ts` that exports a fully typed `Article` matching `article-data.jsx` field-for-field. Use this as the canonical type-system smoke test — if it doesn't compile, the types are wrong.

### 4. Drupal adapter

Create `apps/web/lib/drupal/client.ts`:

```ts
const BASE = process.env.DRUPAL_BASE_URL ?? "http://localhost";

export async function fetchJsonApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Accept: "application/vnd.api+json", ...(init?.headers ?? {}) },
    next: { revalidate: 60, tags: ["article"] },
  });
  if (!res.ok) throw new Error(`JSON:API ${res.status} ${path}`);
  return res.json();
}
```

Create `apps/web/lib/drupal/article.ts` with:

```ts
export async function getArticleBySlug(slug: string): Promise<Article | null>;
```

Implementation:
1. If `process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'`, return the mock module's article (slug ignored).
2. Otherwise, query JSON:API using the recommended querystring from `JSON_CONTRACT.md` (include + sparse fields).
3. **Normalize** the JSON:API response (with its `data` / `relationships` / `included` indirection) into the flat `Article` shape. Resolve all references in one pass.
4. Handle edge cases per `JSON_CONTRACT.md` "Validation & edge cases" section. Return `null` on 404.

### 5. Revalidation route

Create `apps/web/app/api/revalidate/route.ts`:

```ts
// POST /api/revalidate?secret=xxx&path=/news/foo
```

Use `revalidatePath` and `revalidateTag('article')`. Guard with a shared secret from env.

### 6. Article route shell

Create `apps/web/app/news/[slug]/page.tsx` as a Server Component. It must:

1. Call `getArticleBySlug(params.slug)`.
2. If null, call `notFound()`.
3. Render in this exact order, importing from the namespaces Agents C and D own:

```tsx
import { SiteHeader, Breadcrumb, HeroMedia, ArticleHero, ArticleBody, ContactBlock, LegalNotes, TagList, SiteFooter, FloatingUtils } from "@/components/article";
import { ArticleReferencePanel } from "@/components/dev/ArticleReferencePanel";

export default async function Page({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();
  return (
    <>
      <SiteHeader />
      <Breadcrumb crumbs={article.attributes.breadcrumb} />
      <HeroMedia media={article.hero} />
      <ArticleHero data={article} />
      <ArticleBody blocks={article.body} />
      {article.contact && <ContactBlock contact={article.contact} />}
      {article.legal.length > 0 && <LegalNotes notes={article.legal} />}
      {article.attributes.tags.length > 0 && <TagList tags={article.attributes.tags} />}
      <SiteFooter />
      <FloatingUtils />
      <ArticleReferencePanel />
    </>
  );
}
```

> **Stub the imports for now.** Have C and D add `index.ts` barrels under `components/article/` and `components/dev/`. Until those files exist, your route won't compile — that's fine; commit a `// @ts-expect-error: pending Agent C/D` if needed and unblock yourself with `pnpm typecheck` running clean against just the lib + types.

### 7. Env

Create `apps/web/.env.local.example`:

```
NEXT_PUBLIC_USE_MOCK_DATA=true
DRUPAL_BASE_URL=https://meridian.ddev.site
REVALIDATE_SECRET=change-me
NEXT_PUBLIC_SHOW_DEV_PANEL=true
```

### 8. Document for Agents C/D

Write `apps/web/lib/drupal/README.md` explaining:
- The Article type and where it lives
- How to import the mock for component-level dev (`import { mockArticle } from '@/lib/mock/article'`)
- That `data-jsonblock` attributes on component roots are mandatory (per `JSON_CONTRACT.md`)

## Exit criteria

- [ ] `pnpm --filter web dev` boots without error (page may show "missing components" until C/D land — that's fine)
- [ ] `pnpm --filter web typecheck` is clean on the `lib/`, `types/`, and `app/` directories
- [ ] `apps/web/types/article.ts` matches `JSON_CONTRACT.md` exactly
- [ ] `apps/web/lib/mock/article.ts` is a valid `Article` (TS compiler proves it)
- [ ] `apps/web/lib/drupal/article.ts` exports `getArticleBySlug(slug)` and respects the mock flag
- [ ] The revalidation route exists and is secret-gated
- [ ] `apps/web/lib/drupal/README.md` is written

## Do not

- Touch component files — Agent C owns those
- Touch the dev panel — Agent D owns it
- Add styling beyond the bare minimum (`globals.css` reset only)
- Use `any` anywhere

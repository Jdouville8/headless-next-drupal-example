# Agent C — Frontend Components

You own:
- `apps/web/components/article/**`
- `apps/web/components/site/**` (header, footer, breadcrumb — anything site-chrome)
- `apps/web/styles/**`
- Font loading via `next/font` in `apps/web/app/layout.tsx`

**Do not touch:**
- `apps/web/lib/**`, `apps/web/types/**` (Agent B)
- `apps/web/components/dev/**` (Agent D)
- `apps/web/app/news/**` (Agent B)

## Goal

Port `design_handoff_article_page/article-components.jsx` to typed Next.js TSX components, **pixel-for-pixel matching `Article Page (standalone).html`**. Move all styling from inline objects into CSS Modules with a shared token layer.

## Required reading

1. `design_handoff_article_page/CLAUDE.md`
2. `design_handoff_article_page/README.md` — **especially the "Component specs" section** (your spec)
3. `design_handoff_article_page/article-components.jsx` — **port this file**
4. `design_handoff_article_page/JSON_CONTRACT.md` — for prop types (import from `@/types/article` — Agent B owns it)
5. Open `Article Page (standalone).html` in a browser and reference it constantly. Toggle the dev panel to see the JSON-block labels — you must preserve every one.

## Steps

### 1. Tokens + globals

Create `apps/web/styles/tokens.css`:

```css
:root {
  --ink:        #0B1F3A;
  --ink-soft:   #1E3556;
  --paper:      #F4F1EB;
  --paper-2:    #ECE7DD;
  --rule:       #D5CFC2;
  --body:       #1D2A40;
  --body-soft:  #475569;
  --accent:     #C2410C;
  --accent-2:   #E0530C;
  --link:       #1F4F8F;
  --tag:        #C2410C;
}
```

Also create `apps/web/styles/globals.css` with a basic reset and the JSON-mapping overlay CSS (copy verbatim from `Article Page.html` — Agent D will toggle the `show-json` class on `<body>`):

```css
[data-jsonblock] { position: relative; }
body.show-json [data-jsonblock] {
  outline: 1px dashed rgba(194,65,12,.5); outline-offset: -1px;
}
body.show-json [data-jsonblock]::before {
  content: attr(data-jsonblock);
  position: absolute; top: -1px; left: -1px; z-index: 50;
  background: #0B1F3A; color: #F4F1EB;
  font-family: "IBM Plex Mono", monospace;
  font-size: 10px; letter-spacing: .04em;
  padding: 3px 7px; border-bottom-right-radius: 4px;
  pointer-events: none;
}
```

### 2. Fonts

In `apps/web/app/layout.tsx`, load fonts via `next/font/google`:

```ts
import { Barlow_Condensed, IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500","700","800"], variable: "--font-display" });
const sans    = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-sans" });
const serif   = IBM_Plex_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal","italic"], variable: "--font-serif" });
const mono    = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono" });
```

Apply the variables to `<html className={`${display.variable} …`}>`. In `tokens.css`, reference them: `font-family: var(--font-sans);` etc.

### 3. Port components

For each component in `article-components.jsx`, create a same-named TSX file with a co-located `.module.css`. Keep file names PascalCase.

```
components/site/
  SiteHeader.tsx + SiteHeader.module.css
  Breadcrumb.tsx + Breadcrumb.module.css
  SiteFooter.tsx + SiteFooter.module.css
  FloatingUtils.tsx + FloatingUtils.module.css
  Icon.tsx       ← pure SVG component, no CSS

components/article/
  HeroMedia.tsx
  ArticleHero.tsx
  ArticleBody.tsx        ← also exports RichText, PullQuote internals
  ContactBlock.tsx
  LegalNotes.tsx
  TagList.tsx
  index.ts               ← barrel — re-exports everything for Agent B's page
```

**Porting rules:**

- Every `data-jsonblock="..."` attribute in the source **must be preserved on the same component root**. Agent D's panel relies on these.
- Convert every inline-style object to a CSS Module class. No inline styles in production code (the `style={{}}` you'll keep is only for genuinely-dynamic values, e.g. `style={{ ['--accent' as any]: dynamicHue }}`).
- Use Server Components by default. Only add `"use client"` if a component genuinely needs interactivity (`FloatingUtils` for the back-to-top click handler does; `SiteHeader`, `Breadcrumb`, `HeroMedia`, `ArticleHero`, body components do NOT).
- Replace `dangerouslySetInnerHTML` rendering of HTML in `RichText` only when the input is server-sanitized (per `JSON_CONTRACT.md` — Drupal's Filtered HTML format covers this).
- Hero placeholder: when `media.kind === "image"` and `src` is present, render a `next/image` `<Image>`. Otherwise render the striped placeholder block as in the prototype.
- Pull-quote portrait: same pattern — if `author.portrait_src`, render `<Image>`, else placeholder.
- Tag pills are `next/link` to `/news/tag/<id>` (Agent E will wire the actual route or stub it).
- Share buttons: render with real share intents — `https://www.facebook.com/sharer/sharer.php?u=...`, `https://twitter.com/intent/tweet?...`, etc. The `copy` action needs `navigator.clipboard.writeText` so the share-row is a small client component.

### 4. Visual QA

After each component lands:
- Open the prototype's standalone HTML.
- Open `http://localhost:3000/news/<slug>` (Agent B's route — will use mock data).
- Compare the matching section side-by-side. Match spacing, colors, line-heights, and letter-spacing exactly.
- Verify the `data-jsonblock` label is visible at the expected position when the dev panel toggle is on.

### 5. Responsive

The reference is desktop-first. Add basic breakpoints:
- `≤ 1024px`: container padding 24px, primary nav still inline
- `≤ 768px`: utility bar collapses to a single "Menu" trigger (out of scope to implement fully — just stack the items vertically and shrink the title clamp), pull-quote portrait stacks above the quote, footer becomes 2-col then 1-col

Don't invent mobile UI that isn't in the prototype — note unresolved questions in a `// TODO(design):` comment for the orchestrator.

## Exit criteria

- [ ] Every component from `article-components.jsx` has a TSX counterpart with a CSS Module
- [ ] All `data-jsonblock` attributes are preserved on component roots
- [ ] No inline style objects in production code (other than CSS-custom-property pass-throughs)
- [ ] Fonts loaded via `next/font`, applied via CSS variables
- [ ] `apps/web/styles/tokens.css` + `globals.css` exist
- [ ] Page rendered against mock data is **visually indistinguishable** from `Article Page (standalone).html`
- [ ] `apps/web/components/article/index.ts` exports the public surface for Agent B's page

## Do not

- Build the dev panel (Agent D)
- Modify types or the adapter (Agent B)
- Add new content sections / copy not present in the prototype
- Use Tailwind utility classes (this codebase is CSS Modules)
- Hand-draw SVG illustrations or stylize the placeholders beyond what the prototype shows

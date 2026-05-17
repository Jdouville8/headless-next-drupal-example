# Agent D — Article Reference Panel + Theming

You own:
- `apps/web/components/dev/**`
- `apps/web/lib/dev-flags.ts`

**Do not touch:**
- `apps/web/components/article/**`, `apps/web/components/site/**` (Agent C)
- `apps/web/lib/drupal/**`, `apps/web/types/**` (Agent B)
- `apps/web/app/news/**` (Agent B mounts your panel; you don't touch the page)

## Goal

Port the floating bottom-right **Article Reference panel** from the prototype as a Next.js client component. It owns two controls — a JSON-mapping toggle and an accent radio — and applies them globally. The visual chrome of the panel (glass-blur background, drag handle, close button, segmented control styling) must match `tweaks-panel.jsx` from the prototype.

## Required reading

1. `design_handoff_article_page/CLAUDE.md`
2. `design_handoff_article_page/README.md` — **"Article Reference panel (bottom-right)"** section
3. `design_handoff_article_page/tweaks-panel.jsx` — port the chrome from this
4. `design_handoff_article_page/article-app.jsx` — see how the prototype wires `showJsonMapping` and `titleBandHue`
5. Open `Article Page (standalone).html` and open the panel — interact with both controls so you understand the behavior

## Behavior spec

### "Show JSON mapping" toggle
- When ON: add the `show-json` class to `<body>` (Agent C's `globals.css` already styles `body.show-json [data-jsonblock]`).
- When OFF: remove the class.
- Persist the value in `localStorage` under key `meridian:dev:showJsonMapping`.

### "Accent" radio
- Options: `amber` (default), `emerald`, `cobalt`, `scarlet`. Use the exact palette from `article-app.jsx`:

```ts
export const ACCENT_PRESETS = {
  amber:   { accent: "#C2410C", accent2: "#E0530C" },
  emerald: { accent: "#0E7C5C", accent2: "#12996F" },
  cobalt:  { accent: "#1F4F8F", accent2: "#2A6BB3" },
  scarlet: { accent: "#B91C1C", accent2: "#DC2626" },
} as const;
```

- When changed: set `--accent`, `--accent-2`, and `--tag` on `document.documentElement` (so the title band, share-row outlines, and tag chips recolor live).
- Persist under `meridian:dev:accent`.

### Gating
- Only mount the panel when `process.env.NEXT_PUBLIC_SHOW_DEV_PANEL === 'true'`.
- Render `null` otherwise. The gate lives in `apps/web/lib/dev-flags.ts`:

```ts
export const SHOW_DEV_PANEL =
  process.env.NEXT_PUBLIC_SHOW_DEV_PANEL === "true";
```

The `ArticleReferencePanel` component itself short-circuits on `!SHOW_DEV_PANEL`.

### Position
- Fixed, bottom-right, 16px gutter
- Stacks **above** Agent C's `FloatingUtils` (back-to-top + live chat tiles)
- Z-index `2147483646` (same as prototype)

## Steps

### 1. Create `apps/web/lib/dev-flags.ts` with the `SHOW_DEV_PANEL` constant above.

### 2. Build the panel chrome

Create `apps/web/components/dev/ArticleReferencePanel.tsx` and `ArticleReferencePanel.module.css`. Port the visual chrome from `tweaks-panel.jsx`:

- 280px wide, max-height `calc(100vh - 32px)`
- Backdrop-filter blur + saturate, translucent paper background
- Header row with title "Article Reference" + a small close button (×)
- Section divider with uppercase tracked label
- Toggle row + Segmented radio row

You don't need to support drag or the full Tweak control library — just toggle + radio. Keep the visual style faithful.

### 3. Build the two controls

Create small internal sub-components (do not re-export them):

- `<DevToggle label value onChange />` — track 28×16, animated thumb, matches the prototype's `TweakToggle`.
- `<DevRadio label value options onChange />` — segmented control, matches `TweakRadio`. 2-3 option width caps apply; 4 options wrap to two rows is acceptable.

### 4. State + hydration

The panel is a **client component**. To avoid hydration flashes:

1. Render in a `useEffect`-initialized state. Initial render returns the defaults (`showJsonMapping: false`, `accent: "amber"`).
2. On mount, read both values from `localStorage` and apply.
3. Apply side effects (body class, CSS vars) whenever values change.

```tsx
"use client";
import { useEffect, useState } from "react";
import { SHOW_DEV_PANEL } from "@/lib/dev-flags";
import { ACCENT_PRESETS } from "./accent-presets";

type Accent = keyof typeof ACCENT_PRESETS;

export function ArticleReferencePanel() {
  if (!SHOW_DEV_PANEL) return null;
  const [showJson, setShowJson] = useState(false);
  const [accent, setAccent] = useState<Accent>("amber");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setShowJson(localStorage.getItem("meridian:dev:showJsonMapping") === "true");
    setAccent((localStorage.getItem("meridian:dev:accent") as Accent) || "amber");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.body.classList.toggle("show-json", showJson);
    localStorage.setItem("meridian:dev:showJsonMapping", String(showJson));
  }, [showJson, ready]);

  useEffect(() => {
    if (!ready) return;
    const preset = ACCENT_PRESETS[accent];
    document.documentElement.style.setProperty("--accent", preset.accent);
    document.documentElement.style.setProperty("--accent-2", preset.accent2);
    document.documentElement.style.setProperty("--tag", preset.accent);
    localStorage.setItem("meridian:dev:accent", accent);
  }, [accent, ready]);

  if (!ready) return null;
  return (/* render panel */);
}
```

### 5. Close behavior

The × button collapses the panel to a small pill icon in the bottom-right. Clicking the pill restores the full panel. Persist the collapsed/expanded state too (`meridian:dev:panelOpen`).

### 6. Export

`apps/web/components/dev/index.ts` re-exports `ArticleReferencePanel`. Agent B already imports it in `app/news/[slug]/page.tsx` — just confirm the path matches.

## Exit criteria

- [ ] `ArticleReferencePanel` mounts only when `NEXT_PUBLIC_SHOW_DEV_PANEL === "true"`
- [ ] Toggling "Show JSON mapping" adds/removes `show-json` on `<body>`; every `data-jsonblock` label appears over the correct DOM region
- [ ] Switching accent updates `--accent`, `--accent-2`, `--tag` instantly across the page
- [ ] Both settings persist across page reloads via `localStorage`
- [ ] Close button collapses the panel; restored on click of the collapsed pill
- [ ] No hydration warnings in the browser console
- [ ] Visually matches `tweaks-panel.jsx` chrome (blur, radius, padding, type scale)
- [ ] Z-index sits above `FloatingUtils` without overlapping the back-to-top/live-chat tiles (offset its bottom position by ~140px to clear them)

## Do not

- Touch components owned by C
- Touch types or the adapter
- Add controls not specified (no font-size slider, no light/dark toggle, no copy editor)
- Ship the panel to production without the env gate

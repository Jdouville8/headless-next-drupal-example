// components/dev/ArticleReferencePanel.tsx
//
// Floating bottom-right dev/QA affordance — ported from the prototype's
// `tweaks-panel.jsx` + `article-app.jsx`. Owns two controls:
//
//   - Show JSON mapping (toggle) — adds/removes `body.show-json`. Agent C's
//     globals.css interprets that class and the [data-jsonblock] overlay.
//   - Accent (segmented radio) — mutates --accent / --accent-2 / --tag on
//     <html> so the title band, share-row outlines, and tag chips recolor live.
//
// Both settings persist in localStorage. Initial render returns null so SSR
// markup and first client paint stay byte-identical — once mounted, the panel
// hydrates from storage and reveals.
//
// SHOW_DEV_PANEL is the defense-in-depth gate. The page-level mount already
// checks NEXT_PUBLIC_SHOW_DEV_PANEL too; if either is false the panel renders
// no DOM.

"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { SHOW_DEV_PANEL } from "@/lib/dev-flags";
import styles from "./ArticleReferencePanel.module.css";

// Hex pairs are the exact prototype values from `article-app.jsx`. Order in
// this object is also the order the segmented radio renders.
export const ACCENT_PRESETS = {
  amber: { accent: "#C2410C", accent2: "#E0530C" },
  emerald: { accent: "#0E7C5C", accent2: "#12996F" },
  cobalt: { accent: "#1F4F8F", accent2: "#2A6BB3" },
  scarlet: { accent: "#B91C1C", accent2: "#DC2626" },
} as const;

type Accent = keyof typeof ACCENT_PRESETS;
const ACCENT_KEYS = Object.keys(ACCENT_PRESETS) as Accent[];

const LS_SHOW_JSON = "meridian:dev:showJsonMapping";
const LS_ACCENT = "meridian:dev:accent";
const LS_OPEN = "meridian:dev:panelOpen";

function isAccent(v: string | null): v is Accent {
  return v != null && (ACCENT_KEYS as string[]).includes(v);
}

// Public entry point. The env gate is a thin wrapper so the heavy component
// below stays subject to react-hooks/rules-of-hooks — the early return for
// !SHOW_DEV_PANEL happens BEFORE any hook is declared.
export function ArticleReferencePanel() {
  if (!SHOW_DEV_PANEL) return null;
  return <ArticleReferencePanelInner />;
}

function ArticleReferencePanelInner() {
  // Defaults match the prototype's TWEAK_DEFAULTS so the first paint (before
  // localStorage rehydration) is identical to "fresh install" state. `ready`
  // gates the actual DOM output to avoid hydration mismatches — initial render
  // on both server and client returns null, then the effect hydrates and
  // re-renders with persisted values.
  const [showJson, setShowJson] = useState(false);
  const [accent, setAccent] = useState<Accent>("amber");
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  // Mount-only hydration. Reading localStorage inside the same effect that
  // flips `ready` means we never render with stale defaults — when `ready`
  // becomes true, the next render already sees the rehydrated values.
  useEffect(() => {
    try {
      const storedJson = localStorage.getItem(LS_SHOW_JSON);
      if (storedJson !== null) setShowJson(storedJson === "true");

      const storedAccent = localStorage.getItem(LS_ACCENT);
      if (isAccent(storedAccent)) setAccent(storedAccent);

      const storedOpen = localStorage.getItem(LS_OPEN);
      if (storedOpen !== null) setOpen(storedOpen !== "false");
    } catch {
      // localStorage can throw in private browsing on Safari; degrade silently.
    }
    setReady(true);
  }, []);

  // `body.show-json` side effect. Gated on `ready` so the initial defaults
  // don't transiently clear the class if someone else (a future feature) ever
  // sets it server-side. Persists on every user-driven change.
  useEffect(() => {
    if (!ready) return;
    document.body.classList.toggle("show-json", showJson);
    try {
      localStorage.setItem(LS_SHOW_JSON, String(showJson));
    } catch {
      /* no-op */
    }
  }, [showJson, ready]);

  // Accent side effect. Writes the three CSS vars on the root element — these
  // were declared by Agent C in tokens.css with the amber defaults, so this
  // is a runtime override rather than a fresh definition.
  useEffect(() => {
    if (!ready) return;
    const preset = ACCENT_PRESETS[accent];
    const root = document.documentElement;
    root.style.setProperty("--accent", preset.accent);
    root.style.setProperty("--accent-2", preset.accent2);
    root.style.setProperty("--tag", preset.accent);
    try {
      localStorage.setItem(LS_ACCENT, accent);
    } catch {
      /* no-op */
    }
  }, [accent, ready]);

  // Persist open/closed across reloads. The pill is just a re-open affordance,
  // not a hard close — the panel itself never unmounts while SHOW_DEV_PANEL.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LS_OPEN, String(open));
    } catch {
      /* no-op */
    }
  }, [open, ready]);

  // Block first paint to avoid a flash of default state. Both SSR and the
  // first client render return null, so React commits zero DOM until the
  // hydration effect resolves. No `suppressHydrationWarning` needed because
  // both trees are identical (empty).
  if (!ready) return null;

  if (!open) {
    return (
      <button
        type="button"
        className={styles.pill}
        aria-label="Open Article Reference panel"
        onClick={() => setOpen(true)}
      >
        <span className={styles.pillDot} aria-hidden="true" />
        Article Reference
      </button>
    );
  }

  return (
    <div
      className={styles.panel}
      role="region"
      aria-label="Article Reference dev panel"
    >
      <div className={styles.header}>
        <b className={styles.title}>Article Reference</b>
        <button
          type="button"
          className={styles.closeBtn}
          aria-label="Collapse Article Reference panel"
          onClick={() => setOpen(false)}
        >
          {"✕"}
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.section}>Dev Reference</div>
        <DevToggle
          label="Show JSON mapping"
          value={showJson}
          onChange={setShowJson}
        />
        <div className={styles.section}>Title band</div>
        <DevRadio<Accent>
          label="Accent"
          value={accent}
          options={ACCENT_KEYS}
          onChange={setAccent}
        />
      </div>
    </div>
  );
}

// ── DevToggle ───────────────────────────────────────────────────────────────
// Visual analogue of the prototype's TweakToggle: 32×18 track, 14×14 thumb,
// iOS-green ON state, 150ms translate.

function DevToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className={`${styles.row} ${styles.rowHorizontal}`}>
      <div className={styles.label}>
        <span>{label}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`${styles.toggle} ${value ? styles.toggleOn : ""}`}
        onClick={() => onChange(!value)}
      >
        <i className={styles.toggleThumb} aria-hidden="true" />
      </button>
    </div>
  );
}

// ── DevRadio ────────────────────────────────────────────────────────────────
// Segmented control analogue of TweakRadio. The prototype falls back to a
// <select> when option labels overflow; for this panel we only render the
// four short accent names ("amber", "emerald", "cobalt", "scarlet") — they
// fit on a single row, so we don't replicate the fallback path.

function DevRadio<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: readonly V[];
  onChange: (next: V) => void;
}) {
  const n = options.length;
  const idx = Math.max(
    0,
    options.findIndex((o) => o === value),
  );
  const thumbStyle: CSSProperties = {
    left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
    width: `calc((100% - 4px) / ${n})`,
  };

  // Clicks on a segment are equivalent to a tap-to-select on the prototype's
  // pointer-down handler — we don't replicate the drag-scrub interaction
  // because the panel only has discrete named options, not a numeric range.
  const onSegmentClick = (next: V) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (next !== value) onChange(next);
  };

  return (
    <div className={styles.row}>
      <div className={styles.label}>
        <span>{label}</span>
      </div>
      <div className={styles.seg} role="radiogroup" aria-label={label}>
        <div
          className={styles.segThumb}
          style={thumbStyle}
          aria-hidden="true"
        />
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={o === value}
            className={styles.segBtn}
            onClick={onSegmentClick(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

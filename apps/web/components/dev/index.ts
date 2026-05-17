// components/dev/index.ts
//
// Barrel — Agent B's page imports from `@/components/dev/ArticleReferencePanel`
// directly, so this re-export is provided as a convenience for any future
// dev-only affordances (e.g. a layout-debug grid overlay) that want to share
// the same import surface.
//
// Internal sub-components (`DevToggle`, `DevRadio`) intentionally are NOT
// re-exported — they're implementation detail of ArticleReferencePanel.

export { ArticleReferencePanel, ACCENT_PRESETS } from "./ArticleReferencePanel";

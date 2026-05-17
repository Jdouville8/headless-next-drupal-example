// lib/dev-flags.ts
//
// Single source of truth for Agent D's gate. The page-level mount also checks
// the same env var (defense-in-depth) but the panel component short-circuits
// itself on this constant so a stray import can never render the dev affordance
// to anonymous traffic in production.
//
// NEXT_PUBLIC_* is inlined at build time so this resolves to a literal boolean
// in the client bundle — dead-code elimination removes the panel entirely when
// the flag is false.

export const SHOW_DEV_PANEL =
  process.env.NEXT_PUBLIC_SHOW_DEV_PANEL === "true";

// types/article.ts
//
// Shared contract between the Drupal JSON:API adapter and the React components.
// Copied verbatim from `JSON_CONTRACT.md` — keep this file the single source of
// truth and update the markdown if the contract changes.

export type Article = {
  type: "node--article";
  id: string; // UUID
  attributes: ArticleAttributes;
  hero: HeroMedia;
  body: BodyBlock[]; // ordered paragraphs
  contact: PressContact | null;
  legal: string[]; // legal/footnote strings
  share: ShareTarget[]; // which share buttons to show
};

export type ArticleAttributes = {
  title: string;
  summary: string; // 1–2 sentence dek
  dateline_location: string; // e.g. "Cleveland, Oh."
  published_at: string; // ISO 8601
  read_minutes: number; // integer
  breadcrumb: Breadcrumb[]; // resolved server-side
  tags: Tag[];
};

export type Breadcrumb = {
  label: string;
  href?: string; // omit on current item
  icon?: "home"; // first crumb only
};

export type Tag = {
  id: string; // taxonomy term UUID or slug
  label: string;
};

// ─── Hero media ──────────────────────────────────────────────────────────
export type HeroMedia =
  | {
      kind: "image";
      src: string;
      srcset?: string;
      width: number;
      height: number;
      alt: string;
      caption?: string | null;
    }
  | {
      kind: "video";
      poster_src?: string;
      poster_alt: string;
      hls_src?: string;
      mp4_src?: string;
      duration_sec: number;
      caption?: string | null;
    };

// ─── Body blocks (paragraphs) ────────────────────────────────────────────
export type BodyBlock = RichTextBlock | PullQuoteBlock;

export type RichTextBlock = {
  kind: "rich_text";
  html: string; // sanitized server-side
};

export type PullQuoteBlock = {
  kind: "pull_quote";
  quote: string; // plain text, no markup
  author: {
    name: string;
    title: string;
    org: string;
    portrait_src?: string;
    portrait_alt: string;
  };
};

// ─── Press contact ───────────────────────────────────────────────────────
export type PressContact = {
  name: string;
  org: string;
  email: string;
  phone?: string | null;
};

// ─── Share ───────────────────────────────────────────────────────────────
export type ShareTarget = "facebook" | "x" | "linkedin" | "email" | "print" | "copy";

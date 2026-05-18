// lib/drupal/article.ts
//
// Public entry point for fetching a single Article. Two paths:
//
//   1. When NEXT_PUBLIC_USE_MOCK_DATA === 'true' (the default for this build),
//      the mock from `lib/mock/article.ts` is returned for any slug. This keeps
//      the route working before Drupal is wired up.
//
//   2. Otherwise, query Drupal's JSON:API with the include + sparse fieldset
//      recipe from `JSON_CONTRACT.md`, then normalize the envelope into the
//      flat `Article` shape via `normalizeArticle`.

import type {
  Article,
  BodyBlock,
  Breadcrumb,
  HeroMedia,
  PressContact,
  RichTextBlock,
  PullQuoteBlock,
  ShareTarget,
  Tag,
} from "@/types/article";
import { mockArticle } from "@/lib/mock/article";
import { fetchJsonApi, JsonApiError } from "./client";
import type {
  FileAttributes,
  ImageFieldMeta,
  JsonApiDocument,
  JsonApiId,
  JsonApiResource,
  NodeArticleAttributes,
  ParagraphPullQuoteAttributes,
  ParagraphRichTextAttributes,
} from "./jsonapi-types";

const INCLUDE = [
  "field_hero_media",
  "field_hero_media.field_media_image",
  "field_body",
  "field_body.field_author",
  "field_body.field_author.field_portrait",
  "field_body.field_author.field_portrait.field_media_image",
  "field_press_contact",
  "field_tags",
].join(",");

const FIELDS: Record<string, string> = {
  "fields[node--article]": [
    "title",
    "field_summary",
    "field_dateline_location",
    "field_publish_date",
    "field_read_minutes",
    "field_hero_media",
    "field_body",
    "field_press_contact",
    "field_legal_notes",
    "field_tags",
    "path",
  ].join(","),
  "fields[paragraph--rich_text]": "field_text",
  "fields[paragraph--pull_quote]": "field_quote,field_author",
};

const DEFAULT_SHARE: ShareTarget[] = ["facebook", "x", "linkedin", "email", "print", "copy"];

function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

function buildQuery(slug: string): string {
  const params = new URLSearchParams();
  params.set("filter[path][condition][path]", "path.alias");
  params.set("filter[path][condition][value]", `/news/${slug}`);
  params.set("include", INCLUDE);
  for (const [k, v] of Object.entries(FIELDS)) params.set(k, v);
  return params.toString();
}

/**
 * Fetch an article by its URL slug. Returns `null` if not found.
 *
 * In mock mode any slug returns the canonical `mockArticle`.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (isMockMode()) return mockArticle;

  const path = `/jsonapi/node/article?${buildQuery(slug)}`;
  try {
    const doc = await fetchJsonApi<JsonApiDocument<JsonApiResource<NodeArticleAttributes>>>(path);
    if (doc.errors && doc.errors.length > 0) return null;
    const data = Array.isArray(doc.data) ? doc.data[0] : doc.data;
    if (!data) return null;
    return normalizeArticle(data, doc.included ?? []);
  } catch (err) {
    if (err instanceof JsonApiError && err.status === 404) return null;
    throw err;
  }
}

// ─── Normalization ───────────────────────────────────────────────────────

type IncludedIndex = Map<string, JsonApiResource>;

function indexIncluded(included: JsonApiResource[]): IncludedIndex {
  const idx: IncludedIndex = new Map();
  for (const r of included) idx.set(`${r.type}:${r.id}`, r);
  return idx;
}

function resolve(idx: IncludedIndex, ref: JsonApiId | null | undefined): JsonApiResource | null {
  if (!ref) return null;
  return idx.get(`${ref.type}:${ref.id}`) ?? null;
}

function isRef(value: unknown): value is JsonApiId {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "id" in value &&
    typeof (value as { type: unknown }).type === "string" &&
    typeof (value as { id: unknown }).id === "string"
  );
}

function relRef(
  resource: JsonApiResource,
  field: string,
): JsonApiId | JsonApiId[] | null | undefined {
  return resource.relationships?.[field]?.data;
}

function singleRef(resource: JsonApiResource, field: string): JsonApiId | null {
  const v = relRef(resource, field);
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function multiRef(resource: JsonApiResource, field: string): JsonApiId[] {
  const v = relRef(resource, field);
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function richTextValue(
  v: ParagraphRichTextAttributes["field_text"] | NodeArticleAttributes["field_summary"],
): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    if ("processed" in v && typeof v.processed === "string") return v.processed;
    if ("value" in v && typeof v.value === "string") return v.value;
  }
  return "";
}

/**
 * Like `richTextValue`, but prefers the raw `value` over `processed`. Use this
 * for fields the contract requires as plain text — Drupal's `plain_text`
 * filter wraps the processed output in `<p>` and HTML-entity-encodes
 * characters like apostrophes, which we don't want leaking into UI strings.
 *
 * Defensive: if the stored `value` itself has been wrapped in a single
 * `<p>...</p>` (e.g. because the format was silently switched to one that
 * runs filter_autop, or because an upstream editor pasted markup into a
 * plain-text-contract field), we strip the wrapper and decode the common
 * entity set Drupal commonly emits. That way the rendered string is the
 * plain text the contract promised.
 */
function plainTextValue(
  v: ParagraphRichTextAttributes["field_text"] | NodeArticleAttributes["field_summary"],
): string {
  if (!v) return "";
  let s: string;
  if (typeof v === "string") {
    s = v;
  } else if (typeof v === "object" && v !== null) {
    if ("value" in v && typeof v.value === "string") {
      s = v.value;
    } else if ("processed" in v && typeof v.processed === "string") {
      s = v.processed;
    } else {
      return "";
    }
  } else {
    return "";
  }
  // Strip a single wrapping <p>...</p>. Anchored, so we won't gobble
  // mid-string <p>s.
  s = s.replace(/^\s*<p>([\s\S]*?)<\/p>\s*$/, "$1");
  return decodeHtmlEntities(s);
}

/**
 * Decode the small entity set Drupal commonly emits for plain-text values.
 * Order matters: numeric/hex entities first, then `&amp;` last among the
 * named ones so we don't accidentally double-decode entities like `&amp;lt;`.
 */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function legalNotesValue(v: NodeArticleAttributes["field_legal_notes"]): string[] {
  if (!v) return [];
  if (!Array.isArray(v)) return [];
  return v
    .map((entry) => (typeof entry === "string" ? entry : plainTextValue(entry)))
    .filter((s): s is string => typeof s === "string" && s.length > 0);
}

function fileUrl(file: JsonApiResource<FileAttributes> | null): string | undefined {
  if (!file) return undefined;
  const uri = file.attributes?.uri;
  if (!uri) return undefined;
  const raw = uri.url ?? uri.value;
  if (!raw) return undefined;
  // Drupal returns site-relative URLs; if a base is configured, prefix.
  const base = process.env.DRUPAL_BASE_URL;
  if (base && raw.startsWith("/")) return `${base.replace(/\/$/, "")}${raw}`;
  return raw;
}

function normalizeHero(
  hero: JsonApiResource | null,
  idx: IncludedIndex,
): HeroMedia {
  // Placeholder — keep layout from collapsing. See JSON_CONTRACT.md edge cases.
  if (!hero) {
    return {
      kind: "image",
      src: "",
      width: 16,
      height: 9,
      alt: "",
      caption: null,
    };
  }

  if (hero.type === "media--video" || hero.type.endsWith("--video") || hero.type === "media--remote_video") {
    const attrs = hero.attributes as Record<string, unknown> | undefined;
    const durationRaw = attrs?.field_duration_sec ?? attrs?.field_duration;
    const duration_sec = typeof durationRaw === "number" ? durationRaw : 0;
    const posterAltRaw = attrs?.field_poster_alt ?? attrs?.name;
    const caption =
      typeof attrs?.field_caption === "string"
        ? (attrs.field_caption as string)
        : null;
    const posterFile = resolve(idx, singleRef(hero, "field_media_poster")) as
      | JsonApiResource<FileAttributes>
      | null;
    return {
      kind: "video",
      poster_src: fileUrl(posterFile),
      poster_alt: typeof posterAltRaw === "string" ? posterAltRaw : "",
      duration_sec,
      caption,
    };
  }

  // Default: image-style media bundle.
  const imageRef = singleRef(hero, "field_media_image") ?? singleRef(hero, "thumbnail");
  const imageFile = resolve(idx, imageRef) as JsonApiResource<FileAttributes> | null;
  const meta = (hero.relationships?.field_media_image as
    | { data?: (JsonApiId & { meta?: ImageFieldMeta }) | null }
    | undefined)?.data?.meta;
  const attrs = hero.attributes as Record<string, unknown> | undefined;
  const captionRaw = attrs?.field_caption;
  return {
    kind: "image",
    src: fileUrl(imageFile) ?? "",
    width: typeof meta?.width === "number" ? meta.width : 16,
    height: typeof meta?.height === "number" ? meta.height : 9,
    alt: typeof meta?.alt === "string" ? meta.alt : "",
    caption: typeof captionRaw === "string" ? captionRaw : null,
  };
}

function normalizeBody(
  bodyRefs: JsonApiId[],
  idx: IncludedIndex,
): BodyBlock[] {
  const out: BodyBlock[] = [];
  for (const ref of bodyRefs) {
    const para = resolve(idx, ref);
    if (!para) continue;
    if (para.type === "paragraph--rich_text") {
      const block: RichTextBlock = {
        kind: "rich_text",
        html: richTextValue((para.attributes as ParagraphRichTextAttributes | undefined)?.field_text),
      };
      out.push(block);
      continue;
    }
    if (para.type === "paragraph--pull_quote") {
      const author = resolve(idx, singleRef(para, "field_author"));
      const authorAttrs = (author?.attributes ?? {}) as Record<string, unknown>;
      const portraitRef = author ? singleRef(author, "field_portrait") : null;
      const portrait = resolve(idx, portraitRef);
      const portraitImageRef = portrait ? singleRef(portrait, "field_media_image") : null;
      const portraitFile = resolve(idx, portraitImageRef) as
        | JsonApiResource<FileAttributes>
        | null;
      const quoteRaw = (para.attributes as ParagraphPullQuoteAttributes | undefined)?.field_quote;
      const block: PullQuoteBlock = {
        kind: "pull_quote",
        quote: typeof quoteRaw === "string" ? quoteRaw : plainTextValue(quoteRaw),
        author: {
          name: stringOr(authorAttrs.title, ""),
          title: stringOr(authorAttrs.field_role, ""),
          org: stringOr(authorAttrs.field_organization, ""),
          portrait_src: fileUrl(portraitFile),
          portrait_alt: stringOr(authorAttrs.field_portrait_alt, ""),
        },
      };
      out.push(block);
      continue;
    }
    // Unknown paragraph type — skip. Adding a new BodyBlock variant will fail
    // the exhaustiveness check in the renderer until this is handled.
  }
  return out;
}

function stringOr(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function normalizeTags(refs: JsonApiId[], idx: IncludedIndex): Tag[] {
  const out: Tag[] = [];
  for (const ref of refs) {
    const term = resolve(idx, ref);
    if (!term) continue;
    const attrs = term.attributes as Record<string, unknown> | undefined;
    out.push({
      id: term.id,
      label: stringOr(attrs?.name, ""),
    });
  }
  return out;
}

function normalizeContact(
  contact: JsonApiResource | null,
): PressContact | null {
  if (!contact) return null;
  const a = (contact.attributes ?? {}) as Record<string, unknown>;
  return {
    name: stringOr(a.title ?? a.field_name, ""),
    org: stringOr(a.field_organization, ""),
    email: stringOr(a.field_email, ""),
    phone: typeof a.field_phone === "string" ? a.field_phone : null,
  };
}

function normalizeBreadcrumb(attrs: NodeArticleAttributes, title: string): Breadcrumb[] {
  // If Drupal's response carries a breadcrumb directly, trust it.
  if (Array.isArray(attrs.breadcrumb) && attrs.breadcrumb.length > 0) {
    return attrs.breadcrumb;
  }
  // Otherwise build a minimal Home → Newsroom → Title trail.
  return [
    { label: "Home", href: "/", icon: "home" },
    { label: "Newsroom", href: "/news" },
    { label: title },
  ];
}

export function normalizeArticle(
  node: JsonApiResource<NodeArticleAttributes>,
  included: JsonApiResource[],
): Article {
  const idx = indexIncluded(included);
  const attrs: NodeArticleAttributes = node.attributes ?? {};
  const title = stringOr(attrs.title, "");
  const published = stringOr(attrs.field_publish_date ?? attrs.created, "");
  const readMinutesRaw = attrs.field_read_minutes;
  const read_minutes =
    typeof readMinutesRaw === "number" && Number.isFinite(readMinutesRaw) ? readMinutesRaw : 0;

  const hero = normalizeHero(resolve(idx, singleRef(node, "field_hero_media")), idx);
  const body = normalizeBody(multiRef(node, "field_body"), idx);
  const contact = normalizeContact(resolve(idx, singleRef(node, "field_press_contact")));
  const tags = normalizeTags(multiRef(node, "field_tags"), idx);
  const legal = legalNotesValue(attrs.field_legal_notes);

  return {
    type: "node--article",
    id: node.id,
    attributes: {
      title,
      summary: plainTextValue(attrs.field_summary),
      dateline_location: stringOr(attrs.field_dateline_location, ""),
      published_at: published,
      read_minutes,
      breadcrumb: normalizeBreadcrumb(attrs, title),
      tags,
    },
    hero,
    body,
    contact,
    legal,
    share: DEFAULT_SHARE,
  };
}

// Re-export for callers that need the raw guard
export { isRef };

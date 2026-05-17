// lib/drupal/jsonapi-types.ts
//
// Minimal local typings for the JSON:API envelope shape we consume from Drupal.
// Intentionally narrow — only what `getArticleBySlug` needs to normalize an
// article into the `Article` contract. No `any`.

export type JsonApiId = { type: string; id: string };

export type JsonApiRelationship = {
  data: JsonApiId | JsonApiId[] | null;
};

export type JsonApiResource<TAttributes extends Record<string, unknown> = Record<string, unknown>> =
  {
    type: string;
    id: string;
    attributes?: TAttributes;
    relationships?: Record<string, JsonApiRelationship>;
    links?: Record<string, { href: string } | string | undefined>;
  };

export type JsonApiDocument<TPrimary extends JsonApiResource = JsonApiResource> = {
  data: TPrimary | TPrimary[] | null;
  included?: JsonApiResource[];
  links?: Record<string, { href: string } | string | undefined>;
  meta?: Record<string, unknown>;
  errors?: Array<{ status?: string; title?: string; detail?: string }>;
};

// ─── Drupal-specific attribute shapes we care about ──────────────────────

export type NodeArticleAttributes = {
  title?: string;
  field_summary?: string | { value: string; format?: string; processed?: string };
  field_dateline_location?: string;
  field_publish_date?: string;
  created?: string;
  field_read_minutes?: number;
  field_legal_notes?: string[] | Array<{ value: string; format?: string; processed?: string }>;
  // breadcrumb may come in via meta or a sibling endpoint — we accept both.
  breadcrumb?: Array<{ label: string; href?: string; icon?: "home" }>;
  path?: { alias?: string };
};

export type ParagraphRichTextAttributes = {
  field_text?: { value: string; format?: string; processed?: string } | string;
};

export type ParagraphPullQuoteAttributes = {
  field_quote?: string | { value: string };
};

export type MediaImageAttributes = {
  name?: string;
  field_media_image?: unknown;
};

export type FileAttributes = {
  uri?: { url?: string; value?: string };
  filename?: string;
  filemime?: string;
};

export type MediaImageRelationshipFile = {
  data?: JsonApiId;
};

export type ImageFieldMeta = {
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
};

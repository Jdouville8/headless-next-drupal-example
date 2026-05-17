# JSON Contract — Article page

This is the contract between the **Drupal backend** and the **Next.js frontend**. The shape below is what `GET /jsonapi/node/article/{uuid}?include=…` (with sparse fieldsets) should be normalized to before being passed into the page components.

> **Recommendation:** normalize the raw JSON:API response into this flatter shape inside a `lib/drupal/article.ts` adapter rather than passing JSON:API's `data/relationships/included` structure straight into components. Components stay agnostic of the transport.

---

## TypeScript types

```ts
// types/article.ts

export type Article = {
  type: "node--article";
  id: string;                              // UUID
  attributes: ArticleAttributes;
  hero: HeroMedia;
  body: BodyBlock[];                       // ordered paragraphs
  contact: PressContact | null;
  legal: string[];                         // legal/footnote strings
  share: ShareTarget[];                    // which share buttons to show
};

export type ArticleAttributes = {
  title: string;
  summary: string;                         // 1–2 sentence dek
  dateline_location: string;               // e.g. "Cleveland, Oh."
  published_at: string;                    // ISO 8601
  read_minutes: number;                    // integer
  breadcrumb: Breadcrumb[];                // resolved server-side
  tags: Tag[];
};

export type Breadcrumb = {
  label: string;
  href?: string;                           // omit on current item
  icon?: "home";                           // first crumb only
};

export type Tag = {
  id: string;                              // taxonomy term UUID or slug
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
  html: string;                            // sanitized server-side
};

export type PullQuoteBlock = {
  kind: "pull_quote";
  quote: string;                           // plain text, no markup
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
```

---

## Sample payload

A working sample lives at `article-data.jsx`. Open it as-is for a complete shape.

---

## Drupal mapping

| Frontend field            | Drupal source                                         | Notes |
|---------------------------|-------------------------------------------------------|-------|
| `id`                      | node UUID                                             | |
| `attributes.title`        | `node.title`                                          | |
| `attributes.summary`      | `field_summary` (long text, plain)                    | 1–2 sentences |
| `attributes.dateline_location` | `field_dateline_location` (string)               | e.g. "Cleveland, Oh." |
| `attributes.published_at` | `node.created` or `field_publish_date`                | Return ISO 8601 |
| `attributes.read_minutes` | `field_read_minutes` (integer)                        | Or compute via word-count on server |
| `attributes.breadcrumb`   | breadcrumb plugin                                     | Resolve to `[{label,href}]` |
| `attributes.tags`         | `field_tags` (taxonomy reference, multiple)           | Include label + id |
| `hero`                    | `field_hero_media` (media reference)                  | Bundle = image or video |
| `body`                    | `field_body` (paragraphs, multiple)                   | Preserve order |
| `body[].kind = rich_text` | `paragraph--rich_text` → `field_text` (formatted)     | Sanitize HTML server-side |
| `body[].kind = pull_quote`| `paragraph--pull_quote` → `field_quote`, `field_author` (entity ref) | Author = `node--person` or similar |
| `contact`                 | `field_press_contact` (entity reference)              | Bundle = `node--press_contact` |
| `legal`                   | `field_legal_notes` (long text, multiple)             | Render as paragraphs |
| `share`                   | site config + per-node override                       | Filter to allowed targets |

---

## JSON:API request example

```
GET /jsonapi/node/article/{uuid}
  ?include=field_hero_media,
           field_hero_media.field_media_image,
           field_body,
           field_body.field_author,
           field_press_contact,
           field_tags
  &fields[node--article]=title,field_summary,field_dateline_location,
           field_publish_date,field_read_minutes,field_hero_media,
           field_body,field_press_contact,field_legal_notes,field_tags
  &fields[paragraph--rich_text]=field_text
  &fields[paragraph--pull_quote]=field_quote,field_author
```

Sparse fieldsets keep the payload tight. The adapter then flattens it into the `Article` shape above.

---

## Validation & edge cases the frontend must handle

- `hero` missing → render a 16:9 placeholder block (don't crash, don't collapse the layout)
- `body` empty → show `summary` only, omit the body sections
- `pull_quote.author.portrait_src` missing → render a neutral placeholder tile
- `tags` empty → hide the TagList row entirely
- `contact` null → hide the ContactBlock
- `legal` empty array → hide the LegalNotes section
- `read_minutes` 0 or null → hide the read-time, keep the date
- `html` in rich-text must be **server-sanitized**; do not `dangerouslySetInnerHTML` raw editor output

---

## Caching & revalidation

- Recommended: ISR with on-demand revalidation
- Drupal triggers a webhook on publish/update → Next.js route handler calls `revalidatePath('/news/[slug]')`
- Tag-level invalidation (`revalidateTag('article:{uuid}')`) makes targeted clears cheap

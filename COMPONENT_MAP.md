# Component Map

Quick-lookup table from React component → Drupal field → props shape. Source of truth for both files is the prototype itself; this is just an index.

| Component        | File                          | Drupal field / source                  | Required props                                      | Optional props          |
|------------------|-------------------------------|----------------------------------------|-----------------------------------------------------|-------------------------|
| `SiteHeader`     | `article-components.jsx`      | menu blocks + region config            | —                                                   | —                       |
| `Breadcrumb`     | `article-components.jsx`      | breadcrumb plugin                      | `crumbs: Breadcrumb[]`                              | —                       |
| `HeroMedia`      | `article-components.jsx`      | `field_hero_media`                     | `media: HeroMedia`                                  | —                       |
| `ArticleHero`    | `article-components.jsx`      | title, summary, dateline, share        | `data: Article`                                     | —                       |
| `ArticleBody`    | `article-components.jsx`      | `field_body` (ordered paragraphs)      | `blocks: BodyBlock[]`                               | —                       |
| `RichText`       | (sub of ArticleBody)          | `paragraph--rich_text`                 | `html: string`                                      | —                       |
| `PullQuote`      | (sub of ArticleBody)          | `paragraph--pull_quote`                | `q: PullQuoteBlock`                                 | —                       |
| `ContactBlock`   | `article-components.jsx`      | `field_press_contact`                  | `contact: PressContact`                             | —                       |
| `LegalNotes`     | `article-components.jsx`      | `field_legal_notes`                    | `notes: string[]`                                   | —                       |
| `TagList`        | `article-components.jsx`      | `field_tags`                           | `tags: Tag[]`                                       | —                       |
| `SiteFooter`     | `article-components.jsx`      | menu blocks + footer config            | —                                                   | —                       |
| `FloatingUtils`  | `article-components.jsx`      | site-wide widget config                | —                                                   | —                       |
| `ArticleReferencePanel` | (port from `tweaks-panel.jsx`) | dev affordance (preview/editor only) | `showJsonMapping`, `accent`, `onChange`           | persisted to localStorage |

## Discriminated union pattern (recommended)

The `body` array uses a `kind` field as a discriminator. In the Next.js implementation, render with an exhaustive switch:

```tsx
function ArticleBody({ blocks }: { blocks: BodyBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "rich_text": return <RichText key={i} html={block.html} />;
          case "pull_quote": return <PullQuote key={i} q={block} />;
          default: {
            // exhaustiveness check — TS will error if a new kind is added
            const _exhaustive: never = block;
            return null;
          }
        }
      })}
    </>
  );
}
```

This makes adding new paragraph types (image, gallery, callout, embed, etc.) a one-line addition on the backend + one new component on the frontend — no other code changes.

## Adding new paragraph types

When the editorial team needs a new block kind (e.g. `image_gallery`, `data_callout`, `oembed`):

1. **Drupal:** add a new `paragraph--<kind>` bundle with its fields.
2. **Adapter:** map the JSON:API output into a new `BodyBlock` variant with `kind: "<new_kind>"`.
3. **Frontend:** add a new component, add it to the switch above, add a `data-jsonblock` label.
4. **Design:** add a section to `Article Page.html` showing the new block (or open a new design task).

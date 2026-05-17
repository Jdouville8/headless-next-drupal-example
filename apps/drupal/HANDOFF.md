# apps/drupal — Handoff

Drupal 11 backend for the Meridian article page handoff. Read-only JSON:API surface that feeds the Next.js adapter at `apps/web/lib/drupal/article.ts`.

## URLs

- Admin:                 https://meridian.ddev.site/user/login
- JSON:API root:         https://meridian.ddev.site/jsonapi
- Sample article (HTML): https://meridian.ddev.site/news/meridian-industrial-debuts-continental-logistics-program-next-generation-fleet-operators

## Sample article

- **UUID:**  `e70a823f-3ced-456a-958b-d190ae1fa417`
- **NID:**   `3`
- **Slug:**  `meridian-industrial-debuts-continental-logistics-program-next-generation-fleet-operators`
- **Title:** *Meridian Industrial Debuts Continental Logistics Program for Next-Generation Fleet Operators*

Includes 3 ordered paragraphs (`rich_text → pull_quote → rich_text`), a `Partnerships` taxonomy tag, a `press_person` author (Dana Okafor) with placeholder portrait, a `press_contact` (Britt Sage), and a placeholder image hero.

## Adapter query (verbatim — the exact querystring Next.js sends)

The adapter (`apps/web/lib/drupal/article.ts`) issues this request:

```
GET /jsonapi/node/article?
  filter[path][condition][path]=path.alias
  &filter[path][condition][value]=/news/<slug>
  &include=field_hero_media,field_hero_media.field_media_image,field_body,field_body.field_author,field_press_contact,field_tags
  &fields[node--article]=title,field_summary,field_dateline_location,field_publish_date,field_read_minutes,field_hero_media,field_body,field_press_contact,field_legal_notes,field_tags,path
  &fields[paragraph--rich_text]=field_text
  &fields[paragraph--pull_quote]=field_quote,field_author
```

Returns the article plus 8 related entities (file/media/paragraph/press_person/press_contact/term) in one round trip.

Concrete test — copy-paste-runnable (use `curl -g` so zsh doesn't glob the brackets):

```bash
SLUG="meridian-industrial-debuts-continental-logistics-program-next-generation-fleet-operators"
curl -g "https://meridian.ddev.site/jsonapi/node/article?filter[path][condition][path]=path.alias&filter[path][condition][value]=/news/${SLUG}&include=field_hero_media,field_hero_media.field_media_image,field_body,field_body.field_author,field_press_contact,field_tags&fields[node--article]=title,field_summary,field_dateline_location,field_publish_date,field_read_minutes,field_hero_media,field_body,field_press_contact,field_legal_notes,field_tags,path&fields[paragraph--rich_text]=field_text&fields[paragraph--pull_quote]=field_quote,field_author" | jq '.data[0].attributes.title'
```

## Admin login (one-shot)

```bash
cd apps/drupal && ddev launch $(ddev drush uli)
```

That logs you in as user 1 in the browser. Hard credentials are `admin / admin` for local convenience; do not reuse for any non-local environment.

## Reproduce from config

If this directory is fresh (no `web/sites/default/files/` content, no DB), this sequence rebuilds the site identically to the seeded state:

```bash
cd apps/drupal
ddev start
ddev composer install
ddev drush si --existing-config -y
ddev drush scr scripts/seed-content.php   # re-seed the one article + supporting nodes
```

Notes:

- `ddev drush si --existing-config` installs Drupal using the exported `config/sync/` tree (which contains the site UUID, all field/bundle/display/jsonapi/pathauto config, plus the custom `meridian_path_filter` module being enabled).
- `scripts/seed-content.php` is **not** captured in config — it idempotently creates the one demo article plus its supporting `press_person`, `press_contact`, `media:image` files, and taxonomy terms. Re-runs are safe.
- The Next.js adapter's path-alias filter only works once the `meridian_path_filter` module is enabled (it is, after `si --existing-config`). See "Known deviations" below.

## Custom module

`web/modules/custom/meridian_path_filter/` — a ~30-line event subscriber. JSON:API's filter on the computed `path` field of a node hits Drupal core issue #2980054 (the SQL EntityQuery backend can't join `path_alias`). The module intercepts `/jsonapi/node/*` requests where the filter targets `path.alias`, resolves the alias server-side via the `path_alias.manager` service, and rewrites the filter to `drupal_internal__nid={nid}` before JSON:API sees it. The adapter contract works unchanged.

## Known deviations from agents/A-drupal-backend.md

| Topic | Deviation | Why |
|---|---|---|
| `node--press_person.field_org` | Renamed to **`field_organization`** | The Next.js adapter (line 264 of `apps/web/lib/drupal/article.ts`) reads `field_organization`. Adapter wins per orchestrator instructions. |
| `node--press_contact.field_org` | Renamed to **`field_organization`** | Same — adapter reads `field_organization` (line 302). |
| `node--press_person.field_portrait_alt` | **Added** (string, plain text) | The adapter (line 266) reads `field_portrait_alt` for the pull-quote portrait alt text. Not in the original prompt. |
| Hero media bundle | Seeded as **image** only | The adapter supports both image and video media bundles; `field_hero_media` accepts `image`, `video`, and `remote_video` bundles in Drupal. The seed uses an image placeholder. The mock at `article-data.jsx` uses `kind: video` — Agent E may want to seed a video media in addition, or accept the image-only divergence as a visual-only difference in the integrated build. |
| `path.alias` filter | Powered by the custom **`meridian_path_filter`** module | Drupal core SQL EntityQuery cannot filter nodes by the computed `path.alias` (long-standing core issue). The module rewrites the filter to `drupal_internal__nid`. If the module is disabled, the adapter receives a 500 with `'path' not found`. |
| `basic_html` text format | Extended to allow `<sup>` and `<sub>` | The seeded article body uses `<sup>1</sup>` for the footnote marker. `basic_html` is still the sanitized format used for rich-text paragraphs — the contract's "server-sanitized" requirement is preserved. |

No additional deviations from `JSON_CONTRACT.md` — every other field machine name, paragraph bundle, and reference relationship matches the original prompt.

## Anonymous permissions granted

- `access content` (default for Standard profile)
- `view media` (default for Standard profile, kept explicit)

JSON:API is set to **read-only** via `jsonapi.settings:read_only = TRUE`. Anonymous mutations (POST/PATCH/DELETE) are blocked at the JSON:API layer regardless of per-resource permissions.

## File layout

```
apps/drupal/
├── .ddev/                      DDEV project config (project_name: meridian)
├── composer.json
├── composer.lock
├── config/sync/                Exported config (290 files) — schema source of truth
├── recipes/                    Composer-managed recipes (unused, kept for future)
├── scripts/
│   ├── seed-schema.php         Idempotent. Already captured in config/sync.
│   ├── seed-config.php         Idempotent. Already captured in config/sync.
│   └── seed-content.php        NOT in config/sync — run after `drush si --existing-config`.
├── vendor/                     Composer deps (gitignored)
└── web/
    ├── core/                   Drupal core 11.3.9
    ├── modules/
    │   ├── contrib/            paragraphs, pathauto, jsonapi_extras, entity_reference_revisions, token
    │   └── custom/
    │       └── meridian_path_filter/   The path.alias filter rewriter — committed to repo.
    ├── sites/default/files/    Public files (gitignored). Includes seeded portrait + hero PNGs.
    └── sites/default/settings.php
```

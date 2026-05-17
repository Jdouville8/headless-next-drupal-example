# Agent A — Drupal Backend

You own `apps/drupal/` only. **Do not touch** `apps/web/` — that's other agents' territory.

## Goal

Stand up a Drupal 11 site via DDEV, model the Article content type and its paragraph types, enable JSON:API, seed one sample article that matches `design_handoff_article_page/article-data.jsx`, and export the config so the schema is reproducible.

## Required reading (in order)

1. `design_handoff_article_page/CLAUDE.md` — context
2. `design_handoff_article_page/JSON_CONTRACT.md` — the data shape you must expose
3. `design_handoff_article_page/article-data.jsx` — exact field values for the seed article
4. DDEV install guide: <https://docs.ddev.com/en/stable/users/install/ddev-installation/>
5. Drupal install guide: <https://www.drupal.org/docs/getting-started/installing-drupal/install-drupal-using-ddev-for-local-development>

## Steps

### 1. Install Drupal 11 via DDEV

```bash
cd apps/drupal
ddev config --project-type=drupal11 --project-name=meridian --docroot=web
ddev start
ddev composer create drupal/recommended-project
ddev composer require drush/drush
ddev drush site:install -y --account-name=admin --account-pass=admin
ddev launch $(ddev drush uli)
```

### 2. Enable required modules

```bash
ddev drush en -y \
  jsonapi \
  jsonapi_extras \
  paragraphs \
  entity_reference_revisions \
  media \
  media_library \
  pathauto \
  token \
  field_ui \
  taxonomy
```

> Install `paragraphs` and `entity_reference_revisions` via composer first if they're not in core:
> `ddev composer require drupal/paragraphs drupal/pathauto drupal/jsonapi_extras`

### 3. Model the schema

Create these entities via the Drupal admin UI (or Drush + config import). The exact field machine names must match `JSON_CONTRACT.md` so the adapter doesn't need a translation layer.

**Paragraph types:**
- `rich_text` — fields: `field_text` (Text long, formatted, Filtered HTML format)
- `pull_quote` — fields: `field_quote` (Text long, plain), `field_author` (Entity reference → `node:press_person`)

**Content type: `press_person`** (used by `pull_quote.field_author`):
- `title` (built-in) → person's name
- `field_role` (string) → e.g. "Chief Brand Officer"
- `field_org` (string) → e.g. "Meridian Industrial Group"
- `field_portrait` (Media reference → image)

**Content type: `press_contact`**:
- `title` → contact name
- `field_org` (string)
- `field_email` (email)
- `field_phone` (string, optional)

**Taxonomy vocabulary: `article_tags`** with two seed terms: "Partnerships", "Operations".

**Content type: `article`** (the main one):
- `title` → article title
- `field_summary` (Text long, plain)
- `field_dateline_location` (string)
- `field_publish_date` (datetime)
- `field_read_minutes` (integer)
- `field_hero_media` (Media reference → image OR video, single value)
- `field_body` (Paragraph reference, multiple, allowed bundles: `rich_text`, `pull_quote`)
- `field_press_contact` (Entity reference → `press_contact`)
- `field_legal_notes` (Text long, plain, multiple)
- `field_tags` (Entity reference → `taxonomy_term:article_tags`, multiple)

**Pathauto pattern:** `/news/[node:title]`

### 4. Configure JSON:API

- Permissions: `View resource lists` and `Access JSON:API resource list` for anonymous role.
- Use `jsonapi_extras` to:
  - Disable mutation methods (read-only API).
  - Rename machine names where helpful (optional — adapter handles either way).
  - Disable resources you don't need (User, etc).

Verify with:
```bash
curl http://meridian.ddev.site/jsonapi/node/article | jq
```

### 5. Seed the sample article

Create one node matching `design_handoff_article_page/article-data.jsx` exactly:
- Title, summary, dateline, publish date, read minutes per the mock
- Three body paragraphs in order: rich_text → pull_quote → rich_text
- Pull-quote author = a `press_person` node with the portrait field populated (upload any placeholder image)
- Hero media = upload a placeholder 16:9 image
- Tags: "Partnerships"
- Press contact: per the mock

### 6. Export config

```bash
ddev drush cex -y
# config now lives in apps/drupal/config/sync/
git add apps/drupal/config/sync apps/drupal/composer.json apps/drupal/composer.lock apps/drupal/.ddev
```

### 7. Document for Agent E

Write `apps/drupal/HANDOFF.md` with:
- The DDEV URL (e.g. `https://meridian.ddev.site`)
- The sample article's UUID and URL alias
- Curl commands that demonstrate the JSON:API endpoint working
- `ddev drush uli` instructions for getting an admin login
- The exact `include=...&fields[...]=...` querystring from `JSON_CONTRACT.md` that returns a complete article payload

## Exit criteria

- [ ] `ddev start` boots the site cleanly
- [ ] `ddev drush status` shows Drupal 11 installed
- [ ] One sample `article` node exists matching the mock payload
- [ ] `GET /jsonapi/node/article` returns the article in JSON:API format
- [ ] The recommended `?include=...&fields=...` query returns hero, body paragraphs (with referenced author), press contact, and tags in one round trip
- [ ] Config is exported to `apps/drupal/config/sync/`
- [ ] `apps/drupal/HANDOFF.md` exists and is accurate

## Do not

- Modify anything outside `apps/drupal/`
- Add Drupal themes / front-end rendering — the frontend is Next.js, Drupal is API-only
- Build custom modules unless absolutely needed; prefer contrib modules
- Add fields not in `JSON_CONTRACT.md` (escalate to orchestrator instead)

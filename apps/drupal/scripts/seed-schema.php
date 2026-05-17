<?php
/**
 * Seed Meridian Drupal schema for the Article page handoff.
 *
 * Run via: ddev drush scr scripts/seed-schema.php
 */

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\NodeType;
use Drupal\paragraphs\Entity\ParagraphsType;
use Drupal\taxonomy\Entity\Vocabulary;

function ensure_field_storage(string $entity_type, string $field_name, string $type, array $settings = [], int $cardinality = 1): void {
  if (FieldStorageConfig::loadByName($entity_type, $field_name)) {
    return;
  }
  FieldStorageConfig::create([
    'field_name' => $field_name,
    'entity_type' => $entity_type,
    'type' => $type,
    'cardinality' => $cardinality,
    'settings' => $settings,
  ])->save();
  echo "+ storage $entity_type.$field_name ($type)\n";
}

function ensure_field(string $entity_type, string $bundle, string $field_name, string $label, array $settings = [], bool $required = FALSE): void {
  $existing = FieldConfig::loadByName($entity_type, $bundle, $field_name);
  if ($existing) {
    if ($settings) {
      $existing->set('settings', $settings);
      $existing->save();
      echo "~ field $entity_type/$bundle/$field_name (settings updated)\n";
    }
    return;
  }
  FieldConfig::create([
    'field_name' => $field_name,
    'entity_type' => $entity_type,
    'bundle' => $bundle,
    'label' => $label,
    'settings' => $settings,
    'required' => $required,
  ])->save();
  echo "+ field $entity_type/$bundle/$field_name\n";
}

// 1. Article tags vocabulary.
if (!Vocabulary::load('article_tags')) {
  Vocabulary::create([
    'vid' => 'article_tags',
    'name' => 'Article Tags',
    'description' => 'Tags for newsroom articles (adapter expects vid = article_tags).',
  ])->save();
  echo "+ vocab article_tags\n";
}

// 2. Field storages.
ensure_field_storage('paragraph', 'field_text', 'text_long');
ensure_field_storage('paragraph', 'field_quote', 'text_long');
ensure_field_storage('paragraph', 'field_author', 'entity_reference', ['target_type' => 'node']);

ensure_field_storage('node', 'field_role', 'string');
ensure_field_storage('node', 'field_organization', 'string');
ensure_field_storage('node', 'field_portrait', 'entity_reference', ['target_type' => 'media']);
ensure_field_storage('node', 'field_portrait_alt', 'string');
ensure_field_storage('node', 'field_email', 'email');
ensure_field_storage('node', 'field_phone', 'string');

ensure_field_storage('node', 'field_summary', 'text_long');
ensure_field_storage('node', 'field_dateline_location', 'string');
ensure_field_storage('node', 'field_publish_date', 'datetime', ['datetime_type' => 'datetime']);
ensure_field_storage('node', 'field_read_minutes', 'integer');
ensure_field_storage('node', 'field_hero_media', 'entity_reference', ['target_type' => 'media']);
ensure_field_storage('node', 'field_body', 'entity_reference_revisions', ['target_type' => 'paragraph'], FieldStorageConfig::CARDINALITY_UNLIMITED);
ensure_field_storage('node', 'field_press_contact', 'entity_reference', ['target_type' => 'node']);
ensure_field_storage('node', 'field_legal_notes', 'text_long', [], FieldStorageConfig::CARDINALITY_UNLIMITED);

// 3. Paragraph bundles.
foreach (['rich_text' => 'Rich text', 'pull_quote' => 'Pull quote'] as $id => $label) {
  if (!ParagraphsType::load($id)) {
    ParagraphsType::create(['id' => $id, 'label' => $label])->save();
    echo "+ paragraph bundle $id\n";
  }
}

// 4. Node types.
foreach ([
  'press_person'  => 'Press person',
  'press_contact' => 'Press contact',
] as $type => $name) {
  if (!NodeType::load($type)) {
    NodeType::create(['type' => $type, 'name' => $name, 'new_revision' => FALSE])->save();
    echo "+ node type $type\n";
  }
}
// `article` exists from Standard profile.

// 5. Attach fields.
ensure_field('paragraph', 'rich_text', 'field_text', 'Text');

ensure_field('paragraph', 'pull_quote', 'field_quote', 'Quote');
ensure_field('paragraph', 'pull_quote', 'field_author', 'Author', [
  'handler' => 'default:node',
  'handler_settings' => ['target_bundles' => ['press_person' => 'press_person']],
]);

ensure_field('node', 'press_person', 'field_role', 'Role');
ensure_field('node', 'press_person', 'field_organization', 'Organization');
ensure_field('node', 'press_person', 'field_portrait', 'Portrait', [
  'handler' => 'default:media',
  'handler_settings' => ['target_bundles' => ['image' => 'image']],
]);
ensure_field('node', 'press_person', 'field_portrait_alt', 'Portrait alt text');

ensure_field('node', 'press_contact', 'field_organization', 'Organization');
ensure_field('node', 'press_contact', 'field_email', 'Email');
ensure_field('node', 'press_contact', 'field_phone', 'Phone');

ensure_field('node', 'article', 'field_summary', 'Summary');
ensure_field('node', 'article', 'field_dateline_location', 'Dateline / Location');
ensure_field('node', 'article', 'field_publish_date', 'Publish date');
ensure_field('node', 'article', 'field_read_minutes', 'Read minutes');
ensure_field('node', 'article', 'field_hero_media', 'Hero media', [
  'handler' => 'default:media',
  'handler_settings' => ['target_bundles' => ['image' => 'image', 'video' => 'video', 'remote_video' => 'remote_video']],
]);
ensure_field('node', 'article', 'field_body', 'Body', [
  'handler' => 'default:paragraph',
  'handler_settings' => [
    'target_bundles' => ['rich_text' => 'rich_text', 'pull_quote' => 'pull_quote'],
    'negate' => 0,
    'target_bundles_drag_drop' => [
      'rich_text'  => ['weight' => 0, 'enabled' => TRUE],
      'pull_quote' => ['weight' => 1, 'enabled' => TRUE],
    ],
  ],
]);
ensure_field('node', 'article', 'field_press_contact', 'Press contact', [
  'handler' => 'default:node',
  'handler_settings' => ['target_bundles' => ['press_contact' => 'press_contact']],
]);
ensure_field('node', 'article', 'field_legal_notes', 'Legal notes');

// 6. Re-point the existing article→field_tags FieldConfig at article_tags vocab.
$tags_field = FieldConfig::loadByName('node', 'article', 'field_tags');
if ($tags_field) {
  $tags_field->set('settings', [
    'handler' => 'default:taxonomy_term',
    'handler_settings' => [
      'target_bundles' => ['article_tags' => 'article_tags'],
      'auto_create' => FALSE,
    ],
  ])->save();
  echo "~ article.field_tags now targets article_tags vocab\n";
}

// 7. Configure form/view displays so editors can use the fields.
$entityDisplayRepository = \Drupal::service('entity_display.repository');

function add_form_widgets(string $entity_type, string $bundle, array $components): void {
  $form_display = \Drupal::service('entity_display.repository')
    ->getFormDisplay($entity_type, $bundle, 'default');
  foreach ($components as $field => $opts) {
    $form_display->setComponent($field, $opts);
  }
  $form_display->save();
}

function add_view_components(string $entity_type, string $bundle, array $components): void {
  $view_display = \Drupal::service('entity_display.repository')
    ->getViewDisplay($entity_type, $bundle, 'default');
  foreach ($components as $field => $opts) {
    $view_display->setComponent($field, $opts);
  }
  $view_display->save();
}

add_form_widgets('paragraph', 'rich_text', [
  'field_text' => ['type' => 'text_textarea', 'weight' => 1],
]);
add_view_components('paragraph', 'rich_text', [
  'field_text' => ['type' => 'text_default', 'weight' => 1, 'label' => 'hidden'],
]);

add_form_widgets('paragraph', 'pull_quote', [
  'field_quote'  => ['type' => 'text_textarea', 'weight' => 1],
  'field_author' => ['type' => 'entity_reference_autocomplete', 'weight' => 2],
]);
add_view_components('paragraph', 'pull_quote', [
  'field_quote'  => ['type' => 'text_default', 'weight' => 1, 'label' => 'hidden'],
  'field_author' => ['type' => 'entity_reference_label', 'weight' => 2, 'label' => 'hidden'],
]);

add_form_widgets('node', 'press_person', [
  'field_role'          => ['type' => 'string_textfield', 'weight' => 1],
  'field_organization'  => ['type' => 'string_textfield', 'weight' => 2],
  'field_portrait'      => ['type' => 'media_library_widget', 'weight' => 3],
  'field_portrait_alt'  => ['type' => 'string_textfield', 'weight' => 4],
]);

add_form_widgets('node', 'press_contact', [
  'field_organization' => ['type' => 'string_textfield', 'weight' => 1],
  'field_email'        => ['type' => 'email_default', 'weight' => 2],
  'field_phone'        => ['type' => 'string_textfield', 'weight' => 3],
]);

add_form_widgets('node', 'article', [
  'field_summary'           => ['type' => 'text_textarea', 'weight' => 1],
  'field_dateline_location' => ['type' => 'string_textfield', 'weight' => 2],
  'field_publish_date'      => ['type' => 'datetime_default', 'weight' => 3],
  'field_read_minutes'      => ['type' => 'number', 'weight' => 4],
  'field_hero_media'        => ['type' => 'media_library_widget', 'weight' => 5],
  'field_body'              => [
    'type' => 'paragraphs',
    'weight' => 6,
    'settings' => [
      'title' => 'Block',
      'title_plural' => 'Blocks',
      'edit_mode' => 'open',
      'add_mode' => 'dropdown',
      'form_display_mode' => 'default',
      'default_paragraph_type' => '',
    ],
  ],
  'field_press_contact'     => ['type' => 'entity_reference_autocomplete', 'weight' => 7],
  'field_legal_notes'       => ['type' => 'text_textarea', 'weight' => 8],
]);

echo "Schema seeded.\n";

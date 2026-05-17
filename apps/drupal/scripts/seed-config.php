<?php
/**
 * Configure JSON:API, pathauto, and anonymous permissions.
 */

use Drupal\pathauto\Entity\PathautoPattern;
use Drupal\user\Entity\Role;

// 1. JSON:API: keep mutation methods disabled (read-only).
\Drupal::configFactory()
  ->getEditable('jsonapi.settings')
  ->set('read_only', TRUE)
  ->save();
echo "~ jsonapi.settings.read_only = TRUE\n";

// 2. Pathauto pattern: /news/[node:title] for the article bundle.
if (!PathautoPattern::load('news_articles')) {
  PathautoPattern::create([
    'id' => 'news_articles',
    'label' => 'News articles',
    'type' => 'canonical_entities:node',
    'pattern' => '/news/[node:title]',
    'selection_criteria' => [
      [
        'id' => 'entity_bundle:node',
        'bundles' => ['article' => 'article'],
        'negate' => FALSE,
        'context_mapping' => ['node' => 'node'],
      ],
    ],
    'selection_logic' => 'and',
    'weight' => 0,
    'relationships' => [],
  ])->save();
  echo "+ pathauto pattern news_articles → /news/[node:title]\n";
}

// 3. Anonymous: grant the permissions the JSON:API contract needs.
$anon = Role::load('anonymous');
$needed = [
  'access content',
  'view media',
];
foreach ($needed as $perm) {
  if (!$anon->hasPermission($perm)) {
    $anon->grantPermission($perm);
    echo "+ anon: $perm\n";
  }
}
$anon->save();

echo "Config seeded.\n";

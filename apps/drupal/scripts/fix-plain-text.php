<?php
/**
 * One-shot cleanup for the three plain-text-contract fields on the sample
 * article: node 3 -> field_summary, field_legal_notes; paragraph 2 ->
 * field_quote.
 *
 * The stored `value` on these fields had been corrupted with a wrapping
 * <p>...</p> (and HTML-entity-encoded characters), and their format had been
 * silently changed from plain_text to basic_html. This script:
 *
 *   1. Strips one wrapping <p>...</p> from each value.
 *   2. Decodes HTML entities (&#039; -> ', &amp; -> &, etc.).
 *   3. Resets the format back to plain_text.
 *   4. Saves each entity.
 *   5. Echoes the cleaned state so the operator can confirm.
 *
 * Run via: ddev drush scr scripts/fix-plain-text.php
 */

use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Strip a single wrapping <p>...</p> from a string (anchored at start/end)
 * and decode common HTML entities. Idempotent: a clean value passes through
 * unchanged.
 */
function meridian_clean_plaintext(string $value): string {
  // Strip a wrapping <p>...</p> if present. Defensive: only at the anchors;
  // don't strip mid-string <p>s (there shouldn't be any here, but cheap to
  // guard).
  $stripped = preg_replace('#^\s*<p>([\s\S]*?)</p>\s*$#', '$1', $value);
  if (is_string($stripped)) {
    $value = $stripped;
  }
  // Decode the small entity set Drupal commonly emits.
  return html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

// --- node 3: field_summary + field_legal_notes ---
$node = Node::load(3);
if (!$node) {
  echo "ERROR: node 3 not found\n";
  return;
}

// field_summary (single-value text field)
$summary_raw = $node->get('field_summary')->value;
$summary_clean = meridian_clean_plaintext((string) $summary_raw);
$node->set('field_summary', [
  'value' => $summary_clean,
  'format' => 'plain_text',
]);
echo "summary cleaned: " . $summary_clean . "\n";

// field_legal_notes (multi-value text field)
$legal_raw = $node->get('field_legal_notes')->getValue();
$legal_clean = [];
foreach ($legal_raw as $i => $item) {
  $value = isset($item['value']) ? (string) $item['value'] : '';
  $clean = meridian_clean_plaintext($value);
  $legal_clean[] = ['value' => $clean, 'format' => 'plain_text'];
  echo "legal[$i] cleaned: " . $clean . "\n";
}
$node->set('field_legal_notes', $legal_clean);

$node->save();
echo "node 3 saved.\n";

// --- paragraph 2: field_quote ---
$para = Paragraph::load(2);
if (!$para) {
  echo "ERROR: paragraph 2 not found\n";
  return;
}
$quote_raw = $para->get('field_quote')->value;
$quote_clean = meridian_clean_plaintext((string) $quote_raw);
$para->set('field_quote', [
  'value' => $quote_clean,
  'format' => 'plain_text',
]);
$para->save();
echo "quote cleaned: " . $quote_clean . "\n";
echo "paragraph 2 saved.\n";

// --- post-save verification ---
echo "\n=== Post-save state ===\n";
$node = Node::load(3);
$s = $node->get('field_summary')->getValue();
echo "summary: " . $s[0]['value'] . "  [format=" . ($s[0]['format'] ?? 'NULL') . "]\n";
foreach ($node->get('field_legal_notes')->getValue() as $i => $v) {
  echo "legal[$i]: " . $v['value'] . "  [format=" . ($v['format'] ?? 'NULL') . "]\n";
}
$para = Paragraph::load(2);
$q = $para->get('field_quote')->getValue();
echo "quote: " . $q[0]['value'] . "  [format=" . ($q[0]['format'] ?? 'NULL') . "]\n";

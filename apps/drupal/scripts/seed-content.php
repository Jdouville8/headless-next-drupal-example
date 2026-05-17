<?php
/**
 * Seed Meridian article content matching article-data.jsx.
 *
 * Run via: ddev drush scr scripts/seed-content.php
 */

use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;

// --- 0. Allow <sup> and <sub> in the basic_html filter format -------------
// JSON_CONTRACT.md requires server-sanitized rich-text. Basic HTML is the
// sanitized format; the article body uses <sup> for footnotes, so we extend
// the allowed tag list here rather than escaping to full_html.
$basic = \Drupal::configFactory()->getEditable('filter.format.basic_html');
$tags  = $basic->get('filters.filter_html.settings.allowed_html');
if ($tags && !str_contains($tags, '<sup>')) {
  $tags = trim($tags) . ' <sup> <sub>';
  $basic->set('filters.filter_html.settings.allowed_html', $tags)->save();
  echo "~ basic_html now allows <sup> <sub>\n";
}

// --- 1. Generate placeholder images via GD ---------------------------------
function write_placeholder_png(int $w, int $h, array $rgb, string $public_path): string {
  $stream  = "public://$public_path";
  $dir_stream = "public://" . dirname($public_path);
  $fs = \Drupal::service('file_system');
  $fs->prepareDirectory($dir_stream, \Drupal\Core\File\FileSystemInterface::CREATE_DIRECTORY | \Drupal\Core\File\FileSystemInterface::MODIFY_PERMISSIONS);
  $real = $fs->realpath($stream);
  if (!$real) {
    throw new RuntimeException("Could not resolve real path for $stream (dir: " . $fs->realpath($dir_stream) . ")");
  }
  $img = imagecreatetruecolor($w, $h);
  $bg  = imagecolorallocate($img, $rgb[0], $rgb[1], $rgb[2]);
  imagefill($img, 0, 0, $bg);
  imagepng($img, $real);
  imagedestroy($img);
  echo "+ image $stream ({$w}x{$h})\n";
  return $stream;
}

function ensure_file_entity(string $uri, string $filename): File {
  $existing = \Drupal::entityTypeManager()
    ->getStorage('file')
    ->loadByProperties(['uri' => $uri]);
  if ($existing) {
    return reset($existing);
  }
  $file = File::create([
    'uri'      => $uri,
    'filename' => $filename,
    'status'   => 1,
    'uid'      => 1,
  ]);
  $file->save();
  return $file;
}

function ensure_image_media(File $file, string $name, string $alt): Media {
  $existing = \Drupal::entityTypeManager()
    ->getStorage('media')
    ->loadByProperties(['name' => $name, 'bundle' => 'image']);
  if ($existing) {
    return reset($existing);
  }
  $media = Media::create([
    'bundle' => 'image',
    'name'   => $name,
    'uid'    => 1,
    'status' => 1,
    'field_media_image' => [
      'target_id' => $file->id(),
      'alt'       => $alt,
      'title'     => $name,
    ],
  ]);
  $media->save();
  echo "+ media[image] $name\n";
  return $media;
}

// Hero: 16:9 deep-blue placeholder.
$hero_uri    = write_placeholder_png(1600, 900, [40, 56, 80], 'meridian/hero-continental-logistics.png');
$hero_file   = ensure_file_entity($hero_uri, 'hero-continental-logistics.png');
$hero_media  = ensure_image_media(
  $hero_file,
  'Convoy of service trucks at dawn on a coastal highway',
  'Convoy of service trucks at dawn on a coastal highway',
);

// Portrait: square neutral placeholder.
$portrait_uri   = write_placeholder_png(600, 600, [90, 78, 64], 'meridian/portrait-dana-okafor.png');
$portrait_file  = ensure_file_entity($portrait_uri, 'portrait-dana-okafor.png');
$portrait_media = ensure_image_media(
  $portrait_file,
  'Portrait of Dana Okafor, Chief Brand Officer',
  'Portrait of Dana Okafor, Chief Brand Officer',
);

// --- 2. Taxonomy term: Partnerships ----------------------------------------
function ensure_term(string $vid, string $name): Term {
  $existing = \Drupal::entityTypeManager()
    ->getStorage('taxonomy_term')
    ->loadByProperties(['vid' => $vid, 'name' => $name]);
  if ($existing) {
    return reset($existing);
  }
  $term = Term::create(['vid' => $vid, 'name' => $name]);
  $term->save();
  echo "+ term $vid:$name\n";
  return $term;
}
$tag_partnerships = ensure_term('article_tags', 'Partnerships');
ensure_term('article_tags', 'Operations');

// --- 3. press_person: Dana Okafor ------------------------------------------
function ensure_node(string $bundle, string $title, array $values): Node {
  $existing = \Drupal::entityTypeManager()
    ->getStorage('node')
    ->loadByProperties(['type' => $bundle, 'title' => $title]);
  if ($existing) {
    return reset($existing);
  }
  $node = Node::create(array_merge([
    'type'   => $bundle,
    'title'  => $title,
    'status' => 1,
    'uid'    => 1,
  ], $values));
  $node->save();
  echo "+ node[$bundle] '$title'\n";
  return $node;
}

$dana = ensure_node('press_person', 'Dana Okafor', [
  'field_role'         => 'Chief Brand Officer',
  'field_organization' => 'Meridian Industrial Group',
  'field_portrait'     => ['target_id' => $portrait_media->id()],
  'field_portrait_alt' => 'Portrait of Dana Okafor, Chief Brand Officer',
]);

// --- 4. press_contact: Britt Sage ------------------------------------------
$britt = ensure_node('press_contact', 'Britt Sage', [
  'field_organization' => 'Meridian Group Communications',
  'field_email'        => 'press@meridiangroup.example',
]);

// --- 5. Paragraphs (rich_text → pull_quote → rich_text) --------------------
$body_para_1_html =
  "<p><strong>CLEVELAND, Oh.</strong> — (April 16, 2026) Meridian Industrial Group, a century-old leader in fluids, lubricants, and aftermarket service<sup>1</sup>, announced today the launch of its Continental Logistics Program — a multi-region initiative designed to back the operators and mechanics keeping freight moving across North America.</p>" .
  "<p>Built around the people who do the work, the program highlights the route engineers, dispatch teams, and bay technicians whose decisions compound into thousands of on-time deliveries every day. The initiative covers not just the visible heroics of long-haul driving, but the quiet preparation and care that makes every mile possible.</p>" .
  "<p>Anchoring the program is a new field-service compact titled, <em>The Operator's Standard.</em> As a tribute to the discipline of the trade, the compact codifies Meridian's 100-year commitment to its customers and the routes they keep alive. Whether a fleet is running cold-chain across the Plains or last-mile through dense urban grids, Meridian shows up at the bay, on the line, and in the planning room.</p>";

$body_para_3_html =
  "<p>Developed with continental creative partner North & Vale, <em>The Operator's Standard</em> rolls out first in the Midwest corridor, expanding through the summer into the Gulf, Pacific Northwest, and Atlantic regions. Each rollout captures the moments, preparation, emotion, and the unseen force that keeps fleets moving, depot after depot.</p>" .
  "<p>Running through October, the program will engage broadcast, trade-radio, depot-level signage, and an on-site experience tour to drive engagement and invite operators to share their own stories.</p>" .
  "<p>The initiative is further captured through Meridian's <em>Operator's Standard</em> field-rewards and depot giveaways in select regions, recognizing the grit of operators and mechanics alike. Rewards continue through August, offering teams a chance to earn certified training, equipment grants, and a featured spot in the program's documentary series.</p>" .
  "<p>As the season unfolds, so does Meridian's commitment to the operator's journey. To learn more about the continental program or the depot rewards, visit <a href=\"#\">the Meridian Operator's Hub</a>.</p>";

$pull_quote = "Being a hundred-year brand means we have always shown up at the bay. The freight network is the perfect place to celebrate that — every operator we back is a story about preparation, trust, and the next mile. This program champions the people who make the journey possible, and the ones who help them keep it.";

function make_paragraph(string $bundle, array $fields): Paragraph {
  $p = Paragraph::create(array_merge(['type' => $bundle], $fields));
  $p->save();
  return $p;
}

$p1 = make_paragraph('rich_text', [
  'field_text' => ['value' => $body_para_1_html, 'format' => 'basic_html'],
]);
$p2 = make_paragraph('pull_quote', [
  'field_quote'  => ['value' => $pull_quote, 'format' => NULL],
  'field_author' => ['target_id' => $dana->id()],
]);
$p3 = make_paragraph('rich_text', [
  'field_text' => ['value' => $body_para_3_html, 'format' => 'basic_html'],
]);
echo "+ paragraphs created: rich_text, pull_quote, rich_text\n";

// --- 6. Article node -------------------------------------------------------
$title = "Meridian Industrial Debuts Continental Logistics Program for Next-Generation Fleet Operators";
$summary = "The hundred-year industrial brand unveils a new continental program backing the operators, mechanics, and route engineers who keep modern freight moving.";

$article = ensure_node('article', $title, [
  'field_summary'           => ['value' => $summary, 'format' => 'plain_text'],
  'field_dateline_location' => 'Cleveland, Oh.',
  'field_publish_date'      => '2026-04-16T09:00:00',
  'field_read_minutes'      => 4,
  'field_hero_media'        => ['target_id' => $hero_media->id()],
  'field_body'              => [
    ['target_id' => $p1->id(), 'target_revision_id' => $p1->getRevisionId()],
    ['target_id' => $p2->id(), 'target_revision_id' => $p2->getRevisionId()],
    ['target_id' => $p3->id(), 'target_revision_id' => $p3->getRevisionId()],
  ],
  'field_press_contact'     => ['target_id' => $britt->id()],
  'field_legal_notes'       => [
    ['value' => "Meridian™ is a registered trademark of Meridian Industrial Group or its subsidiaries. All other trademarks referred to in this article are the property of their respective holders.", 'format' => 'plain_text'],
    ['value' => "*Terms and conditions apply.", 'format' => 'plain_text'],
    ['value' => "¹References to “a century-old leader” reflect Meridian Industrial Group's heritage as one of North America's longest-operating fluids brands.", 'format' => 'plain_text'],
  ],
  'field_tags'              => [['target_id' => $tag_partnerships->id()]],
]);

// Force pathauto to generate the alias now (it normally runs on hook_save).
\Drupal::service('pathauto.generator')->updateEntityAlias($article, 'update');

echo "\n=== Article seeded ===\n";
echo "UUID:  " . $article->uuid() . "\n";
echo "NID:   " . $article->id() . "\n";
echo "Title: " . $article->getTitle() . "\n";
$alias = \Drupal::service('path_alias.manager')->getAliasByPath('/node/' . $article->id());
echo "Alias: $alias\n";

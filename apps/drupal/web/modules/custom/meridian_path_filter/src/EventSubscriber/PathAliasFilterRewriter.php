<?php

declare(strict_types=1);

namespace Drupal\meridian_path_filter\EventSubscriber;

use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Rewrites JSON:API `filter[*][condition][path]=path.alias` on node resources
 * so the Next.js adapter contract works against stock Drupal.
 *
 * Drupal core EntityQuery cannot join the `path_alias` table when filtering on
 * the computed `path` field of a node (issue #2980054). The adapter at
 * apps/web/lib/drupal/article.ts builds:
 *
 *   filter[path][condition][path]=path.alias
 *   filter[path][condition][value]=/news/{slug}
 *
 * This subscriber detects that pattern on /jsonapi/node/<bundle>* requests,
 * resolves the alias to /node/{nid} server-side, and rewrites the filter to
 *
 *   filter[path][condition][path]=drupal_internal__nid
 *   filter[path][condition][value]={nid}
 *
 * If the alias does not resolve to /node/{nid} the original query is left
 * untouched (JSON:API will return an empty result set).
 */
final class PathAliasFilterRewriter implements EventSubscriberInterface {

  public function __construct(
    private readonly AliasManagerInterface $aliasManager,
  ) {}

  public static function getSubscribedEvents(): array {
    // Run before JSON:API's own request handling. JSON:API registers a
    // priority-50 listener on KernelEvents::REQUEST; we run at 100 to land
    // ahead of it.
    return [KernelEvents::REQUEST => ['onRequest', 100]];
  }

  public function onRequest(RequestEvent $event): void {
    if (!$event->isMainRequest()) {
      return;
    }
    $request = $event->getRequest();
    $path = $request->getPathInfo();
    if (!str_starts_with($path, '/jsonapi/node/')) {
      return;
    }

    $query = $request->query->all();
    if (!is_array($query)) {
      return;
    }
    $changed = FALSE;
    foreach ($query as $key => $value) {
      if ($key !== 'filter' || !is_array($value)) {
        continue;
      }
      foreach ($value as $group_key => $group) {
        if (!is_array($group)) {
          continue;
        }
        $condition = $group['condition'] ?? NULL;
        if (!is_array($condition)) {
          continue;
        }
        $field = $condition['path'] ?? NULL;
        $alias = $condition['value'] ?? NULL;
        if ($field !== 'path.alias' || !is_string($alias) || $alias === '') {
          continue;
        }
        $internal = $this->aliasManager->getPathByAlias($alias);
        // getPathByAlias returns the input unchanged if no alias matches.
        if (!preg_match('#^/node/(\d+)$#', $internal, $m)) {
          continue;
        }
        $query['filter'][$group_key]['condition']['path']  = 'drupal_internal__nid';
        $query['filter'][$group_key]['condition']['value'] = $m[1];
        $changed = TRUE;
      }
    }
    if ($changed) {
      $request->query->replace($query);
      // Symfony's QueryString cache needs rebuilding too.
      $request->server->set('QUERY_STRING', http_build_query($query));
      $request->overrideGlobals();
    }
  }

}

// lib/drupal/client.ts
//
// Thin fetch wrapper for Drupal JSON:API. Adds the JSON:API media-type header,
// enables Next's revalidation tagging, and surfaces non-2xx responses with a
// readable error. Callers should handle 404 specifically (see `getArticleBySlug`).

const BASE = process.env.DRUPAL_BASE_URL ?? "http://localhost";

export class JsonApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    message?: string,
  ) {
    super(message ?? `JSON:API ${status} ${path}`);
    this.name = "JsonApiError";
  }
}

export async function fetchJsonApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 60, tags: ["article"] },
  });
  if (!res.ok) {
    throw new JsonApiError(res.status, path);
  }
  return (await res.json()) as T;
}

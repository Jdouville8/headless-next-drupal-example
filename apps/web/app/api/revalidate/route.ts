// app/api/revalidate/route.ts
//
// POST /api/revalidate?secret=<REVALIDATE_SECRET>&path=/news/foo&tag=article
//
// Drupal triggers this on publish/update. Requires a shared secret. Either
// `path` or `tag` (or both) may be provided; tag clears use 'article' to match
// the tag set in `lib/drupal/client.ts`.

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    return NextResponse.json(
      { revalidated: false, error: "Server is missing REVALIDATE_SECRET" },
      { status: 500 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json(
      { revalidated: false, error: "Invalid secret" },
      { status: 401 },
    );
  }

  const path = url.searchParams.get("path");
  const tag = url.searchParams.get("tag");

  if (!path && !tag) {
    return NextResponse.json(
      { revalidated: false, error: "Provide ?path= or ?tag=" },
      { status: 400 },
    );
  }

  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    path: path ?? null,
    tag: tag ?? null,
  });
}

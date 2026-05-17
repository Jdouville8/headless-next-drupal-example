// app/page.tsx
//
// Root landing — for this build it just redirects to the canonical article
// route. With mock mode on, any slug resolves to the same article, so we use
// a stable placeholder.

import { redirect } from "next/navigation";

export default function Home(): never {
  redirect("/news/meridian-continental-logistics-program");
}

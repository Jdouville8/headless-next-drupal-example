// components/article/index.ts
//
// Public barrel consumed by `app/news/[slug]/page.tsx`. The import list in
// that file is the contract — keep these names in sync.

export { SiteHeader } from "@/components/site/SiteHeader";
export { Breadcrumb } from "@/components/site/Breadcrumb";
export { SiteFooter } from "@/components/site/SiteFooter";
export { FloatingUtils } from "@/components/site/FloatingUtils";

export { HeroMedia } from "./HeroMedia";
export { ArticleHero } from "./ArticleHero";
export { ArticleBody, RichText, PullQuote } from "./ArticleBody";
export { ContactBlock } from "./ContactBlock";
export { LegalNotes } from "./LegalNotes";
export { TagList } from "./TagList";

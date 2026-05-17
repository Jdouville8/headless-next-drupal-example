import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/drupal/article";
import {
  SiteHeader,
  Breadcrumb,
  HeroMedia,
  ArticleHero,
  ArticleBody,
  ContactBlock,
  LegalNotes,
  TagList,
  SiteFooter,
  FloatingUtils,
} from "@/components/article";
import { ArticleReferencePanel } from "@/components/dev/ArticleReferencePanel";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const showDevPanel = process.env.NEXT_PUBLIC_SHOW_DEV_PANEL === "true";

  return (
    <>
      <SiteHeader />
      <Breadcrumb crumbs={article.attributes.breadcrumb} />
      <HeroMedia media={article.hero} />
      <ArticleHero data={article} />
      <ArticleBody blocks={article.body} />
      {article.contact && <ContactBlock contact={article.contact} />}
      {article.legal.length > 0 && <LegalNotes notes={article.legal} />}
      {article.attributes.tags.length > 0 && (
        <TagList tags={article.attributes.tags} />
      )}
      <SiteFooter />
      <FloatingUtils />
      {showDevPanel && <ArticleReferencePanel />}
    </>
  );
}

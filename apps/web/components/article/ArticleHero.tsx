// ArticleHero.tsx — node: title + summary + dateline + share
//
// The amber title band. Server component; the share buttons are a small
// client island (ShareRow).

import type { Article } from "@/types/article";

import { ShareRow } from "./ShareRow";

import styles from "./ArticleHero.module.css";

export type ArticleHeroProps = {
  data: Article;
};

function formatDate(iso: string): string {
  // Render in en-US long form to match the prototype's
  // "Month Day, Year" output. Force UTC so SSR and client agree.
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ArticleHero({ data }: ArticleHeroProps) {
  const date = formatDate(data.attributes.published_at);
  return (
    <section
      data-jsonblock="node: title + summary + dateline + share"
      className={styles.band}
    >
      <div className={styles.inner}>
        <h1 className={styles.title}>{data.attributes.title}</h1>
        <div className={styles.dateline}>
          <span>{date}</span>
          <span className={styles.datelinePipe} aria-hidden="true">
            |
          </span>
          <span>{data.attributes.read_minutes} Min Read</span>
        </div>
        <p className={styles.summary}>{data.attributes.summary}</p>
        <div className={styles.shareWrap}>
          <ShareRow items={data.share} title={data.attributes.title} />
        </div>
      </div>
    </section>
  );
}

export default ArticleHero;

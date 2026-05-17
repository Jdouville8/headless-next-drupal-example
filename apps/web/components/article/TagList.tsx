// TagList.tsx — field_tags (taxonomy term references)
//
// Pills link to /news/tag/<id>. That route is not yet wired — Agent E owns
// resolving the actual destination. The 404 in the meantime is expected.

import Link from "next/link";

import type { Tag } from "@/types/article";

import styles from "./TagList.module.css";

export type TagListProps = {
  tags: Tag[];
};

export function TagList({ tags }: TagListProps) {
  return (
    <section data-jsonblock="field_tags" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.column}>
          <span className={styles.label}>Tags:</span>
          {tags.map((t) => (
            <Link key={t.id} href={`/news/tag/${t.id}`} className={styles.pill}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TagList;

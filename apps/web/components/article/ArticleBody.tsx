// ArticleBody.tsx — field_body (paragraph collection)
//
// Iterates the paragraph collection. Adjacent rich_text blocks are grouped
// into a single paper-coloured section so a pull-quote can break out with
// its own dark band (matching the prototype's visual rhythm).
//
// Note: the `html` field on rich-text paragraphs is sanitized server-side
// by Drupal (Filtered HTML or DOMPurify pass — see JSON_CONTRACT.md), so
// `dangerouslySetInnerHTML` is safe here.

import Image from "next/image";

import type {
  BodyBlock,
  PullQuoteBlock,
  RichTextBlock,
} from "@/types/article";

import styles from "./ArticleBody.module.css";

export type ArticleBodyProps = {
  blocks: BodyBlock[];
};

export function RichText({ html }: { html: string }) {
  return (
    <div
      data-jsonblock="paragraph: rich_text"
      className={styles.richText}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function PullQuote({ q }: { q: PullQuoteBlock }) {
  const { author } = q;
  return (
    <section data-jsonblock="paragraph: pull_quote" className={styles.quoteBand}>
      <div className={styles.quoteInner}>
        <div className={styles.quoteGrid}>
          <div>
            <div
              aria-label={author.portrait_alt}
              className={styles.portraitFrame}
            >
              {author.portrait_src ? (
                <Image
                  src={author.portrait_src}
                  alt={author.portrait_alt}
                  fill
                  sizes="220px"
                  className={styles.portraitImage}
                />
              ) : (
                <>
                  <div aria-hidden="true" className={styles.portraitStripes} />
                  <div className={styles.portraitLabel}>[ portrait ]</div>
                </>
              )}
            </div>
            <div className={styles.authorBlock}>
              <div className={styles.authorName}>{author.name}</div>
              <div className={styles.authorTitle}>{author.title}</div>
              <div className={styles.authorOrg}>{author.org}</div>
            </div>
          </div>
          <blockquote className={styles.quote}>
            &ldquo;{q.quote}&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}

type PaperGroup = { kind: "paper"; items: RichTextBlock[] };
type QuoteGroup = { kind: "quote"; q: PullQuoteBlock };
type Group = PaperGroup | QuoteGroup;

function groupBlocks(blocks: BodyBlock[]): Group[] {
  const groups: Group[] = [];
  let buf: RichTextBlock[] = [];
  for (const b of blocks) {
    if (b.kind === "pull_quote") {
      if (buf.length) {
        groups.push({ kind: "paper", items: buf });
        buf = [];
      }
      groups.push({ kind: "quote", q: b });
    } else {
      buf.push(b);
    }
  }
  if (buf.length) groups.push({ kind: "paper", items: buf });
  return groups;
}

export function ArticleBody({ blocks }: ArticleBodyProps) {
  const groups = groupBlocks(blocks);
  return (
    <div data-jsonblock="field_body (paragraphs)">
      {groups.map((g, i) =>
        g.kind === "paper" ? (
          <section key={i} className={styles.paperSection}>
            <div className={styles.paperInner}>
              <div className={styles.paperColumn}>
                {g.items.map((it, j) => (
                  <RichText key={j} html={it.html} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <PullQuote key={i} q={g.q} />
        )
      )}
    </div>
  );
}

export default ArticleBody;

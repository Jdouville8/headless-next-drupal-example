// SiteFooter.tsx — Drupal block: site_footer
//
// 4-column grid on the navy band: link columns, partnerships, social + legal
// + tagline lockup. Server component.

import { Fragment } from "react";
import Link from "next/link";

import { Icon, type IconName } from "@/components/site/Icon";
import { SITE } from "@/components/site/site-data";

import styles from "./SiteFooter.module.css";

const SOCIAL_ICON_MAP: Record<
  "facebook" | "x" | "youtube" | "instagram" | "linkedin",
  IconName
> = {
  facebook: "fb",
  x: "x",
  youtube: "yt",
  instagram: "ig",
  linkedin: "li",
};

export function SiteFooter() {
  const f = SITE.footer;
  return (
    <footer data-jsonblock="block: site_footer" className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {f.columns.map((col) => (
            <div key={col.heading}>
              <div className={styles.colHeading}>{col.heading}</div>
              <ul className={styles.linkList}>
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className={styles.linkItem}>
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <div className={styles.colHeading}>{f.partnerships_heading}</div>
            <div className={styles.partnerships}>
              {f.partnerships.map((p, i) => (
                <Fragment key={p}>
                  {i > 0 && (
                    <span className={styles.partnershipPipe} aria-hidden="true">
                      |
                    </span>
                  )}
                  <div className={styles.partnership}>{p}</div>
                </Fragment>
              ))}
            </div>
            <div className={styles.partnershipFootnote}>
              OFFICIAL CONTINENTAL PARTNER
            </div>
          </div>
          <div>
            <div className={styles.social}>
              {f.social.map((s) => (
                <Link
                  key={s}
                  href="#"
                  aria-label={s}
                  className={styles.socialLink}
                >
                  <Icon
                    name={SOCIAL_ICON_MAP[s]}
                    size={22}
                    color="var(--paper)"
                  />
                </Link>
              ))}
            </div>
            <ul className={styles.legalList}>
              {f.legal_links.map((l) => (
                <li key={l}>
                  <Link href="#" className={styles.linkItem}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
            <div className={styles.taglineRow}>
              <div className={styles.taglineMark} aria-hidden="true">
                M
              </div>
              <div>
                <div className={styles.taglinePrimary}>{f.tagline.primary}</div>
                <div className={styles.taglineSecondary}>
                  {f.tagline.secondary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;

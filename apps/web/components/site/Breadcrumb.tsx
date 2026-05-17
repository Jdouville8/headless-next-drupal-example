// Breadcrumb.tsx — Drupal block: breadcrumb
//
// Pill chips on a paper-toned band. Server component.

import { Fragment } from "react";
import Link from "next/link";

import { Icon } from "@/components/site/Icon";
import type { Breadcrumb as BreadcrumbItem } from "@/types/article";

import styles from "./Breadcrumb.module.css";

export type BreadcrumbProps = {
  crumbs: BreadcrumbItem[];
};

export function Breadcrumb({ crumbs }: BreadcrumbProps) {
  return (
    <div data-jsonblock="block: breadcrumb" className={styles.wrapper}>
      <div className={styles.inner}>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={`${i}-${c.label}`}>
              {i > 0 && (
                <span className={styles.sep} aria-hidden="true">
                  <Icon name="chev" size={14} color="var(--body-soft)" />
                </span>
              )}
              {c.icon === "home" ? (
                <Link href={c.href ?? "#"} className={styles.homeLink} aria-label={c.label}>
                  <Icon name="home" size={16} />
                </Link>
              ) : last ? (
                <span className={styles.currentPill} aria-current="page">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href ?? "#"} className={styles.pillLink}>
                  {c.label}
                </Link>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default Breadcrumb;

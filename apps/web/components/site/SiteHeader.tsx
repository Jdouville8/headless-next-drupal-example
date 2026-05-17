// SiteHeader.tsx — Drupal block: site_header
//
// Two-band header: utility nav row above, brand + primary nav below.
// Server component — no client state.

import Link from "next/link";

import { Icon } from "@/components/site/Icon";
import { SITE } from "@/components/site/site-data";

import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header data-jsonblock="block: site_header" className={styles.header}>
      <div className={styles.utility}>
        <div className={styles.utilityInner}>
          {SITE.utility_nav.map((u) => (
            <Link key={u.label} href="#" className={styles.utilityBtn}>
              <Icon name={u.icon} size={16} />
              <span>{u.label}</span>
            </Link>
          ))}
          <div className={styles.region}>{SITE.region}</div>
        </div>
      </div>
      <div className={styles.brandBand}>
        <div className={styles.brandInner}>
          <Link href="#" className={styles.brandLink}>
            <div className={styles.brandMark} aria-hidden="true">
              {SITE.brand.mark}
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>{SITE.brand.name}</span>
              <span className={styles.brandEyebrow}>
                Industrial · est. 1925
              </span>
            </div>
          </Link>
          <nav className={styles.primaryNav}>
            {SITE.primary_nav.map((n, i) => (
              <Link
                key={n}
                href="#"
                className={i === 2 ? styles.navLinkActive : styles.navLink}
              >
                {n}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;

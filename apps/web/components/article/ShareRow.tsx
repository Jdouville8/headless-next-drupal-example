// ShareRow.tsx
//
// Client island for the share buttons. Most targets are static share-intent
// links (`<a>`), but `copy` needs `navigator.clipboard`, so the whole row is
// a small client component.

"use client";

import { useEffect, useState } from "react";

import { Icon, type IconName } from "@/components/site/Icon";
import type { ShareTarget } from "@/types/article";

import styles from "./ShareRow.module.css";

const ICON_MAP: Record<ShareTarget, IconName> = {
  facebook: "fb",
  x: "x",
  linkedin: "li",
  email: "email",
  print: "print",
  copy: "link",
};

export type ShareRowProps = {
  items: ShareTarget[];
  title?: string;
};

function buildShareUrl(target: ShareTarget, pageUrl: string, title: string): string | null {
  const u = encodeURIComponent(pageUrl);
  const t = encodeURIComponent(title);
  switch (target) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "x":
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "email":
      return `mailto:?subject=${t}&body=${u}`;
    case "print":
    case "copy":
      return null;
    default:
      return null;
  }
}

export function ShareRow({ items, title = "" }: ShareRowProps) {
  const [pageUrl, setPageUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no-op: clipboard access can be denied */
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className={styles.row}>
      <span className={styles.label}>Share:</span>
      {items.map((k) => {
        const iconName = ICON_MAP[k];
        const labelKey = k.charAt(0).toUpperCase() + k.slice(1);

        if (k === "copy") {
          return (
            <button
              key={k}
              type="button"
              aria-label="Copy link"
              onClick={handleCopy}
              className={styles.btn}
            >
              <Icon name={iconName} size={18} color="var(--paper)" />
            </button>
          );
        }

        if (k === "print") {
          return (
            <button
              key={k}
              type="button"
              aria-label="Print article"
              onClick={handlePrint}
              className={styles.btn}
            >
              <Icon name={iconName} size={18} color="var(--paper)" />
            </button>
          );
        }

        const href = buildShareUrl(k, pageUrl, title);
        return (
          <a
            key={k}
            href={href ?? "#"}
            target={k === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={`Share via ${labelKey}`}
            className={styles.btn}
          >
            <Icon name={iconName} size={18} color="var(--paper)" />
          </a>
        );
      })}
      {copied && <span className={styles.toast}>Link copied</span>}
    </div>
  );
}

export default ShareRow;

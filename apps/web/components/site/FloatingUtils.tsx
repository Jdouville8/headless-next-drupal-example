// FloatingUtils.tsx
//
// Bottom-right utility stack (Back to top + Live Chat). The back-to-top
// click handler needs `window`, so this is a client component.

"use client";

import { Icon } from "@/components/site/Icon";

import styles from "./FloatingUtils.module.css";

export function FloatingUtils() {
  return (
    <div className={styles.stack}>
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={styles.backToTop}
      >
        <Icon name="up" size={20} color="var(--ink)" />
      </button>
      <button
        type="button"
        aria-label="Live chat"
        className={styles.liveChat}
        // TODO(design): hook up the actual chat widget; out of scope for the article page handoff.
      >
        <Icon name="chat" size={20} color="var(--paper)" />
        <div className={styles.liveChatLabel}>
          LIVE
          <br />
          CHAT
        </div>
      </button>
    </div>
  );
}

export default FloatingUtils;

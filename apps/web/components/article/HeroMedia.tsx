// HeroMedia.tsx — field_hero_media (media reference)
//
// Renders the 16:9 hero block on the navy band. When `media.kind === "image"`
// and a `src` is present, renders a `next/image` <Image>. Otherwise renders
// the striped placeholder texture from the prototype (which doubles as the
// video poster fallback).

import Image from "next/image";

import { Icon } from "@/components/site/Icon";
import type { HeroMedia as HeroMediaType } from "@/types/article";

import styles from "./HeroMedia.module.css";

export type HeroMediaProps = {
  media: HeroMediaType;
};

export function HeroMedia({ media }: HeroMediaProps) {
  if (media.kind === "image" && media.src) {
    return (
      <div
        data-jsonblock="field_hero_media (media reference)"
        className={styles.band}
      >
        <div className={styles.inner}>
          <div className={styles.frame} aria-label={media.alt}>
            <Image
              src={media.src}
              alt={media.alt}
              fill
              sizes="(max-width: 1120px) 100vw, 1120px"
              className={styles.image}
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  const ariaLabel =
    media.kind === "image" ? media.alt : media.poster_alt;
  const label =
    media.kind === "video"
      ? `[ Hero · video ·  ${media.duration_sec}s ] — ${media.poster_alt}`
      : null;

  return (
    <div
      data-jsonblock="field_hero_media (media reference)"
      className={styles.band}
    >
      <div className={styles.inner}>
        <div className={styles.frame} aria-label={ariaLabel}>
          <div aria-hidden="true" className={styles.stripes} />
          <div aria-hidden="true" className={styles.horizon} />
          {label && <div className={styles.label}>{label}</div>}
          <button
            type="button"
            aria-label="Play video"
            className={styles.play}
          >
            <Icon name="play" size={32} color="var(--paper)" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroMedia;

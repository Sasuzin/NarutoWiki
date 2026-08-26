import styles from "./Brand.module.css";

/** Quadrado da marca: ナ com o cabelo saindo por cima, um SVG por tema. */
export function BrandTile({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span className={`${styles.tile} ${size === "md" ? styles.md : styles.sm}`} aria-hidden>
      <svg className={`${styles.hair} ${styles.hairLight}`} viewBox="0 0 48 18">
        <path
          d="M0 18 L2 8 L6 12 L9 1 L14 10 L18 3 L23 7 L27 0 L32 9 L36 4 L41 11 L45 7 L48 18 Z"
          fill="var(--hair-light)"
        />
      </svg>
      <svg className={`${styles.hair} ${styles.hairDark}`} viewBox="0 0 48 34">
        <path
          d="M1 17 L0 7 L7 11 L5 0 L14 8 L20 2 L27 7 L33 0 L39 9 L46 4 L47 17 Z"
          fill="var(--hair-dark)"
        />
        <path d="M1 12 L8.5 15 L3.5 33 Z" fill="var(--hair-dark)" />
        <path d="M47 12 L39.5 15 L44.5 28 Z" fill="var(--hair-dark)" />
      </svg>
      ナ
    </span>
  );
}

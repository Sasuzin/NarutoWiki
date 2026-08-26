import styles from "./ImageLayer.module.css";

/**
 * Camada de imagem por background-image. Nunca use <img> nestes lugares: a
 * arte fica sobre um monograma de fallback e uma URL morta precisa simplesmente
 * nao pintar nada.
 */
export function ImageLayer({
  url,
  label,
  fit = "cover",
  style,
}: {
  url: string;
  /** Rotulo acessivel; sem ele a camada e tratada como decoracao. */
  label?: string;
  fit?: "cover" | "contain";
  style?: React.CSSProperties;
}) {
  if (!url) return null;
  return (
    <span
      className={fit === "contain" ? styles.contain : styles.cover}
      style={{ backgroundImage: `url("${url}")`, ...style }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    />
  );
}

/** Simbolo de vila com recuo, desenhado por cima do monograma. */
export function SymbolLayer({ url, inset }: { url: string; inset: number }) {
  if (!url) return null;
  return (
    <span
      aria-hidden
      className={styles.symbol}
      style={{ inset: `${inset}px`, backgroundImage: `url("${url}")` }}
    />
  );
}

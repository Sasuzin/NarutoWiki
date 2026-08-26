import styles from "./LoadingState.module.css";

const SKELETON = Array.from({ length: 12 }, (_, i) => i);

/**
 * Titulo fantasma + 12 cards pulsando. `slow` entra em 4,5s: nesse ponto a
 * demora quase sempre e o servidor gratuito acordando, e vale dizer isso.
 */
export function LoadingState({ slow }: { slow: boolean }) {
  return (
    <div>
      <div className={styles.ghostTitle} />
      <div className={styles.note} role="status">
        {slow
          ? "O servidor gratuito estava hibernando — acordando, isso leva alguns segundos."
          : "Carregando 1.400+ registros da API…"}
      </div>
      <div className={styles.grid} aria-hidden>
        {SKELETON.map((i) => (
          <div key={i} className={styles.card}>
            <div className={styles.thumb} />
            <div className={styles.line} />
          </div>
        ))}
      </div>
    </div>
  );
}

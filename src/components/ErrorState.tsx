import styles from "./ErrorState.module.css";
import ui from "./ui.module.css";

/** "Tentar de novo" refaz as oito chamadas do zero. */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={`${ui.card} ${styles.box}`} role="alert">
      <div className={styles.title}>Não deu para falar com a API</div>
      <div className={styles.message}>{message}</div>
      <div className={styles.action}>
        <button type="button" className={ui.btnPrimary} onClick={onRetry}>
          Tentar de novo
        </button>
      </div>
    </div>
  );
}

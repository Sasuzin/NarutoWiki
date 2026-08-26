import type { ReactNode } from "react";
import { SORT_OPTIONS, type SortKey } from "../data/filters";
import { plural } from "../data/normalize";
import styles from "./ListChrome.module.css";
import ui from "./ui.module.css";

/** Contagem a esquerda, controle de ordenacao a direita. */
export function ResultsBar({ total, children }: { total: number; children?: ReactNode }) {
  return (
    <div className={styles.resultsBar}>
      <div className={styles.count} role="status">
        {plural(total, "resultado", "resultados")}
      </div>
      {children}
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <label className={styles.sort}>
      Ordenar
      <select
        className={`${ui.select} ${ui.selectSm}`}
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className={`${ui.card} ${styles.empty}`}>
      <div className={styles.emptyTitle}>{title}</div>
      {hint && <div className={styles.emptyHint}>{hint}</div>}
    </div>
  );
}

export function ShowMore({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <div className={styles.more}>
      <button type="button" className={ui.btnGhost} onClick={onClick}>
        Mostrar mais ({count})
      </button>
    </div>
  );
}

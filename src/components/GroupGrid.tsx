import type { GroupCardModel } from "../data/cards";
import { plural } from "../data/normalize";
import { SymbolLayer } from "./ImageLayer";
import styles from "./GroupGrid.module.css";

export function GroupGrid({ items }: { items: GroupCardModel[] }) {
  return (
    <div className={styles.grid}>
      {items.map((g) => (
        <a key={g.id} href={g.href} className={styles.card}>
          <span className={styles.tile}>
            <span className={styles.tileInitials} aria-hidden>
              {g.initials}
            </span>
            <SymbolLayer url={g.symbol} inset={7} />
          </span>
          <span className={styles.text}>
            <span className={styles.name}>{g.name}</span>
            <span className={styles.count}>{plural(g.count, "personagem", "personagens")}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

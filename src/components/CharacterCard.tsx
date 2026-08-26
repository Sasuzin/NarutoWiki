import type { CardModel } from "../data/cards";
import { useApp } from "../store/AppProvider";
import { ImageLayer } from "./ImageLayer";
import styles from "./CharacterCard.module.css";
import ui from "./ui.module.css";

function CharacterCard({ card }: { card: CardModel }) {
  const { isFavorite, toggleFavorite } = useApp();
  const saved = card.favorable && isFavorite(card.id);

  return (
    <div className={styles.card}>
      <a href={card.href} className={styles.link}>
        <span className={styles.thumb}>
          <span className={styles.monogram} aria-hidden>
            {card.initials}
          </span>
          <ImageLayer url={card.image} label={card.name} />
        </span>
        <span className={styles.body}>
          <span className={styles.name}>{card.name}</span>
          <span className={styles.badges}>
            {card.village && (
              <span className={`${ui.tagBadge} ${ui.info}`}>{card.village}</span>
            )}
            {card.rank && <span className={`${ui.tagBadge} ${ui.outline}`}>{card.rank}</span>}
          </span>
        </span>
      </a>
      {card.favorable && (
        <button
          type="button"
          className={styles.fav}
          data-on={saved}
          aria-pressed={saved}
          title={saved ? `Remover ${card.name} dos favoritos` : `Favoritar ${card.name}`}
          onClick={() => toggleFavorite(card.id)}
        >
          <span aria-hidden>★</span>
          <span className="srOnly">
            {saved ? `Remover ${card.name} dos favoritos` : `Favoritar ${card.name}`}
          </span>
        </button>
      )}
    </div>
  );
}

export function CharacterGrid({ items }: { items: CardModel[] }) {
  return (
    <div className={styles.grid}>
      {items.map((card) => (
        <CharacterCard key={card.id} card={card} />
      ))}
    </div>
  );
}

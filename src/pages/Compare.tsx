import { useMemo, useState } from "react";
import { ImageLayer } from "../components/ImageLayer";
import { buildCompareRows } from "../data/compare";
import { imgOf, initials, norm, rankOf } from "../data/normalize";
import { href } from "../data/routes";
import { useApp, useDex } from "../store/AppProvider";
import styles from "./Compare.module.css";
import ui from "../components/ui.module.css";

/** Quantos nomes a busca de cada slot oferece. */
const MAX_RESULTS = 8;

export function Compare() {
  const dex = useDex();
  const { compare, setCompareSlot } = useApp();

  // Texto de busca de cada slot: interessa so a esta tela.
  const [queries, setQueries] = useState<[string, string]>(["", ""]);

  const a = compare[0] === null ? undefined : dex.get(compare[0]);
  const b = compare[1] === null ? undefined : dex.get(compare[1]);

  const rows = useMemo(() => (a && b ? buildCompareRows(dex, a, b) : []), [dex, a, b]);

  const setQuery = (slot: 0 | 1, value: string) => {
    setQueries((prev) => (slot === 0 ? [value, prev[1]] : [prev[0], value]));
  };

  const pick = (slot: 0 | 1, id: number | null) => {
    setCompareSlot(slot, id);
    setQuery(slot, "");
  };

  return (
    <div>
      <h1 className={ui.pageTitle}>Comparar ninjas</h1>
      <p className={ui.pageSub}>Escolha dois personagens e veja os atributos lado a lado.</p>

      <div className={styles.slots}>
        {([0, 1] as const).map((slot) => (
          <Slot
            key={slot}
            slot={slot}
            query={queries[slot]}
            onQuery={(value) => setQuery(slot, value)}
            onPick={(id) => pick(slot, id)}
            onClear={() => pick(slot, null)}
          />
        ))}
      </div>

      {rows.length > 0 && (
        <div className={`${ui.card} ${ui.cardClip} ${styles.table}`}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <div className={styles.valueA}>{row.a}</div>
              <div className={styles.rowLabel}>{row.label}</div>
              <div className={styles.valueB}>{row.b}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Slot({
  slot,
  query,
  onQuery,
  onPick,
  onClear,
}: {
  slot: 0 | 1;
  query: string;
  onQuery: (value: string) => void;
  onPick: (id: number) => void;
  onClear: () => void;
}) {
  const dex = useDex();
  const { compare } = useApp();
  const id = compare[slot];
  const character = id === null ? undefined : dex.get(id);

  const results = useMemo(() => {
    const q = norm(query);
    if (q.length < 2) return [];
    return dex.characters.filter((c) => norm(c.name).includes(q)).slice(0, MAX_RESULTS);
  }, [dex, query]);

  const subtitle = character
    ? [dex.villageOf(character)?.name ?? "", rankOf(character)].filter(Boolean).join(" · ")
    : "";

  return (
    <div className={`${ui.card} ${ui.cardClip}`}>
      <div className={styles.slotHead}>
        <input
          className={styles.input}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={character ? "Trocar personagem…" : `Buscar personagem ${slot + 1}…`}
          aria-label={`Buscar personagem ${slot + 1}`}
          autoComplete="off"
        />
        {character && (
          <button type="button" className={styles.swap} onClick={onClear}>
            Trocar
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((c) => (
            <button key={c.id} type="button" className={styles.result} onClick={() => onPick(c.id)}>
              <span className={styles.resultTile}>{initials(c.name)}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {character && (
        <div className={styles.picked}>
          <span className={styles.pickedThumb}>
            <span className={styles.pickedInitials} aria-hidden>
              {initials(character.name)}
            </span>
            <ImageLayer url={imgOf(character)} label={character.name} />
          </span>
          <span className={styles.pickedText}>
            <a href={href.character(character.id)} className={styles.pickedName}>
              {character.name}
            </a>
            <span className={styles.pickedSub}>{subtitle}</span>
          </span>
        </div>
      )}
    </div>
  );
}

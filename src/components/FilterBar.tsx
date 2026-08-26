import { useMemo } from "react";
import type { Filters } from "../data/filters";
import { useApp, useDex } from "../store/AppProvider";
import styles from "./FilterBar.module.css";
import ui from "./ui.module.css";

interface FieldDef {
  key: keyof Filters;
  label: string;
  all: string;
  options: string[];
}

/**
 * A API repete nome em coleccao diferente: existem dois registros "Hyūga",
 * dois "Uzumaki", dois "Senju". O filtro casa por nome, entao a opcao
 * duplicada nao filtraria nada de novo — some da lista.
 */
function uniqueNames(items: { name: string }[]): string[] {
  return [...new Set(items.map((i) => i.name))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Os cinco filtros combinados. As opcoes saem do que a API trouxe, nao de lista fixa. */
export function FilterBar() {
  const dex = useDex();
  const { filters, setFilter, clearFilters } = useApp();

  const fields = useMemo<FieldDef[]>(
    () => [
      { key: "village", label: "Vila", all: "Todas", options: uniqueNames(dex.villages) },
      { key: "clan", label: "Clã", all: "Todos", options: uniqueNames(dex.clans) },
      { key: "nature", label: "Natureza", all: "Todas", options: dex.natures },
      { key: "rank", label: "Rank", all: "Todos", options: dex.ranks },
      { key: "status", label: "Status", all: "Todos", options: dex.statuses },
    ],
    [dex],
  );

  return (
    <div className={`${ui.card} ${styles.bar}`}>
      {fields.map((field) => (
        <label key={field.key} className={styles.field}>
          <span className={ui.fieldLabel}>{field.label}</span>
          <select
            className={ui.select}
            value={filters[field.key]}
            onChange={(e) => setFilter(field.key, e.target.value)}
          >
            <option value="">{field.all}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        type="button"
        className={`${ui.btnGhost} ${ui.btnGhostSm} ${styles.clear}`}
        onClick={clearFilters}
      >
        Limpar
      </button>
    </div>
  );
}

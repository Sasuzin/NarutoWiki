import type { Character } from "../api/types";
import type { Dex } from "./dex";
import { naturesOf, norm, numOf, rankOf, rankWeight, statusOf } from "./normalize";

export interface Filters {
  village: string;
  clan: string;
  nature: string;
  rank: string;
  status: string;
}

export const EMPTY_FILTERS: Filters = { village: "", clan: "", nature: "", rank: "", status: "" };

export type SortKey = "name" | "rank" | "age" | "height" | "weight";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Nome (A–Z)" },
  { value: "rank", label: "Rank ninja" },
  { value: "age", label: "Idade" },
  { value: "height", label: "Altura" },
  { value: "weight", label: "Peso" },
];

const byName = (a: Character, b: Character) => a.name.localeCompare(b.name, "pt-BR");

/** Numerico decrescente: quem nao tem valor cai pro fim (numOf devolve -1). */
const byNumberDesc = (field: "age" | "height" | "weight") => (a: Character, b: Character) =>
  numOf(b.personal?.[field]) - numOf(a.personal?.[field]);

const SORTERS: Record<SortKey, (a: Character, b: Character) => number> = {
  name: byName,
  rank: (a, b) => rankWeight(rankOf(a)) - rankWeight(rankOf(b)) || byName(a, b),
  age: byNumberDesc("age"),
  height: byNumberDesc("height"),
  weight: byNumberDesc("weight"),
};

/**
 * Busca, cinco filtros combinados e ordenacao — tudo em memoria.
 * O filtro de vila casa com QUALQUER vila do personagem (nao so a principal),
 * senao quem aparece em duas desapareceria da vila secundaria.
 */
export function filterAndSortCharacters(
  dex: Dex,
  query: string,
  filters: Filters,
  sort: SortKey,
): Character[] {
  const q = norm(query);
  let list = dex.characters;

  if (q) list = list.filter((c) => norm(c.name).includes(q));
  if (filters.village) {
    list = list.filter((c) => dex.villagesOf(c).some((v) => v.name === filters.village));
  }
  if (filters.clan) list = list.filter((c) => dex.clanOf(c)?.name === filters.clan);
  if (filters.nature) list = list.filter((c) => naturesOf(c).includes(filters.nature));
  if (filters.rank) list = list.filter((c) => rankOf(c) === filters.rank);
  if (filters.status) list = list.filter((c) => statusOf(c) === filters.status);

  return [...list].sort(SORTERS[sort] ?? SORTERS.name);
}

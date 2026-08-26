import type { Character } from "../api/types";
import type { Dex } from "./dex";
import { fmt, naturesOf, rankOf, statusLabel, statusOf } from "./normalize";

export interface CompareRow {
  label: string;
  a: string;
  b: string;
}

type Field =
  | "village"
  | "clan"
  | "rank"
  | "status"
  | "age"
  | "height"
  | "weight"
  | "bloodType"
  | "kekkei"
  | "natures"
  | "jutsu"
  | "tools"
  | "teams"
  | "classification";

const ROWS: { field: Field; label: string }[] = [
  { field: "village", label: "Vila" },
  { field: "clan", label: "Clã" },
  { field: "rank", label: "Rank" },
  { field: "status", label: "Status" },
  { field: "age", label: "Idade" },
  { field: "height", label: "Altura" },
  { field: "weight", label: "Peso" },
  { field: "bloodType", label: "Sangue" },
  { field: "kekkei", label: "Kekkei genkai" },
  { field: "natures", label: "Naturezas" },
  { field: "jutsu", label: "Jutsu" },
  { field: "tools", label: "Ferramentas" },
  { field: "teams", label: "Times" },
  { field: "classification", label: "Classificação" },
];

function value(dex: Dex, c: Character, field: Field): string {
  const p = c.personal ?? {};
  switch (field) {
    case "village":
      return dex.villageOf(c)?.name ?? "";
    case "clan":
      return dex.clanOf(c)?.name ?? "";
    case "rank":
      return rankOf(c);
    case "status": {
      const status = statusOf(c);
      return status ? statusLabel(status) : "";
    }
    case "natures":
      return naturesOf(c).join(" · ");
    case "jutsu":
      return String(c.jutsu?.length ?? 0);
    case "tools":
      return String(c.tools?.length ?? 0);
    case "teams":
      return dex
        .teamsOf(c)
        .slice(0, 3)
        .map((t) => t.name)
        .join(" · ");
    case "kekkei":
      return fmt(p.kekkeiGenkai);
    default:
      return fmt(p[field]);
  }
}

/** As 14 linhas do comparador. Campo ausente vira travessao. */
export function buildCompareRows(dex: Dex, a: Character, b: Character): CompareRow[] {
  return ROWS.map((row) => ({
    label: row.label,
    a: value(dex, a, row.field) || "—",
    b: value(dex, b, row.field) || "—",
  }));
}

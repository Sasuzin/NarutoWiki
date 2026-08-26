import type { Character, Group, Poly } from "../api/types";

/** Minusculas sem acento: base de toda comparacao de nome. */
export function norm(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Achata um campo polimorfico em texto legivel.
 * Array -> "a · b"; objeto por arco -> "Part I: 12 · Part II: 15-17".
 */
export function fmt(value: Poly): string {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.filter(Boolean).map(fmt).join(" · ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${fmt(val as Poly)}`)
      .join(" · ");
  }
  return String(value);
}

/**
 * O valor mais recente de um campo por arco — usado em rank, status, idade,
 * altura e peso, onde "Part II" interessa mais que "Part I".
 */
export function lastVal(value: Poly): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return String(value[value.length - 1] ?? "");
  if (typeof value === "object") {
    const vals = Object.values(value);
    return String(vals[vals.length - 1] ?? "");
  }
  return String(value);
}

/**
 * Tira o ruido de wiki dos textos raspados:
 * "childOfTheProphecy(予言の子,YogenNoKo)" -> "child Of The Prophecy".
 * Ordem importa: parenteses -> faixas CJK -> camelCase -> espacos.
 */
export function cleanText(value: Poly): string {
  if (value === null || value === undefined) return "";
  let s = String(value).replace(/\s*\([^)]*\)\s*/g, " ");
  s = s.replace(/[\u3000-\u30FF\u3400-\u9FFF\uFF00-\uFFEF]/g, " ");
  s = s.replace(/([a-z\d])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  s = s
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,\-–]+|[\s,\-–]+$/g, "");
  return s;
}

/** cleanText em lote, sem duplicata e descartando sobras de menos de 3 letras. */
export function cleanList(value: Poly): string[] {
  const arr: Poly[] =
    value === null || value === undefined
      ? []
      : Array.isArray(value)
        ? value
        : typeof value === "object"
          ? (Object.values(value) as Poly[])
          : [value];
  const out: string[] = [];
  for (const item of arr) {
    const text = cleanText(item);
    if (text.length > 2 && !out.includes(text)) out.push(text);
  }
  return out;
}

/** Rank ninja mais recente, sem o "(Part I)" e afins. */
export function rankOf(c: Character): string {
  return lastVal(c.rank?.ninjaRank).replace(/\s*\(.*\)\s*/g, "").trim();
}

export function statusOf(c: Character): string {
  return lastVal(c.personal?.status).trim();
}

/** "Wind Release  (Affinity)" -> "Wind Release", para agrupar e filtrar. */
export function naturesOf(c: Character): string[] {
  return (c.natureType ?? [])
    .map((n) => String(n).replace(/\s*\(.*?\)\s*/g, "").trim())
    .filter(Boolean);
}

/** Primeiro numero do valor mais recente; -1 quando nao ha numero (vai pro fim). */
export function numOf(value: Poly): number {
  const match = lastVal(value).match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : -1;
}

/** Monograma de fallback: iniciais das duas primeiras palavras. */
export function initials(name: string | undefined): string {
  return (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export function imgOf(c: Character | undefined | null): string {
  return c?.images?.[0] ?? "";
}

/**
 * Simbolo da vila por hotlink no Naruto Wiki. 6 das 39 vilas nao tem arquivo —
 * quem desenha isso pinta como background-image sobre o monograma, entao a
 * falha some sozinha.
 */
export function symbolUrl(name: string | undefined): string {
  const base = String(name ?? "").replace(/\s+/g, "_");
  return `https://naruto.fandom.com/wiki/Special:FilePath/${encodeURIComponent(`${base}_Symbol.svg`)}`;
}

/** Ordem hierarquica do rank ninja; fora da lista vai pro fim. */
export const RANK_ORDER = [
  "Kage",
  "Sannin",
  "Jōnin",
  "Anbu",
  "Tokubetsu Jōnin",
  "Chūnin",
  "Genin",
  "Academy Student",
] as const;

export function rankWeight(rank: string): number {
  const i = (RANK_ORDER as readonly string[]).indexOf(rank);
  return i < 0 ? 99 : i;
}

const FAMILY_LABELS: Record<string, string> = {
  father: "Pai",
  mother: "Mãe",
  son: "Filho",
  daughter: "Filha",
  wife: "Esposa",
  husband: "Marido",
  brother: "Irmão",
  sister: "Irmã",
  "older brother": "Irmão mais velho",
  "younger brother": "Irmão mais novo",
  "older sister": "Irmã mais velha",
  "younger sister": "Irmã mais nova",
  uncle: "Tio",
  aunt: "Tia",
  cousin: "Primo(a)",
  grandfather: "Avô",
  grandmother: "Avó",
  grandson: "Neto",
  granddaughter: "Neta",
  nephew: "Sobrinho",
  niece: "Sobrinha",
  "adoptive son": "Filho adotivo",
  "adoptive father": "Pai adotivo",
  "adoptive brother": "Irmão adotivo",
  "great-grandfather": "Bisavô",
  "great-grandmother": "Bisavó",
  godfather: "Padrinho",
  creator: "Criador",
  ancestor: "Ancestral",
  descendant: "Descendente",
  "son-in-law": "Genro",
  "daughter-in-law": "Nora",
  "father-in-law": "Sogro",
  "mother-in-law": "Sogra",
  "brother-in-law": "Cunhado",
  "sister-in-law": "Cunhada",
};

export function famLabel(key: string): string {
  return (
    FAMILY_LABELS[key] ??
    key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase())
  );
}

export function sexLabel(value: Poly): string {
  const raw = fmt(value);
  if (raw === "Male") return "Masculino";
  if (raw === "Female") return "Feminino";
  return raw;
}

export function statusLabel(status: string): string {
  if (status === "Deceased") return "Falecido";
  if (status === "Alive") return "Vivo";
  return status;
}

export function memberCount(g: Group): number {
  return g.characters?.length ?? 0;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

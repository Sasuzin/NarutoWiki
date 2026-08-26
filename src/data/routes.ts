/** Rotas por hash — funcionam em hospedagem estatica sem nenhum rewrite. */
export const ROUTE_NAMES = [
  "home",
  "personagens",
  "vilas",
  "clas",
  "times",
  "kekkei",
  "bestas",
  "akatsuki",
  "kara",
  "favoritos",
  "comparar",
  "quiz",
] as const;

export type RouteName = (typeof ROUTE_NAMES)[number];

export interface Route {
  name: RouteName;
  /** Sempre string: id de vila comeca em 0, entao numero cairia no falsy. */
  id: string | null;
}

function isRouteName(value: string): value is RouteName {
  return (ROUTE_NAMES as readonly string[]).includes(value);
}

export function parseHash(hash: string): Route {
  const parts = (hash || "#/").replace(/^#\/?/, "").split("/").filter(Boolean);
  const head = parts[0] ?? "home";
  const name = isRouteName(head) ? head : "home";
  return { name, id: parts[1] ? decodeURIComponent(parts[1]) : null };
}

export const href = {
  home: "#/",
  characters: "#/personagens",
  character: (id: number) => `#/personagens/${id}`,
  villages: "#/vilas",
  village: (id: number) => `#/vilas/${id}`,
  clans: "#/clas",
  clan: (id: number) => `#/clas/${id}`,
  teams: "#/times",
  team: (id: number) => `#/times/${id}`,
  kekkei: "#/kekkei",
  kekkeiOne: (id: number) => `#/kekkei/${id}`,
  beasts: "#/bestas",
  beast: (id: number) => `#/bestas/${id}`,
  akatsuki: "#/akatsuki",
  kara: "#/kara",
  favorites: "#/favoritos",
  compare: "#/comparar",
  quiz: "#/quiz",
} as const;

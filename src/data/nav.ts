import type { Dex } from "./dex";
import { href, type RouteName } from "./routes";

export interface NavItem {
  key: RouteName;
  label: string;
  href: string;
  /** null nao pinta contagem (rotas sem coleccao, ou zero favorito). */
  count: number | null;
}

/** Os 12 itens do menu, com a contagem que cada coleccao trouxe da API. */
export function buildNav(dex: Dex | null, favoriteCount: number): NavItem[] {
  return [
    { key: "home", label: "Início", href: href.home, count: null },
    { key: "personagens", label: "Personagens", href: href.characters, count: dex?.characters.length ?? null },
    { key: "vilas", label: "Vilas", href: href.villages, count: dex?.villages.length ?? null },
    { key: "clas", label: "Clãs", href: href.clans, count: dex?.clans.length ?? null },
    { key: "times", label: "Times", href: href.teams, count: dex?.teams.length ?? null },
    { key: "kekkei", label: "Kekkei genkai", href: href.kekkei, count: dex?.kekkei.length ?? null },
    { key: "bestas", label: "Bestas com cauda", href: href.beasts, count: dex?.tailed.length ?? null },
    { key: "akatsuki", label: "Akatsuki", href: href.akatsuki, count: dex?.akatsuki.length ?? null },
    { key: "kara", label: "Kara", href: href.kara, count: dex?.kara.length ?? null },
    { key: "favoritos", label: "Favoritos", href: href.favorites, count: favoriteCount || null },
    { key: "comparar", label: "Comparar", href: href.compare, count: null },
    { key: "quiz", label: "Quiz", href: href.quiz, count: null },
  ];
}

import type { Character, Group } from "../api/types";
import type { Dex } from "./dex";
import { fmt, imgOf, initials, memberCount, rankOf, symbolUrl } from "./normalize";
import { href } from "./routes";

/** O que um card de personagem precisa — nada mais que isso. */
export interface CardModel {
  id: number;
  name: string;
  image: string;
  initials: string;
  href: string;
  /** Badge de fundo colorido: a vila principal. */
  village: string;
  /** Badge de contorno: rank ninja (ou classificacao, no caso das bestas). */
  rank: string;
  /** Bestas com cauda nao entram em favoritos: id fora do espaco de personagens. */
  favorable: boolean;
}

export function characterCard(dex: Dex, c: Character): CardModel {
  return {
    id: c.id,
    name: c.name,
    image: imgOf(c),
    initials: initials(c.name),
    href: href.character(c.id),
    village: dex.villageOf(c)?.name ?? "",
    rank: rankOf(c),
    favorable: true,
  };
}

export function beastCard(t: Character): CardModel {
  return {
    id: t.id,
    name: t.name,
    image: imgOf(t),
    initials: initials(t.name),
    href: href.beast(t.id),
    village: "",
    rank: fmt(t.personal?.classification),
    favorable: false,
  };
}

export interface GroupCardModel {
  id: number;
  name: string;
  count: number;
  href: string;
  initials: string;
  /** Vazio quando a coleccao nao tem simbolo no wiki (cla, time, kekkei). */
  symbol: string;
}

export function groupCard(
  g: Group,
  link: (id: number) => string,
  withSymbol: boolean,
): GroupCardModel {
  return {
    id: g.id,
    name: g.name,
    count: memberCount(g),
    href: link(g.id),
    initials: initials(g.name),
    symbol: withSymbol ? symbolUrl(g.name) : "",
  };
}

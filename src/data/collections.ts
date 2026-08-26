import type { Group } from "../api/types";
import type { Dex } from "./dex";
import { href } from "./routes";

export type CollectionKind = "vilas" | "clas" | "times" | "kekkei";

export interface CollectionConfig {
  title: string;
  subtitle: string;
  listHref: string;
  itemHref: (id: number) => string;
  /** So vila tem simbolo no Naruto Wiki; cla, time e kekkei ficam no monograma. */
  withSymbol: boolean;
  select: (dex: Dex) => Group[];
}

export const COLLECTIONS: Record<CollectionKind, CollectionConfig> = {
  vilas: {
    title: "Vilas",
    subtitle: "As aldeias ninja e seus habitantes registrados.",
    listHref: href.villages,
    itemHref: href.village,
    withSymbol: true,
    select: (dex) => dex.villages,
  },
  clas: {
    title: "Clãs",
    subtitle: "Linhagens e famílias ninja.",
    listHref: href.clans,
    itemHref: href.clan,
    withSymbol: false,
    select: (dex) => dex.clans,
  },
  times: {
    title: "Times",
    subtitle: "Esquadrões, forças-tarefa e grupos.",
    listHref: href.teams,
    itemHref: href.team,
    withSymbol: false,
    select: (dex) => dex.teams,
  },
  kekkei: {
    title: "Kekkei genkai",
    subtitle: "Habilidades hereditárias e quem as possui.",
    listHref: href.kekkei,
    itemHref: href.kekkeiOne,
    withSymbol: false,
    select: (dex) => dex.kekkei,
  },
};

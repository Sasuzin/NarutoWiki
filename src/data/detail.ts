import type { Character, Poly } from "../api/types";
import { characterCard, type CardModel } from "./cards";
import type { Dex } from "./dex";
import {
  cleanList,
  famLabel,
  fmt,
  initials,
  naturesOf,
  rankOf,
  sexLabel,
  statusLabel,
  statusOf,
} from "./normalize";
import { href } from "./routes";

export type BadgeVariant = "info" | "soft" | "softMuted" | "brand" | "ok" | "bad" | "warn";

export interface BadgeItem {
  key: string;
  text: string;
  variant: BadgeVariant;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface LinkItem {
  key: string;
  /** Vazio nas linhas seguintes de um mesmo grupo (Times, Kekkei genkai). */
  label: string;
  text: string;
  /** Vazio quando nao ha para onde ir (estreia, dublador, familiar sem ficha). */
  href: string;
}

export interface LinkListCard {
  key: string;
  title: string;
  items: LinkItem[];
}

export interface ChipListCard {
  key: string;
  title: string;
  items: string[];
}

export interface CharacterDetailModel {
  id: number;
  name: string;
  initials: string;
  /** Ate 6 imagens: a primeira e a principal, o resto vira miniatura. */
  images: string[];
  tagline: string;
  badges: BadgeItem[];
  stats: StatItem[];
  linkLists: LinkListCard[];
  chipLists: ChipListCard[];
  related: CardModel[];
  relatedTitle: string;
  /** Bestas com cauda ficam fora de favoritos e do comparador: id de outro espaco. */
  favorable: boolean;
}

/**
 * Espaco de ids do registro. Uma besta com cauda tem id de 1 a 10, que COLIDE
 * com id de personagem: consultar vila, cla, time ou kekkei com esse id
 * devolveria os vinculos de outro registro. Por isso o modo "beast" nao faz
 * nenhum desses lookups.
 */
export type IdSpace = "character" | "beast";

const DEBUT_LABELS: Record<string, string> = {
  manga: "Mangá",
  anime: "Anime",
  novel: "Livro",
  movie: "Filme",
  game: "Jogo",
  ova: "OVA",
};

const VOICE_LABELS: Record<string, string> = {
  japanese: "Japonês",
  english: "Inglês",
};

function buildStats(c: Character): StatItem[] {
  const p = c.personal ?? {};
  const r = c.rank ?? {};
  const stats: StatItem[] = [];
  const add = (label: string, value: Poly, formatter: (v: Poly) => string = fmt) => {
    const text = formatter(value);
    if (text) stats.push({ label, value: text });
  };

  add("Sexo", p.sex, sexLabel);
  add("Idade", p.age);
  add("Altura", p.height);
  add("Peso", p.weight);
  add("Aniversário", p.birthdate);
  add("Tipo sanguíneo", p.bloodType);
  add("Espécie", p.species);
  add("Classificação", p.classification);
  add("Rank ninja", r.ninjaRank);
  add("Registro ninja", r.ninjaRegistration);
  add("Ocupação", p.occupation);
  add("Afiliação", p.affiliation);
  add("Kekkei genkai", p.kekkeiGenkai);
  add("Kekkei mōra", p.kekkeiMōra);
  add("Kekkei tōta", p.kekkeiTōta);
  add("Bijū", p.tailedBeast);
  add("Jinchūriki", p.jinchūriki);
  add("Parceiro", p.partner);

  return stats;
}

export function buildCharacterDetail(
  dex: Dex,
  c: Character,
  space: IdSpace = "character",
): CharacterDetailModel {
  const p = c.personal ?? {};
  const isCharacter = space === "character";

  const village = isCharacter ? dex.villageOf(c) : null;
  const clan = isCharacter ? dex.clanOf(c) : null;
  const teams = isCharacter ? dex.teamsOf(c) : [];
  const kekkei = isCharacter ? dex.kekkeiOf(c) : [];

  /** Link para a ficha de um familiar, quando existe alguem com esse nome. */
  const linkToName = (name: string): string => {
    const found = dex.findByName(name);
    return found ? href.character(found.id) : "";
  };

  const linkLists: LinkListCard[] = [];

  const family = Object.entries(c.family ?? {});
  if (family.length) {
    linkLists.push({
      key: "family",
      title: "Família",
      items: family.map(([key, value]) => {
        const text = fmt(value);
        return {
          key,
          label: famLabel(key),
          text,
          // Um campo pode listar varios nomes; so o primeiro vira link.
          href: linkToName(text.split(" · ")[0] ?? ""),
        };
      }),
    });
  }

  const bonds: LinkItem[] = [];
  if (village) bonds.push({ key: "village", label: "Vila", text: village.name, href: href.village(village.id) });
  if (clan) bonds.push({ key: "clan", label: "Clã", text: clan.name, href: href.clan(clan.id) });
  teams.slice(0, 6).forEach((t, i) => {
    bonds.push({ key: `team${i}`, label: i === 0 ? "Times" : "", text: t.name, href: href.team(t.id) });
  });
  kekkei.forEach((k, i) => {
    bonds.push({
      key: `kekkei${i}`,
      label: i === 0 ? "Kekkei genkai" : "",
      text: k.name,
      href: href.kekkeiOne(k.id),
    });
  });
  if (bonds.length) linkLists.push({ key: "bonds", title: "Vínculos", items: bonds });

  const debut = Object.entries(c.debut ?? {}).filter(([key]) => key !== "appearsIn");
  if (debut.length) {
    linkLists.push({
      key: "debut",
      title: "Estreia",
      items: debut.map(([key, value]) => ({
        key,
        label: DEBUT_LABELS[key] ?? key,
        text: fmt(value),
        href: "",
      })),
    });
  }

  const voices = Object.entries(c.voiceActors ?? {});
  if (voices.length) {
    linkLists.push({
      key: "voices",
      title: "Dubladores",
      items: voices.map(([key, value]) => ({
        key,
        label: VOICE_LABELS[key] ?? key,
        text: fmt(value),
        href: "",
      })),
    });
  }

  const chipLists: ChipListCard[] = [];
  const addChips = (key: string, title: string, items: string[]) => {
    if (items.length) chipLists.push({ key, title, items });
  };
  addChips("natures", "Naturezas de chakra", naturesOf(c));
  addChips("jutsu", "Jutsu", c.jutsu ?? []);
  addChips("tools", "Ferramentas", c.tools ?? []);
  addChips("titles", "Títulos", cleanList(p.titles));
  addChips("traits", "Traços únicos", cleanList(c.uniqueTraits));

  const related =
    village !== null
      ? dex
          .membersOf(village)
          .filter((m) => m.id !== c.id)
          .slice(0, 12)
          .map((m) => characterCard(dex, m))
      : [];

  const badges: BadgeItem[] = [];
  if (village) badges.push({ key: "village", text: village.name, variant: "info" });
  if (isCharacter) {
    dex.otherVillages(c).forEach((v, i) => {
      badges.push({ key: `other${i}`, text: v.name, variant: "soft" });
    });
  }
  if (clan) badges.push({ key: "clan", text: `Clã ${clan.name}`, variant: "softMuted" });

  const rank = rankOf(c);
  if (rank) badges.push({ key: "rank", text: rank, variant: "brand" });

  const status = statusOf(c);
  if (status) {
    badges.push({
      key: "status",
      text: statusLabel(status),
      variant: status === "Deceased" ? "bad" : "ok",
    });
  }
  if (p.jinchūriki || p.tailedBeast) {
    badges.push({ key: "jinchuriki", text: "Jinchūriki", variant: "warn" });
  }

  // Linha de contexto: ocupacao e classificacao limpas, ate 3 itens.
  const taglineParts = [
    ...cleanList(p.occupation).slice(0, 2),
    ...cleanList(p.classification).slice(0, 2),
  ];
  if (!taglineParts.length) taglineParts.push(...cleanList(p.titles).slice(0, 1));
  if (!taglineParts.length && village) taglineParts.push(`Ninja de ${village.name}`);

  return {
    id: c.id,
    name: c.name,
    initials: initials(c.name),
    images: (c.images ?? []).slice(0, 6),
    tagline: taglineParts.slice(0, 3).join(" · ") || "Registro da enciclopédia NaruWiki.",
    badges,
    stats: buildStats(c),
    linkLists,
    chipLists,
    related,
    relatedTitle: village ? `Também de ${village.name}` : "",
    favorable: isCharacter,
  };
}


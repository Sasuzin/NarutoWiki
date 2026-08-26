/**
 * Tipos da API Dattebayo.
 *
 * Quase todo campo de `personal` chega como string, array OU objeto por arco
 * ("Part I", "Part II", "Blank Period"...). O tipo `Poly` existe para nao
 * mentir sobre isso: quem le um campo desses passa por `fmt` ou `lastVal`
 * (src/data/normalize.ts) em vez de tratar como texto.
 */
export type Poly = string | number | boolean | null | undefined | Poly[] | { [key: string]: Poly };

export interface Debut {
  manga?: string;
  anime?: string;
  novel?: string;
  movie?: string;
  game?: string;
  ova?: string;
  appearsIn?: string;
  [key: string]: Poly;
}

export interface Personal {
  birthdate?: Poly;
  sex?: Poly;
  age?: Poly;
  height?: Poly;
  weight?: Poly;
  bloodType?: Poly;
  kekkeiGenkai?: Poly;
  /* eslint-disable-next-line */
  kekkeiMōra?: Poly;
  kekkeiTōta?: Poly;
  classification?: Poly;
  tailedBeast?: Poly;
  jinchūriki?: Poly;
  occupation?: Poly;
  affiliation?: Poly;
  team?: Poly;
  clan?: Poly;
  titles?: Poly;
  status?: Poly;
  partner?: Poly;
  species?: Poly;
  [key: string]: Poly;
}

export interface Rank {
  ninjaRank?: Poly;
  ninjaRegistration?: Poly;
  [key: string]: Poly;
}

/** Personagem, besta com cauda, membro da Akatsuki e da Kara usam esta mesma forma. */
export interface Character {
  id: number;
  name: string;
  images?: string[];
  debut?: Debut;
  family?: Record<string, Poly>;
  jutsu?: string[];
  natureType?: string[];
  personal?: Personal;
  rank?: Rank;
  tools?: string[];
  voiceActors?: Record<string, Poly>;
  uniqueTraits?: string[];
}

/** Vila, cla, time e kekkei genkai: so nome e a lista de ids de personagem. */
export interface Group {
  id: number;
  name: string;
  characters?: number[];
}

/** Envelope de toda resposta da API: `{ <chave>: [], currentPage, pageSize, total }`. */
export type ApiPage<K extends string, T> = {
  [P in K]: T[];
} & {
  currentPage?: number;
  pageSize?: number;
  total?: number;
};

/** As oito coleccoes, carregadas uma unica vez no boot. */
export interface Dataset {
  characters: Character[];
  villages: Group[];
  clans: Group[];
  teams: Group[];
  kekkei: Group[];
  /** Bestas com cauda: id de 1 a 10, em espaco proprio, NAO no de personagens. */
  tailed: Character[];
  akatsuki: Character[];
  kara: Character[];
}

import type { Character, Dataset, Group } from "../api/types";
import { naturesOf, norm, rankOf, statusOf } from "./normalize";

/**
 * Indice em memoria de tudo que a API devolveu. Construido uma unica vez,
 * depois da carga; e a fonte de todo lookup da interface.
 *
 * Aqui vivem as armadilhas dos dados, resolvidas em um lugar so:
 *
 * 1. Vila nao vem no personagem — e derivada de `/villages[].characters`, e
 *    47 personagens aparecem em mais de uma vila. Ver `villageOf`.
 * 2. Besta com cauda tem id proprio (1..10) que COLIDE com id de personagem:
 *    fica em um mapa separado (`tailedById`), nunca no principal.
 * 3. Akatsuki e Kara usam id de personagem: entram no mapa principal por
 *    merge, e so quando o personagem faltava no elenco.
 * 4. Id em coleccao pode nao existir no elenco: quem lista membros filtra por
 *    `has(id)`.
 */
export class Dex {
  readonly characters: Character[];
  readonly villages: Group[];
  readonly clans: Group[];
  readonly teams: Group[];
  readonly kekkei: Group[];
  readonly tailed: Character[];
  readonly akatsuki: Character[];
  readonly kara: Character[];

  /** Opcoes de filtro, ja deduplicadas e ordenadas. */
  readonly natures: string[];
  readonly ranks: string[];
  readonly statuses: string[];

  /** Elenco reconhecivel para o quiz: tem imagem, tem vila e mais de 4 jutsu. */
  readonly quizPool: Character[];

  private readonly byId = new Map<number, Character>();
  private readonly tailedById = new Map<number, Character>();
  private readonly idByName = new Map<string, number>();
  private readonly villagesByChar = new Map<number, Group[]>();
  private readonly clanByChar = new Map<number, Group>();
  private readonly teamsByChar = new Map<number, Group[]>();
  private readonly kekkeiByChar = new Map<number, Group[]>();

  constructor(data: Dataset) {
    this.characters = data.characters;
    this.villages = data.villages;
    this.clans = data.clans;
    this.teams = data.teams;
    this.kekkei = data.kekkei;
    this.tailed = data.tailed;
    this.akatsuki = data.akatsuki;
    this.kara = data.kara;

    for (const c of data.characters) this.byId.set(c.id, c);
    // Akatsuki e Kara compartilham o espaco de ids de personagem: so completam
    // o mapa quando o registro nao veio em /characters.
    for (const c of [...data.akatsuki, ...data.kara]) {
      if (!this.byId.has(c.id)) this.byId.set(c.id, c);
    }
    // Besta com cauda fica de fora do mapa principal: id 1..10 colide.
    for (const t of data.tailed) this.tailedById.set(t.id, t);

    for (const c of this.byId.values()) this.idByName.set(norm(c.name), c.id);

    for (const v of data.villages) {
      for (const id of v.characters ?? []) {
        const list = this.villagesByChar.get(id);
        if (list) list.push(v);
        else this.villagesByChar.set(id, [v]);
      }
    }
    for (const c of data.clans) {
      for (const id of c.characters ?? []) this.clanByChar.set(id, c);
    }
    for (const t of data.teams) {
      for (const id of t.characters ?? []) {
        const list = this.teamsByChar.get(id);
        if (list) list.push(t);
        else this.teamsByChar.set(id, [t]);
      }
    }
    for (const k of data.kekkei) {
      for (const id of k.characters ?? []) {
        const list = this.kekkeiByChar.get(id);
        if (list) list.push(k);
        else this.kekkeiByChar.set(id, [k]);
      }
    }

    this.natures = [...new Set(data.characters.flatMap(naturesOf))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
    this.ranks = [...new Set(data.characters.map(rankOf).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
    this.statuses = [...new Set(data.characters.map(statusOf).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );

    this.quizPool = data.characters.filter(
      (c) => (c.images?.length ?? 0) > 0 && this.villageOf(c) !== null && (c.jutsu?.length ?? 0) > 4,
    );
  }

  get(id: number): Character | undefined {
    return this.byId.get(id);
  }

  has(id: number): boolean {
    return this.byId.has(id);
  }

  /** Besta com cauda por id — espaco de ids proprio, nao use `get`. */
  tailedBeast(id: number): Character | undefined {
    return this.tailedById.get(id);
  }

  /** Id do personagem por nome normalizado; usado para linkar familia. */
  findByName(name: string): Character | undefined {
    const id = this.idByName.get(norm(name));
    return id === undefined ? undefined : this.byId.get(id);
  }

  villagesOf(c: Character): Group[] {
    return this.villagesByChar.get(c.id) ?? [];
  }

  /**
   * Vila principal. 47 personagens aparecem em mais de uma: a ordem de decisao
   * e (a) a primeira citada em `personal.affiliation`, (b) a que termina em
   * "gakure", (c) a primeira da lista. Sem isso Naruto vira "Mount Myoboku".
   */
  villageOf(c: Character): Group | null {
    const list = this.villagesByChar.get(c.id);
    if (!list || list.length === 0) return null;
    if (list.length === 1) return list[0];

    const affiliation = ([] as unknown[])
      .concat((c.personal?.affiliation ?? []) as unknown[])
      .map((x) => String(x));
    for (const aff of affiliation) {
      const hit = list.find((v) => aff.includes(v.name));
      if (hit) return hit;
    }
    return list.find((v) => /gakure$/i.test(v.name)) ?? list[0];
  }

  /** As outras vilas do personagem, que viram badge secundaria. */
  otherVillages(c: Character): Group[] {
    const list = this.villagesByChar.get(c.id) ?? [];
    const main = this.villageOf(c);
    return list.filter((v) => !main || v.id !== main.id);
  }

  clanOf(c: Character): Group | null {
    return this.clanByChar.get(c.id) ?? null;
  }

  teamsOf(c: Character): Group[] {
    return this.teamsByChar.get(c.id) ?? [];
  }

  kekkeiOf(c: Character): Group[] {
    return this.kekkeiByChar.get(c.id) ?? [];
  }

  /** Membros de uma coleccao que existem de fato no elenco. */
  membersOf(g: Group): Character[] {
    const out: Character[] = [];
    for (const id of g.characters ?? []) {
      const c = this.byId.get(id);
      if (c) out.push(c);
    }
    return out;
  }

  groupById(list: Group[], id: string | null): Group | undefined {
    if (id === null) return undefined;
    return list.find((g) => String(g.id) === id);
  }
}

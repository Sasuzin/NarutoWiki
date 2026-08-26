import { useMemo } from "react";
import { CharacterGrid } from "../components/CharacterCard";
import { EmptyState, ResultsBar, ShowMore } from "../components/ListChrome";
import { PageHeader } from "../components/PageHeader";
import { beastCard, characterCard, type CardModel } from "../data/cards";
import type { Dex } from "../data/dex";
import { usePaged } from "../hooks/usePaged";
import { useDex } from "../store/AppProvider";

export type RosterKind = "bestas" | "akatsuki" | "kara";

const ROSTERS: Record<
  RosterKind,
  { title: string; subtitle: string; cards: (dex: Dex) => CardModel[] }
> = {
  bestas: {
    title: "Bestas com cauda",
    subtitle: "Os bijū e suas aparições.",
    // Id proprio, fora do espaco de personagens: sem estrela de favorito.
    cards: (dex) => dex.tailed.map(beastCard),
  },
  akatsuki: {
    title: "Akatsuki",
    subtitle: "Membros da organização.",
    cards: (dex) => dex.akatsuki.map((c) => characterCard(dex, c)),
  },
  kara: {
    title: "Kara",
    subtitle: "Membros e Inners da organização.",
    cards: (dex) => dex.kara.map((c) => characterCard(dex, c)),
  },
};

/** Coleccoes que vao direto para a grade de personagens, sem barra de filtros. */
export function Roster({ kind }: { kind: RosterKind }) {
  const dex = useDex();
  const config = ROSTERS[kind];

  const cards = useMemo(() => config.cards(dex), [dex, config]);
  const paged = usePaged(cards, kind);

  return (
    <div>
      <PageHeader title={config.title} subtitle={config.subtitle} />
      <ResultsBar total={cards.length} />
      {cards.length === 0 ? (
        <EmptyState
          title="Nenhum registro aqui"
          hint="A API não devolveu itens para esta organização."
        />
      ) : (
        <>
          <CharacterGrid items={paged.visible} />
          {paged.hasMore && <ShowMore count={paged.nextCount} onClick={paged.showMore} />}
        </>
      )}
    </div>
  );
}

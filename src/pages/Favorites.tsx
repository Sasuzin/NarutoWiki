import { useMemo } from "react";
import { CharacterGrid } from "../components/CharacterCard";
import { EmptyState, ResultsBar, ShowMore } from "../components/ListChrome";
import { PageHeader } from "../components/PageHeader";
import { characterCard } from "../data/cards";
import { usePaged } from "../hooks/usePaged";
import { useApp, useDex } from "../store/AppProvider";

export function Favorites() {
  const dex = useDex();
  const { favorites } = useApp();

  // Um id salvo pode ter saido da API: filtra o que nao existe mais.
  const cards = useMemo(
    () =>
      favorites
        .map((id) => dex.get(id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((c) => characterCard(dex, c)),
    [dex, favorites],
  );
  const paged = usePaged(cards, "favoritos");

  return (
    <div>
      <PageHeader title="Favoritos" subtitle="Salvos neste navegador." />
      <ResultsBar total={cards.length} />
      {cards.length === 0 ? (
        <EmptyState
          title="Nenhum favorito ainda"
          hint="Use a estrela no canto dos cards para salvar um ninja aqui."
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

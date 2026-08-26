import { useMemo } from "react";
import { CharacterGrid } from "../components/CharacterCard";
import { FilterBar } from "../components/FilterBar";
import { EmptyState, ResultsBar, ShowMore, SortSelect } from "../components/ListChrome";
import { PageHeader } from "../components/PageHeader";
import { characterCard } from "../data/cards";
import { filterAndSortCharacters } from "../data/filters";
import { usePaged } from "../hooks/usePaged";
import { useApp, useDex } from "../store/AppProvider";

export function Characters() {
  const dex = useDex();
  const { query, filters, sort, setSort } = useApp();

  const cards = useMemo(
    () => filterAndSortCharacters(dex, query, filters, sort).map((c) => characterCard(dex, c)),
    [dex, query, filters, sort],
  );

  // Mexer em filtro ou busca devolve a paginacao ao inicio; trocar a ordenacao nao.
  const paged = usePaged(cards, JSON.stringify([query, filters]));

  return (
    <div>
      <PageHeader
        title="Personagens"
        subtitle="Todo o elenco indexado pela API, com filtros combinados."
      />
      <FilterBar />
      <ResultsBar total={cards.length}>
        <SortSelect value={sort} onChange={setSort} />
      </ResultsBar>

      {cards.length === 0 ? (
        <EmptyState
          title="Nenhum personagem com esses filtros"
          hint="Tente limpar um dos filtros ou a busca."
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

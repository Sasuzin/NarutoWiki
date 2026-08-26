import { useMemo } from "react";
import { CharacterGrid } from "../components/CharacterCard";
import { GroupGrid } from "../components/GroupGrid";
import { EmptyState, ResultsBar, ShowMore } from "../components/ListChrome";
import { PageHeader } from "../components/PageHeader";
import { characterCard, groupCard } from "../data/cards";
import { COLLECTIONS, type CollectionKind } from "../data/collections";
import { initials, symbolUrl } from "../data/normalize";
import { usePaged } from "../hooks/usePaged";
import { useDex } from "../store/AppProvider";

export function Collection({ kind, id }: { kind: CollectionKind; id: string | null }) {
  return id === null ? <CollectionList kind={kind} /> : <CollectionDetail kind={kind} id={id} />;
}

function CollectionList({ kind }: { kind: CollectionKind }) {
  const dex = useDex();
  const config = COLLECTIONS[kind];

  const cards = useMemo(
    () => config.select(dex).map((g) => groupCard(g, config.itemHref, config.withSymbol)),
    [dex, config],
  );
  const paged = usePaged(cards, kind);

  return (
    <div>
      <PageHeader title={config.title} subtitle={config.subtitle} />
      <ResultsBar total={cards.length} />
      <GroupGrid items={paged.visible} />
      {paged.hasMore && <ShowMore count={paged.nextCount} onClick={paged.showMore} />}
    </div>
  );
}

function CollectionDetail({ kind, id }: { kind: CollectionKind; id: string }) {
  const dex = useDex();
  const config = COLLECTIONS[kind];
  const back = { href: config.listHref, label: config.title };

  const group = dex.groupById(config.select(dex), id);

  // Ids que a coleccao lista podem nao existir no elenco: membersOf filtra.
  const cards = useMemo(
    () => (group ? dex.membersOf(group).map((c) => characterCard(dex, c)) : []),
    [dex, group],
  );
  const paged = usePaged(cards, `${kind}/${id}`);

  if (!group) {
    return (
      <div>
        <PageHeader title={config.title} back={back} />
        <EmptyState
          title="Registro não encontrado"
          hint="Esse id não existe nesta coleção da API."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={group.name}
        subtitle={
          cards.length === 1
            ? "1 personagem ligado a este registro"
            : `${cards.length} personagens ligados a este registro`
        }
        back={back}
        {...(config.withSymbol
          ? { symbol: symbolUrl(group.name), initials: initials(group.name) }
          : {})}
      />
      <ResultsBar total={cards.length} />
      {cards.length === 0 ? (
        <EmptyState
          title="Sem personagens listados"
          hint="A API não associa personagens a este registro."
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

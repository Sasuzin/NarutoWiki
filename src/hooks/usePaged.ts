import { useEffect, useMemo, useState } from "react";

const INITIAL = 60;
const STEP = 40;

/**
 * Paginacao por "Mostrar mais". Volta ao inicio quando `resetKey` muda — e o
 * que devolve a lista ao topo depois de mexer em filtro ou busca. Troca de rota
 * nao precisa de reset aqui: o Router remonta a tela por `key`.
 */
export function usePaged<T>(items: T[], resetKey: string) {
  const [limit, setLimit] = useState(INITIAL);

  useEffect(() => {
    setLimit(INITIAL);
  }, [resetKey]);

  return useMemo(
    () => ({
      visible: items.slice(0, limit),
      hasMore: items.length > limit,
      nextCount: Math.min(STEP, Math.max(0, items.length - limit)),
      showMore: () => setLimit((n) => n + STEP),
    }),
    [items, limit],
  );
}

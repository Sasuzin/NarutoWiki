import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Dex } from "../data/dex";
import { EMPTY_FILTERS, type Filters, type SortKey } from "../data/filters";
import { href, type Route } from "../data/routes";
import { useDataset, type ApiStatus } from "../hooks/useDataset";
import { useFavorites } from "../hooks/useFavorites";
import { useHashRoute } from "../hooks/useHashRoute";
import { useTheme, type Theme } from "../hooks/useTheme";

export type CompareSlots = [number | null, number | null];

interface AppValue {
  dex: Dex | null;
  status: ApiStatus;
  error: string;
  loading: boolean;
  slow: boolean;
  reload: () => void;

  route: Route;

  theme: Theme;
  toggleTheme: () => void;

  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;

  navOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;

  /** Busca global da topbar: alimenta o dropdown e filtra a grade de personagens. */
  query: string;
  setQuery: (value: string) => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  /** Fecha o dropdown e limpa o campo — usado ao escolher um resultado. */
  clearSearch: () => void;

  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  clearFilters: () => void;

  sort: SortKey;
  setSort: (value: SortKey) => void;

  compare: CompareSlots;
  setCompareSlot: (slot: 0 | 1, id: number | null) => void;
  addToCompare: (id: number) => void;
}

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { dex, status, error, loading, slow, reload } = useDataset();
  const route = useHashRoute();
  const { theme, toggleTheme } = useTheme();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("name");
  const [compare, setCompare] = useState<CompareSlots>([null, null]);

  // Trocar de rota fecha o menu e o dropdown de busca.
  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
  }, [route.name, route.id]);

  const setFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setQuery("");
  }, []);

  const setCompareSlot = useCallback((slot: 0 | 1, id: number | null) => {
    setCompare((prev) => {
      const next: CompareSlots = [prev[0], prev[1]];
      next[slot] = id;
      return next;
    });
  }, []);

  /** Preenche o primeiro slot livre e vai para o comparador. */
  const addToCompare = useCallback((id: number) => {
    setCompare((prev) => {
      if (prev[0] === id || prev[1] === id) return prev;
      return prev[0] === null ? [id, prev[1]] : [prev[0], id];
    });
    location.hash = href.compare;
  }, []);

  const value = useMemo<AppValue>(
    () => ({
      dex,
      status,
      error,
      loading,
      slow,
      reload,
      route,
      theme,
      toggleTheme,
      favorites,
      isFavorite,
      toggleFavorite,
      navOpen,
      toggleNav: () => setNavOpen((v) => !v),
      closeNav: () => setNavOpen(false),
      query,
      setQuery,
      searchOpen,
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      clearSearch: () => {
        setSearchOpen(false);
        setQuery("");
      },
      filters,
      setFilter,
      clearFilters,
      sort,
      setSort,
      compare,
      setCompareSlot,
      addToCompare,
    }),
    [
      dex,
      status,
      error,
      loading,
      slow,
      reload,
      route,
      theme,
      toggleTheme,
      favorites,
      isFavorite,
      toggleFavorite,
      navOpen,
      query,
      searchOpen,
      filters,
      setFilter,
      clearFilters,
      sort,
      compare,
      setCompareSlot,
      addToCompare,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return value;
}

/** Atalho para as telas que so rodam com os dados carregados. */
export function useDex(): Dex {
  const { dex } = useApp();
  if (!dex) throw new Error("useDex chamado antes da carga dos dados");
  return dex;
}

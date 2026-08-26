import { useEffect, useMemo, useRef } from "react";
import { initials, norm } from "../data/normalize";
import { href } from "../data/routes";
import { useApp } from "../store/AppProvider";
import { BrandTile } from "./Brand";
import styles from "./Topbar.module.css";

interface SearchHit {
  key: string;
  label: string;
  kind: string;
  href: string;
  initials: string;
}

const STATUS_LABEL = {
  loading: "Conectando",
  error: "Offline",
  ready: "API conectada",
} as const;

export function Topbar() {
  const {
    dex,
    status,
    theme,
    toggleTheme,
    toggleNav,
    query,
    setQuery,
    searchOpen,
    openSearch,
    closeSearch,
    clearSearch,
  } = useApp();

  const searchRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora ou apertar Escape.
  useEffect(() => {
    if (!searchOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) closeSearch();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, closeSearch]);

  /** Ate 6 personagens e 3 de cada coleccao, a partir de 2 caracteres. */
  const hits = useMemo<SearchHit[] | null>(() => {
    const q = norm(query);
    if (!dex || q.length < 2) return null;

    const out: SearchHit[] = [];
    for (const c of dex.characters.filter((c) => norm(c.name).includes(q)).slice(0, 6)) {
      out.push({
        key: `c${c.id}`,
        label: c.name,
        kind: "Personagem",
        href: href.character(c.id),
        initials: initials(c.name),
      });
    }

    const collections = [
      { prefix: "v", kind: "Vila", list: dex.villages, link: href.village },
      { prefix: "cl", kind: "Clã", list: dex.clans, link: href.clan },
      { prefix: "t", kind: "Time", list: dex.teams, link: href.team },
    ];
    for (const col of collections) {
      for (const item of col.list.filter((x) => norm(x.name).includes(q)).slice(0, 3)) {
        out.push({
          key: `${col.prefix}${item.id}`,
          label: item.name,
          kind: col.kind,
          href: col.link(item.id),
          initials: initials(item.name),
        });
      }
    }
    return out;
  }, [dex, query]);

  const showDropdown = searchOpen && hits !== null;
  const themeLabel = theme === "dark" ? "Tema claro" : "Tema escuro";

  return (
    <header className={styles.bar}>
      <button type="button" onClick={toggleNav} title="Abrir menu" className={styles.iconButton}>
        <span aria-hidden>≡</span>
        <span className="srOnly">Abrir menu</span>
      </button>

      <a href={href.home} className={styles.brand}>
        <BrandTile size="sm" />
        <span className={styles.brandName}>NaruWiki</span>
      </a>

      <div className={styles.search} ref={searchRef}>
        <input
          className={styles.input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            openSearch();
          }}
          onFocus={openSearch}
          placeholder="Buscar personagem, vila, clã, time…"
          aria-label="Buscar personagem, vila, clã ou time"
          autoComplete="off"
        />
        <span className={styles.searchIcon} aria-hidden>
          ⌕
        </span>
        {showDropdown && (
          <div className={styles.dropdown}>
            {hits.map((hit) => (
              <a key={hit.key} href={hit.href} onClick={clearSearch} className={styles.result}>
                <span className={styles.resultTile}>{hit.initials}</span>
                <span className={styles.resultLabel}>{hit.label}</span>
                <span className={styles.resultKind}>{hit.kind}</span>
              </a>
            ))}
            {hits.length === 0 && (
              <div className={styles.noResults}>Nenhum resultado para essa busca.</div>
            )}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <span className={styles.status}>
          <span className={styles.dot} data-status={status} />
          {STATUS_LABEL[status]}
        </span>
        <button
          type="button"
          onClick={toggleTheme}
          title={themeLabel}
          className={`${styles.iconButton} ${styles.themeButton}`}
        >
          <span aria-hidden>{theme === "dark" ? "☀" : "☾"}</span>
          <span className="srOnly">{themeLabel}</span>
        </button>
      </div>
    </header>
  );
}

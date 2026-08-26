import { useEffect } from "react";
import { buildNav } from "../data/nav";
import { href } from "../data/routes";
import { formatNumber } from "../data/normalize";
import { useApp } from "../store/AppProvider";
import { BrandTile } from "./Brand";
import styles from "./Drawer.module.css";

export function Drawer() {
  const { dex, favorites, route, navOpen, closeNav } = useApp();
  const items = buildNav(dex, favorites.length);

  // Escape fecha, como em qualquer overlay.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNav();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen, closeNav]);

  return (
    <>
      <aside
        className={styles.drawer}
        data-open={navOpen}
        aria-label="Menu principal"
        inert={!navOpen}
      >
        <div className={styles.header}>
          <a href={href.home} onClick={closeNav} className={styles.brand}>
            <BrandTile size="md" />
            <span className={styles.brandText}>
              <span className={styles.brandName}>NaruWiki</span>
              <span className={styles.brandSub}>Enciclopédia ninja</span>
            </span>
          </a>
          <button type="button" onClick={closeNav} title="Fechar menu" className={styles.close}>
            ✕<span className="srOnly">Fechar menu</span>
          </button>
        </div>

        <nav className={styles.nav}>
          {items.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={closeNav}
              className={styles.item}
              aria-current={route.name === item.key ? "page" : undefined}
            >
              <span>{item.label}</span>
              {item.count !== null && (
                <span className={styles.count}>{formatNumber(item.count)}</span>
              )}
            </a>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.credit}>
            Dados da API Dattebayo · imagens e símbolos do Naruto Wiki
          </div>
        </div>
      </aside>

      {navOpen && (
        <button
          type="button"
          className={styles.scrim}
          onClick={closeNav}
          aria-label="Fechar menu"
        />
      )}
    </>
  );
}

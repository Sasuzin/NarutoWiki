import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEY = "naruwiki:theme";

function readStored(): Theme | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Trocar tema = trocar `data-theme` no <html>; todo o resto e var(--*).
 * O valor inicial ja foi aplicado pelo script inline do index.html — aqui so
 * mantemos o estado em sincronia e persistimos a escolha.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStored() ?? systemTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Sem escolha salva, acompanha o sistema em tempo real.
  useEffect(() => {
    if (readStored()) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* modo privado: o tema vale so pra sessao */
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}

import { useEffect, useState } from "react";
import { parseHash, type Route } from "../data/routes";

/**
 * Rota vinda do hash. Cada troca sobe o scroll — quem precisa resetar estado
 * (paginacao, chips expandidos, galeria) faz isso remontando por `key`.
 */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route;
}

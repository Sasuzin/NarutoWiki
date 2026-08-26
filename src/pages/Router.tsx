import { useApp } from "../store/AppProvider";
import { CharacterDetail } from "./CharacterDetail";
import { Characters } from "./Characters";
import { Collection } from "./Collection";
import { Compare } from "./Compare";
import { Favorites } from "./Favorites";
import { Home } from "./Home";
import { Quiz } from "./Quiz";
import { Roster } from "./Roster";

/**
 * Despacho das 13 rotas. A `key` derivada da rota remonta a tela a cada
 * navegacao — e o que reseta paginacao, chips expandidos e miniatura escolhida
 * sem nenhum efeito manual.
 */
export function Router() {
  const { route } = useApp();
  const key = `${route.name}/${route.id ?? ""}`;

  switch (route.name) {
    case "personagens":
      return route.id === null ? (
        <Characters key={key} />
      ) : (
        <CharacterDetail key={key} rawId={route.id} space="character" />
      );

    case "vilas":
    case "clas":
    case "times":
    case "kekkei":
      return <Collection key={key} kind={route.name} id={route.id} />;

    case "bestas":
      return route.id === null ? (
        <Roster key={key} kind="bestas" />
      ) : (
        <CharacterDetail key={key} rawId={route.id} space="beast" />
      );

    case "akatsuki":
    case "kara":
      return <Roster key={key} kind={route.name} />;

    case "favoritos":
      return <Favorites key={key} />;

    case "comparar":
      return <Compare key={key} />;

    case "quiz":
      return <Quiz key={key} />;

    case "home":
      return <Home key={key} />;
  }
}

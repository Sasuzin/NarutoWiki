# NaruWiki

Enciclopédia ninja sobre a [API Dattebayo](https://dattebayo-api.onrender.com): dashboard,
catálogo de personagens com busca, filtros e ordenação, ficha por personagem, coleções
(vilas, clãs, times, kekkei genkai, bestas com cauda, Akatsuki, Kara), favoritos, comparador
de dois personagens e um quiz "quem é esse ninja?".

Tema claro (paleta Naruto, laranja/amarelo) e escuro (paleta Sasuke, índigo/violeta),
alternável na topbar e persistido.

## Rodando

```bash
npm install
```

```bash
npm run dev
```

Outros scripts: `npm run build` (typecheck + build de produção em `dist/`),
`npm run preview`, `npm run typecheck`.

> A API roda no plano gratuito do Render e **hiberna**: a primeira requisição pode levar
> 10–40s. A tela de carregamento troca a mensagem depois de 4,5s para avisar isso, e o erro
> tem botão de repetir.

## Stack

| Peça | Escolha | Por quê |
| --- | --- | --- |
| Build | Vite + React 19 + TypeScript estrito | O app é uma SPA de verdade: uma carga de dados no boot e tudo em memória. Não há nada para renderizar no servidor. |
| Rotas | hash (`#/personagens/1344`) | Funciona em hospedagem estática sem nenhum rewrite; `base: "./"` no Vite deixa o build servir de subpasta. |
| Estilo | CSS puro — tokens globais + CSS Modules | A paleta do handoff é definida como variável CSS e nenhum componente escreve cor literal; trocar tema é só trocar `data-theme` no `<html>`. |
| Estado | Context + hooks | Nada de biblioteca: o estado é pequeno (dataset, rota, tema, favoritos, filtros, comparador, quiz). |

Sem dependência de runtime além de `react` e `react-dom`. Nenhuma biblioteca de ícone: os
únicos glifos são `≡ ✕ ⌕ ★ ☆ ☾ ☀ ← ·` em texto.

## Arquitetura

```
src/
├── api/           types.ts (formas da API) · client.ts (as 8 chamadas)
├── data/          normalize.ts · dex.ts (índices) · filters.ts · detail.ts
│                  compare.ts · quiz.ts · cards.ts · collections.ts · routes.ts · nav.ts
├── hooks/         useDataset · useHashRoute · useTheme · useFavorites · usePaged
├── store/         AppProvider.tsx (o estado da sessão)
├── components/    Topbar · Drawer · Brand · ImageLayer · CharacterCard · GroupGrid
│                  FilterBar · ListChrome · PageHeader · LoadingState · ErrorState
├── pages/         Router · Home · Characters · CharacterDetail · Collection
│                  Roster · Favorites · Compare · Quiz
└── styles/        tokens.css (as duas paletas) · global.css
```

A regra que organiza tudo: **`src/data/` é lógica pura sobre os dados** (sem React) e
**`src/pages/` só renderiza**. Filtro, ordenação, ficha, comparador e quiz são funções
testáveis que recebem o índice e devolvem dados prontos.

### Uma única carga

As oito chamadas saem em paralelo uma vez no mount:

| Endpoint | Chave | Total hoje |
| --- | --- | --- |
| `/characters?page=1&limit=1500` | `characters` | 1431 |
| `/villages?limit=100` | `villages` | 39 |
| `/clans?limit=100` | `clans` | 58 |
| `/teams?limit=300` | `teams` | 191 |
| `/kekkei-genkai?limit=100` | `kekkei-genkai` | 39 |
| `/tailed-beasts?limit=50` | `tailed-beasts` | 10 |
| `/akatsuki?limit=100` | `akatsuki` | 44 |
| `/kara?limit=100` | `kara` | 32 |

Depois disso, `Dex` (`src/data/dex.ts`) monta os índices em memória e **busca, filtro e
ordenação nunca fazem requisição nova**.

### As armadilhas dos dados

Tudo o que é traiçoeiro nesta API está resolvido em um lugar só, com comentário no código:

| Armadilha | Onde |
| --- | --- |
| Campos que são string, array **ou** objeto por arco (`age: {"Part I": "12"}`) | `fmt()` achata, `lastVal()` pega o mais recente — `data/normalize.ts` |
| Vila não vem no personagem, e 47 aparecem em mais de uma | `Dex.villageOf()` desempata por `affiliation` → sufixo `gakure` → primeira. Sem isso Naruto vira "Mount Myōboku" |
| Ruído de wiki em `titles`/`uniqueTraits` (`"childOfTheProphecy(予言の子…)"`) | `cleanText()`/`cleanList()` — parênteses, faixas CJK, camelCase, sobras curtas |
| `natureType` com sufixo (`"Wind Release  (Affinity)"`) | `naturesOf()` |
| Besta com cauda tem id 1–10, que **colide** com id de personagem | mapa separado (`Dex.tailedBeast`), rota separada, e a ficha de besta não consulta vila/clã/time/kekkei |
| Akatsuki e Kara usam id de personagem | merge no mapa principal só quando o registro faltava |
| Id em coleção pode não existir no elenco | `Dex.membersOf()` filtra |
| Nomes repetidos entre registros ("Hyūga", "Uzumaki", "Senju") | opções de filtro deduplicadas por nome |

### Imagens

Toda imagem é desenhada como `background-image` num `<span>`, com um monograma de iniciais
atrás (`components/ImageLayer.tsx`). Se a URL falhar, nada pinta e o monograma aparece
sozinho — **sem `onerror` e sem ícone quebrado**. Isso importa: 86 dos 1431 personagens não
têm imagem, e hoje 16 das 39 vilas não têm arquivo de símbolo no Naruto Wiki.

## Rotas

`#/` · `#/personagens` · `#/personagens/:id` · `#/vilas[/:id]` · `#/clas[/:id]` ·
`#/times[/:id]` · `#/kekkei[/:id]` · `#/bestas[/:id]` · `#/akatsuki` · `#/kara` ·
`#/favoritos` · `#/comparar` · `#/quiz`

O `Router` remonta a tela por `key` a cada navegação — é o que reseta paginação, chips
expandidos e miniatura escolhida sem nenhum efeito manual. Placar do quiz e slots do
comparador ficam no provider, justamente para sobreviverem à navegação.

## Estado

| Estado | Onde vive |
| --- | --- |
| dataset e índices | memória, carregados uma vez |
| `loading` / `error` / `slow` | memória (`slow` liga em 4,5s) |
| rota | hash da URL |
| busca global, 5 filtros, ordenação | memória (provider) |
| paginação | tela (volta a 60 ao mexer em filtro ou busca; +40 por clique) |
| favoritos | `localStorage["naruwiki:favs"]` — array de ids |
| tema | `localStorage["naruwiki:theme"]` — `"light"` / `"dark"`; sem valor salvo, segue o sistema |
| comparador e quiz | memória (o placar não persiste entre recarregamentos) |

## Especificação de origem

O handoff de design que originou este projeto está guardado em
[`docs/handoff-naruwiki.md`](docs/handoff-naruwiki.md) — endpoints, formato dos dados,
armadilhas da API, tokens de cor, tipografia e o layout de cada tela. É documento de
referência: fica como veio, não acompanha o código.

## Onde esta implementação difere do protótipo de design

Decisões conscientes, todas reversíveis:

- **Ficha de besta com cauda** não mostra vila, clã, time, kekkei, "Também de <vila>", nem os
  botões de favoritar e comparar. O protótipo mostrava, mas o id 1–10 colide com id de
  personagem: aqueles vínculos seriam de outro registro.
- **Rótulos de estreia e o campo Status do comparador** estão em português (`Mangá`, `Filme`,
  `Vivo`/`Falecido`). O protótipo deixava a chave crua da API nesses dois pontos, embora
  traduzisse todo o resto.
- **Opções duplicadas de filtro** foram removidas (a API tem dois "Hyūga", dois "Uzumaki").
  Como o filtro casa por nome, a segunda opção não filtrava nada de novo.
- **Dropdown de busca** fecha ao clicar fora e no `Esc`; o **drawer** fecha no `Esc` e fica
  `inert` quando escondido.
- **Tema aplicado antes da primeira pintura** por um script inline no `index.html`, para não
  piscar claro em quem usa o escuro.
- Números de Akatsuki (44) e Kara (32) diferem da especificação (32 e 14): a API mudou. Nada
  está fixo no código, as contagens vêm da resposta.

## Créditos

Dados da API Dattebayo · imagens e símbolos do [Naruto Wiki](https://naruto.fandom.com).
Projeto de estudo, sem vínculo com os detentores dos direitos de Naruto.

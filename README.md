# NaruWiki

**No ar: <https://sasuzin.github.io/NarutoWiki/>**

Enciclopédia ninja sobre a [API Dattebayo](https://dattebayo-api.onrender.com): dashboard,
catálogo de personagens com busca, filtros e ordenação, ficha por personagem, coleções
(vilas, clãs, times, kekkei genkai, bestas com cauda, Akatsuki, Kara), favoritos, comparador
de dois personagens e um quiz "quem é esse ninja?".

Tema claro (paleta Naruto, laranja/amarelo) e escuro (paleta Sasuke, índigo/violeta),
alternável na topbar e persistido.

## Requisitos

**Node.js `^20.19` ou `>=22.12`** (exigência do Vite 8) e npm 10+. Não precisa de banco,
backend, variável de ambiente nem chave de API — a base fica em `src/api/client.ts` e a API
Dattebayo é pública, com CORS liberado.

Verificado em Node 24.14 / npm 11.11, Windows 11.

## Rodando

```bash
npm install
```

```bash
npm run dev
```

Abre em `http://localhost:5173`.

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | `tsc --noEmit` e, se passar, build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` para conferir o build |
| `npm run typecheck` | Só o typecheck, sem gerar nada |

> A API roda no plano gratuito do Render e **hiberna**: a primeira requisição pode levar
> 10–40s. A tela de carregamento troca a mensagem depois de 4,5s para avisar isso, e o erro
> tem botão de repetir. O cliente espera até 90s antes de desistir — um timeout curto
> mataria justamente a chamada que estava acordando o servidor.

## Publicando

`npm run build` gera um `dist/` estático — hoje 241 kB de JS e 26 kB de CSS, cerca de 82 kB
no total com gzip. Serve em qualquer host de arquivo — GitHub Pages, Netlify, Vercel, S3,
nginx — **sem nenhuma regra de rewrite**, porque a navegação inteira é por hash e o Vite está
com `base: "./"`, o que também deixa publicar de subpasta.

### GitHub Pages

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) publica a cada push
na `main` (e sob demanda pela aba **Actions**). Roda `npm ci`, `npm run build` — que inclui o
typecheck, então erro de tipo derruba a publicação — e manda o `dist/` para o Pages.

No ar em **<https://sasuzin.github.io/NarutoWiki/>**. Não precisa de secret: o workflow usa o
`GITHUB_TOKEN` com `pages: write` e `id-token: write`.

O passo `actions/configure-pages` roda com `enablement: true`, mas vale saber o limite: **essa
flag não cria o site do zero com o `GITHUB_TOKEN` padrão** — a API de criar Pages exige
direito de admin e responde `Resource not accessible by integration`. Este repositório teve o
Pages ligado uma vez por fora:

```bash
gh api -X POST repos/Sasuzin/NarutoWiki/pages -f build_type=workflow
```

Num fork novo, faça o equivalente: ou o comando acima, ou
**Settings → Pages → Build and deployment → Source: GitHub Actions**, ou passe um PAT com
admin em `token:` no passo. Com o site já existindo, `enablement: true` é inofensivo — a ação
só faz o GET e segue.

O site sai em `https://<usuário>.github.io/<repositório>/`. A subpasta não quebra nada —
`base: "./"` faz os assets resolverem relativos ao `index.html`, e as rotas por hash
sobrevivem a um F5 em qualquer URL profunda.

## Stack

| Peça | Escolha | Por quê |
| --- | --- | --- |
| Build | Vite + React 19 + TypeScript estrito | O app é uma SPA de verdade: uma carga de dados no boot e tudo em memória. Não há nada para renderizar no servidor. |
| Rotas | hash (`#/personagens/1344`) | Funciona em hospedagem estática sem nenhum rewrite; `base: "./"` no Vite deixa o build servir de subpasta. |
| Estilo | CSS puro — tokens globais + CSS Modules | A paleta do handoff é definida como variável CSS e nenhum componente escreve cor literal; trocar tema é só trocar `data-theme` no `<html>`. |
| Estado | Context + hooks | Nada de biblioteca: o estado é pequeno (dataset, rota, tema, favoritos, filtros, comparador, quiz). |

Versões em uso:

| Pacote | Versão | Papel |
| --- | --- | --- |
| `react` / `react-dom` | 19.2 | as duas únicas dependências de runtime |
| `vite` | 8.2 | dev server e build |
| `@vitejs/plugin-react` | 6.1 | JSX e Fast Refresh |
| `typescript` | 7.0 | só typecheck (`noEmit`); o Vite transpila |

Nenhuma biblioteca de ícone, de UI, de roteamento, de estado ou de requisição: os únicos
glifos são `≡ ✕ ⌕ ★ ☆ ☾ ☀ ← ·` em texto, as rotas saem de `hashchange` e os dados de `fetch`.

O `tsconfig.json` está no modo estrito completo, mais `noUnusedLocals`,
`noUnusedParameters`, `noImplicitOverride` e `verbatimModuleSyntax`.

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

### O que acontece ao abrir o app

1. **Antes da primeira pintura**, um script inline no `index.html` lê
   `localStorage["naruwiki:theme"]` (ou a preferência do sistema) e escreve `data-theme` no
   `<html>` — por isso quem usa o tema escuro não vê o claro piscar.
2. `main.tsx` monta `<AppProvider>`, que é onde vive todo o estado da sessão.
3. `useDataset` dispara **as oito chamadas em paralelo**. Um timer de 4,5s troca a mensagem de
   carregamento; a tela mostra título fantasma e 12 cards pulsando.
4. Chegando a resposta, `new Dex(dataset)` monta os índices — mapas por id, por nome
   normalizado, vila/clã/time/kekkei por personagem, listas de opção de filtro e o pool do
   quiz. É a única passada cara sobre os 1431 registros, e roda uma vez.
5. `useHashRoute` traduz o hash em `{ name, id }` e o `Router` escolhe a tela. **Daqui em
   diante nada mais vai à rede**: busca, filtro, ordenação e paginação são todos em memória.
6. Se qualquer uma das oito chamadas falhar, a tela inteira vira um card de erro com
   "Tentar de novo", que refaz as oito.

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

## Telas e rotas

| Rota | Tela | O que tem |
| --- | --- | --- |
| `#/` | `Home` | 4 stat cards, as cinco grandes vilas, Time 7 em destaque e os 8 clãs com mais membros |
| `#/personagens` | `Characters` | Grade do elenco com 5 filtros combinados (vila, clã, natureza, rank, status), 5 ordenações e "Mostrar mais (40)" |
| `#/personagens/:id` | `CharacterDetail` | Ficha: galeria, atributos, família com link, vínculos, estreia, dubladores, chips de jutsu/naturezas/títulos, "Também de <vila>" |
| `#/vilas`, `#/clas`, `#/times`, `#/kekkei` | `Collection` | Lista da coleção; com `/:id`, o cabeçalho do registro e a grade dos seus personagens |
| `#/bestas` | `Roster` | Os 10 bijū, sem estrela de favorito |
| `#/bestas/:id` | `CharacterDetail` | Mesma ficha, em modo `beast` (sem vínculos de personagem) |
| `#/akatsuki`, `#/kara` | `Roster` | Membros das organizações |
| `#/favoritos` | `Favorites` | O que está salvo neste navegador |
| `#/comparar` | `Compare` | Dois personagens lado a lado em 14 atributos |
| `#/quiz` | `Quiz` | "Quem é esse ninja?" com a imagem em silhueta e 4 alternativas |

Fora das telas, presentes em todas: topbar fixa com busca global (dropdown de 6 personagens
mais 3 de cada coleção), indicador de status da API, botão de tema, e o menu sanduíche —
drawer de 250px que é overlay **em qualquer largura**, com scrim clicável e `Esc`.

Rota desconhecida cai no dashboard; id inexistente mostra estado vazio com link de volta.

### Responsivo

Uma única quebra, em **900px**: somem a marca e o status da topbar, o padding do main cai de
24px para 16px, as grades de duas colunas viram uma e os stat cards viram 2×2. As grades de
card não dependem de media query — são `auto-fill minmax(…, 1fr)` e se ajustam sozinhas
(`--card-min`, 170px por padrão).

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

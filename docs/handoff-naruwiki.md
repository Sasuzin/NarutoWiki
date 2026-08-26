<!-- Documento de referencia, mantido como veio. Nao editar para acompanhar o codigo. -->

> **Nota da implementação.** Este é o handoff de design original, guardado aqui como
> referência da especificação. O protótipo que o acompanhava (`NaruWiki.dc.html` e
> `support.js`, citados na seção *Arquivos* no fim) **não** foi trazido para o repositório:
> ele depende do runtime do ambiente de design, e o próprio handoff pede para não portá-lo.
>
> Dois números aqui envelheceram desde que o documento foi escrito: a API hoje devolve
> **44 membros da Akatsuki e 32 da Kara** (não 32 e 14), e **16 das 39 vilas** estão sem
> arquivo de símbolo no Naruto Wiki (não 6). Nada disso está fixo no código.
>
> Onde a implementação se afasta de propósito do que está descrito abaixo está listado na
> seção *Onde esta implementação difere do protótipo de design* do
> [README do projeto](../README.md).

---

# Handoff: NaruWiki — enciclopédia ninja sobre a API Dattebayo

## Visão geral
App web de consulta ao universo Naruto: dashboard, catálogo de personagens com busca/filtros/ordenação,
página de detalhe por personagem, coleções (vilas, clãs, times, kekkei genkai, bestas com cauda, Akatsuki, Kara),
favoritos, comparador de dois personagens e um quiz "quem é esse ninja?".
Tema claro (paleta Naruto, laranja/amarelo) e escuro (paleta Sasuke, índigo/violeta), alternável e persistido.

## Sobre os arquivos deste pacote
Os arquivos aqui são **referências de design feitas em HTML** — um protótipo que mostra aparência e
comportamento pretendidos, **não** código de produção para copiar.
A tarefa é **recriar estas telas no ambiente do seu codebase** (React, Vue, Svelte, Next…), usando os
padrões e bibliotecas já estabelecidos lá. Se ainda não existe base de código, escolha o framework
mais adequado e implemente as telas nele.

`NaruWiki.dc.html` é um componente de design que roda direto no navegador; ele depende de `support.js`
(runtime do ambiente onde foi criado) e não deve ir para produção. O que importa dele:
o **HTML/CSS de cada tela** (dentro de `<x-dc>`) e a **lógica** (a classe no `<script data-dc-script>`) —
fetch, índices, filtros, ordenação, favoritos, quiz e comparador.

## Fidelidade
**Alta (hi-fi).** Cores, tipografia, espaçamentos, raios e estados finais estão definidos abaixo e devem
ser reproduzidos fielmente com os componentes do seu design system.

## API
Base: `https://dattebayo-api.onrender.com` (o endereço `api-dattebayo.vercel.app` é só a documentação).
Servidor gratuito: **a primeira requisição pode levar 10–40s** ("hiberna" sem uso) — a UI precisa de estado
de carregamento e de um aviso depois de ~4,5s.

| Endpoint | Chave da resposta | Total | Forma |
| --- | --- | --- | --- |
| `/characters?page=1&limit=1500` | `characters` | 1431 | objeto completo (abaixo) |
| `/villages?limit=100` | `villages` | 39 | `{id, name, characters: number[]}` |
| `/clans?limit=100` | `clans` | 58 | idem |
| `/teams?limit=300` | `teams` | 191 | idem |
| `/kekkei-genkai?limit=100` | `kekkei-genkai` | 39 | idem |
| `/tailed-beasts?limit=50` | `tailed-beasts` | 10 | igual a personagem (**id em espaço próprio**) |
| `/akatsuki?limit=100` | `akatsuki` | 32 | igual a personagem (ids do espaço de personagens) |
| `/kara?limit=100` | `kara` | 14 | idem |

Todas as respostas trazem `{ <chave>: [], currentPage, pageSize, total }` e CORS liberado.
As 8 chamadas são feitas em paralelo **uma vez** no mount (~700ms depois de acordado) e tudo é indexado em memória —
busca, filtro e ordenação são client-side, sem novas requisições.

### Objeto de personagem
```jsonc
{
  "id": 1344,
  "name": "Naruto Uzumaki",
  "images": ["https://static.wikia.nocookie.net/naruto/images/…png"],   // 1345 de 1431 têm imagem
  "debut": { "manga": "…", "anime": "…", "novel": "…", "movie": "…", "game": "…", "ova": "…", "appearsIn": "…" },
  "family": { "father": "Minato Namikaze", "mother": "…", "wife": "…" },
  "jutsu": ["Rasengan", "…"],                 // pode passar de 100 itens
  "natureType": ["Wind Release  (Affinity)", "Lightning Release"],
  "personal": {
    "birthdate": "October 10", "sex": "Male",
    "age": { "Part I": "12", "Part II": "15-17" },      // objeto por arco, string ou array
    "height": { "Part I": "145.3 cm" }, "weight": { … },
    "bloodType": "B", "kekkeiGenkai": "…", "kekkeiMōra": "…", "kekkeiTōta": "…",
    "classification": ["Jinchūriki", "Sage"], "tailedBeast": "Kurama",
    "occupation": "Hokage", "affiliation": ["Konohagakure", "Mount Myōboku"],
    "team": […], "clan": "…", "titles": [ … ], "status": "Alive", "partner": "…"
  },
  "rank": { "ninjaRank": { "Part I": "Genin", "Part II": "Genin" }, "ninjaRegistration": "012607" },
  "tools": ["Kunai"], "voiceActors": { "japanese": "…", "english": "…" }, "uniqueTraits": ["…"]
}
```

### Armadilhas reais dos dados (todas já tratadas no protótipo)
1. **Campos polimórficos**: quase todo campo de `personal` pode ser string, array **ou** objeto por arco.
   Use um `fmt(v)` (achata em `"chave: valor · chave: valor"`) e um `lastVal(v)` (pega o valor mais recente,
   usado para rank/status/idade).
2. **Vila não vem no personagem** — é derivada de `/villages[].characters`. **47 personagens aparecem em mais de
   uma vila**: indexe uma **lista** por id e escolha a principal na ordem: (a) primeira que aparece em
   `personal.affiliation`, (b) nome terminando em `gakure`, (c) a primeira. Sem isso, Naruto vira "Mount Myōboku".
   As demais viram badges secundárias.
3. **Ruído de wiki em `titles`/`uniqueTraits`**: `"childOfTheProphecy(予言の子,YogenNoKo)"`. Limpe com:
   remover parênteses → remover faixas CJK → separar camelCase → colapsar espaços → descartar < 3 caracteres.
4. **`natureType` traz sufixos**: `"Wind Release  (Affinity)"` → remova parênteses antes de agrupar/filtrar.
5. **Bestas com cauda têm id próprio** (1–10) que **colide** com ids de personagens — mantenha um mapa separado
   e rota separada. Já Akatsuki e Kara usam ids de personagem: faça merge no mapa principal quando faltar.
6. **Ids de `characters` em coleções podem não existir** no elenco — filtre por `byId.has(id)`.

### Símbolos das vilas
`https://naruto.fandom.com/wiki/Special:FilePath/<Nome_Da_Vila>_Symbol.svg` (ex.: `Konohagakure_Symbol.svg`).
Funciona por hotlink; **6 das 39 vilas não têm arquivo** → fallback obrigatório para monograma (iniciais)
atrás do símbolo. As imagens são desenhadas como `background-image` num `<span>`, com o monograma embaixo:
se a URL falhar, nada pinta e o monograma aparece sozinho — sem `onerror`, sem ícone quebrado.

## Design tokens

### Tema claro (Naruto)
| Token | Hex | Uso |
| --- | --- | --- |
| `--brand` | `#E07B12` | ações primárias, item ativo, links |
| `--brand-dark` | `#B45E05` | hover de primário |
| `--brand-soft` | `#FDF0DC` | fundo do item ativo, tile de símbolo |
| `--brand-soft-2` | `#F8E1BB` | realce secundário |
| `--on-brand` | `#FFFFFF` | texto sobre `--brand` |
| `--bg` | `#F3EFE6` | fundo da página |
| `--surface` | `#FFFFFF` | cards, topbar, drawer |
| `--surface-alt` | `#FAF6EE` | faixas de cabeçalho, inputs, chips |
| `--line` / `--line-2` | `#E4DDCD` / `#D4CAB5` | bordas / bordas de controle |
| `--ink` / `--muted` / `--faint` | `#231D14` / `#6B6153` / `#9A907E` | texto |
| `--ok-bg`/`--ok-fg` | `#E8F1E6` / `#3F7A2E` | vivo, acerto |
| `--warn-bg`/`--warn-fg` | `#FDF0DC` / `#B45E05` | jinchūriki, atenção |
| `--bad-bg`/`--bad-fg` | `#FBE7E2` / `#C0392B` | falecido, erro |
| `--info-bg`/`--info-fg` | `#E7F1EA` / `#2F6B4F` | badge de vila |

### Tema escuro (Sasuke)
`--brand #8B7CF0` · `--brand-dark #A99CF7` · `--brand-soft #221D46` · `--brand-soft-2 #2C2660` · `--on-brand #0C0A18`
`--bg #0C0A17` · `--surface #141126` · `--surface-alt #1B1733` · `--line #282350` · `--line-2 #37305F`
`--ink #E9E7F7` · `--muted #A49DC9` · `--faint #726BA0`
`--ok #132D26/#5BC79A` · `--warn #2F2413/#E0AE5E` · `--bad #331525/#F0748C` · `--info #1A2547/#7FA6F5`

Trocar tema = trocar `data-theme="dark"` no `<html>`; tudo o mais é `var(--*)`. Persistir em
`localStorage["naruwiki:theme"]`; sem valor salvo, usa a preferência do sistema.

### Tipografia — Inter (400/500/600/700), `font-variant-numeric: tabular-nums` no body
| Papel | Tamanho | Peso | Extras |
| --- | --- | --- | --- |
| Título de página | 24–26px | 700 | `letter-spacing:-.02em` |
| Nome do personagem (detalhe) | 30px | 700 | `line-height:1.1` |
| KPI do dashboard | 30px | 700 | `line-height:1` |
| Título de card | 18px | 600 | `-.01em` |
| Corpo | 14px | 400 | `line-height:1.5` |
| Secundário | 13px | 400/500 | `--muted` |
| Auxiliar | 12px | 400 | `--muted` |
| Cabeçalho de seção/tabela | 11px | 700 | `uppercase`, `letter-spacing:.045–.06em`, `--faint` |
| Badge | 10–11px | 700 | `uppercase` |
| Rótulo de campo | 10px | 700 | `uppercase`, `.05em`, `--faint` |

### Forma e espaçamento
Raio: 10px (cards), 8–9px (botões, inputs, badges, tiles), 6–7px (miniaturas).
Sem sombra em cards — só `1px solid var(--line)`; sombra apenas em overlays
(dropdown `0 12px 32px rgba(11,18,25,.14)`, drawer `0 24px 64px rgba(6,4,14,.28)`).
Padding: 24px (cards de conteúdo), 16–20px (cards densos), 14px (barra de filtros).
Gap de grade: 14px. Altura de controles: 40px (botão/input principal), 36–38px (secundários).
Largura máxima do conteúdo: 1340px, centralizado, padding 24px (16px no mobile).

## Telas

### Chrome (todas as telas)
- **Topbar** fixa (`position:sticky; top:0; z-index:40`), fundo `--surface`, borda inferior `--line`, padding `11px 20px`,
  flex com gap 12px: botão sanduíche (38×38, `≡`) → marca (tile 30px + "NaruWiki" 15/700, some no mobile) →
  campo de busca (altura 40, máx 540px, ícone `⌕` à esquerda, fundo `--surface-alt`, foco: borda `--brand` + fundo `--surface`) →
  à direita: status da API (ponto 7px + rótulo 11/700 uppercase; verde conectado, âmbar conectando, vermelho offline) e
  botão de tema 38×38 (`☾`/`☀`).
- **Drawer** (250px) **sempre** atrás do sanduíche, em qualquer largura: `position:fixed; transform:translateX(-100%)`,
  abre com `transform:none`, transição `.24s cubic-bezier(.4,0,.2,1)`; scrim `rgba(8,6,16,.46)` clicável fecha.
  Cabeçalho: tile da marca + "NaruWiki"/"Enciclopédia ninja" + botão `✕`. Navegação: 12 itens de 36px,
  ativo = fundo `--brand-soft`, texto `--brand`, 600; contagem à direita em 11/600. Rodapé: crédito 10px.
- **Marca**: quadrado de cantos arredondados com `ナ` centralizado e **cabelo em SVG saindo por cima**:
  claro = espetos amarelos `#F2B705`; escuro = topete azul-escuro `#3E3B78` com duas mechas descendo pelas laterais.
  Trocado por CSS (`:root[data-theme="dark"] .hair-light{display:none}` e o inverso).
- **Rotas por hash**: `#/`, `#/personagens`, `#/personagens/:id`, `#/vilas[/:id]`, `#/clas[/:id]`, `#/times[/:id]`,
  `#/kekkei[/:id]`, `#/bestas[/:id]`, `#/akatsuki`, `#/kara`, `#/favoritos`, `#/comparar`, `#/quiz`.
  Trocar de rota fecha o drawer, reseta a paginação para 60 e sobe o scroll.

### 1. Dashboard (`#/`)
Título 26/700 + subtítulo 14 `--muted` à esquerda; botão "Jogar o quiz" (primário, 40px) à direita.
- **4 stat cards** (grid 4 colunas, 2 no mobile): rótulo 11/700 uppercase `--faint`, valor 30/700 (`toLocaleString('pt-BR')`),
  dica 12 `--muted`. Card inteiro é link; hover troca a borda para `--brand`.
- **"As cinco grandes vilas"**: cards `auto-fill minmax(190px,1fr)` com tile 44px (símbolo sobre monograma) + nome + contagem.
- **Duas colunas (1fr / 340px, empilha no mobile)**: "Em destaque · Time 7" (4 miniaturas quadradas com nome e rank) e
  "Clãs com mais membros" (8 linhas com barra proporcional de 6px em `--brand`, largura mín. 8px, máx. 90px).

### 2. Personagens (`#/personagens`)
Cabeçalho + **barra de filtros** (card, flex wrap): 5 selects (Vila, Clã, Natureza, Rank, Status) de 36px com rótulo
10/700 uppercase, + botão "Limpar". Abaixo: contagem de resultados à esquerda, "Ordenar" à direita
(Nome A–Z, Rank ninja, Idade, Altura, Peso — as três últimas em ordem decrescente, extraindo o primeiro número do valor mais recente;
rank usa a ordem Kage → Sannin → Jōnin → Anbu → Tokubetsu Jōnin → Chūnin → Genin → Academy Student, desconhecidos por último).
**Grade** `auto-fill minmax(170px,1fr)`, gap 14px. Card: imagem 3:4 (`cover`, `object-position: top center`, monograma 26/700 atrás),
nome 13/600 truncado, badges de vila (info) e rank (contorno), e **estrela de favorito** 28×28 no canto superior direito
(preenchida em `--brand` quando salvo; o clique não navega). Paginação por botão "Mostrar mais (40)".
Vazio: card com "Nenhum personagem com esses filtros".

### 3. Detalhe do personagem (`#/personagens/:id`)
Link "← Personagens". Grade `320px / 1fr` (empilha no mobile).
- **Coluna esquerda** (sticky, `top:86px`): imagem 3:4; se houver mais de uma imagem, tira de miniaturas 52px
  (selecionada com borda 2px `--brand`); botões "★ Favoritar" e "Comparar" (38px).
- **Coluna direita**: card com nome 30/700, linha de contexto (ocupação + classificação limpas, até 3 itens),
  badges (vila, vilas secundárias, clã, rank, status vivo/falecido, jinchūriki) e **grade de atributos**
  `auto-fill minmax(150px,1fr)` (rótulo 10/700 uppercase + valor 14).
- **Cards de vínculo** (cabeçalho em `--surface-alt`): Família (parentesco traduzido → link para o personagem quando o nome existir),
  Vínculos (vila, clã, times, kekkei genkai — links), Estreia, Dubladores.
- **Cards de chips**: Naturezas, Jutsu, Ferramentas, Títulos, Traços únicos — 18 chips e botão "+N restantes" que expande.
- **"Também de <vila>"**: até 12 mini-cards (avatar 38px + nome).

### 4. Coleções e detalhe de coleção
`#/vilas`, `#/clas`, `#/times`, `#/kekkei`: grade `auto-fill minmax(220px,1fr)` com tile 42px, nome e "N personagens".
O detalhe (`/:id`) reaproveita o cabeçalho (tile 52px com símbolo, título, subtítulo) + a grade de personagens.
`#/bestas`, `#/akatsuki`, `#/kara` usam direto a grade de personagens (bestas sem estrela de favorito).

### 5. Favoritos (`#/favoritos`)
Mesma grade; vazio explica como salvar. Persistido em `localStorage["naruwiki:favs"]` (array de ids).

### 6. Comparar (`#/comparar`)
Dois cards lado a lado; cada um: input de busca → lista de até 8 resultados (clique preenche) → ficha
(imagem 76×96, nome, vila · rank) e botão "Trocar". Com os dois preenchidos, tabela de 14 linhas
`1fr / 148px / 1fr` — valor A alinhado à direita, rótulo 10/700 uppercase centralizado, valor B à esquerda:
Vila, Clã, Rank, Status, Idade, Altura, Peso, Sangue, Kekkei genkai, Naturezas, Jutsu (contagem),
Ferramentas (contagem), Times, Classificação. Ausente = "—".

### 7. Quiz (`#/quiz`)
Coluna de 680px. Placar "acertos / total" 24/700 à direita. Palco de 330px com a imagem em `contain` e
`filter: brightness(.35) contrast(1.4) grayscale(1)` (transição .25s) até responder. 4 alternativas em grade 2×2 (46px):
ao responder, a correta fica verde (`--ok-*`), a escolhida errada vermelha (`--bad-*`), as demais esmaecem;
feedback em texto e botão "Próxima" (antes de responder, "Pular"). Sorteio entre personagens **com imagem,
com vila e com mais de 4 jutsu** (elenco reconhecível), 4 opções distintas embaralhadas.

## Estado
| Estado | Onde vive | Observação |
| --- | --- | --- |
| `chars`, `groups` | memória | carregados uma vez; índices derivados: `byId`, `byName` (normalizado), `villages[id][]`, `clan`, `team[]`, `kekkei[]` |
| `loading`, `error`, `slow` | memória | `slow` liga em 4,5s e troca a mensagem de carregamento |
| `route` | hash da URL | `{name, id}` |
| `q`, `searchOpen` | memória | busca global; dropdown com até 6 personagens + 3 de cada coleção |
| `f` (5 filtros), `sort`, `limit` | memória | `limit` volta a 60 a cada troca de rota/filtro |
| `favs` | `localStorage["naruwiki:favs"]` | array de ids |
| `theme` | `localStorage["naruwiki:theme"]` | `"light"` / `"dark"` |
| `compare[2]`, `cq[2]` | memória | ids e textos de busca dos dois slots |
| `quiz`, `quizPick`, `quizScore` | memória | placar não persiste |
| `expand{}`, `gal` | memória | chips expandidos e miniatura selecionada |

## Interações
- Busca global: filtra por nome normalizado (sem acento/caixa), abre dropdown ao digitar 2+ caracteres;
  clicar em um resultado navega e limpa a busca.
- Hover: cards trocam a borda para `--brand`; linhas de lista ganham fundo `--surface-alt`; botões secundários
  vão para `--surface-alt` + texto `--ink`. Transições de cor de 0,15–0,18s.
- Carregando: título fantasma + 12 cards em `animation: dbPulse 1.2s ease-in-out infinite` (opacidade 1 → .45).
- Erro: card centralizado com a mensagem e botão "Tentar de novo" que refaz as 8 chamadas.
- Responsivo: uma única quebra em 900px — some a marca da topbar e o status, padding do main cai para 16px,
  grades de 2 colunas viram 1, stat cards viram 2×2. As grades de cards já são fluidas (`auto-fill minmax`).

## Assets
- **Imagens de personagem**: `images[]` da própria API (CDN `static.wikia.nocookie.net`).
- **Símbolos de vila**: Naruto Wiki via `Special:FilePath` (SVG).
- **Fonte**: Inter (Google Fonts, 400/500/600/700).
- **Cabelo da marca**: dois SVGs inline (definidos no arquivo de design) — sem dependência externa.
- Nenhum ícone de biblioteca: os únicos glifos são `≡ ✕ ⌕ ★ ☆ ☾ ☀ ← ·` em texto.

## Arquivos
- `NaruWiki.dc.html` — todo o design: template das telas + classe de lógica (fetch, índices, filtros, quiz, comparador).
- `support.js` — runtime do ambiente de design, necessário só para abrir o HTML localmente. Não portar.

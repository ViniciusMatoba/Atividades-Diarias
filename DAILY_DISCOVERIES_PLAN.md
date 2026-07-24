# DAILY DISCOVERIES PLAN — Descobertas do Dia 🌟

Este documento estabelece o planejamento arquitetural e o plano de ação para a nova funcionalidade **Descobertas do Dia** no aplicativo **GeekDaily**.

---

## 🎯 1. Objetivo & Visão Geral
Oferecer uma área independente da jornada competitiva de jogos, com conteúdo diário leve, visual e interativo (Descobrir · Salvar · Colecionar), incentivando os usuários a acessar o app diariamente.

---

## 🏗️ 2. Arquitetura Recomendada
Para garantir o desacoplamento total da área de jogos (`src/games`), criaremos o módulo em:
```text
src/features/dailyDiscoveries/
├── types.ts                      # Tipos e discriminated unions do TypeScript
├── data/
│   └── moviesSeries.ts           # Base editorial local (filmes, séries, curiosidades)
├── services/
│   ├── dailySelection.ts         # Seleção determinística por fuso America/Sao_Paulo
│   ├── dailySelection.test.ts    # Testes unitários da seleção diária e timezone
│   ├── userDiscoveries.ts        # Persistência de estado do usuário (revelados, favoritos, watchlist)
│   └── userDiscoveries.test.ts   # Testes unitários da persistência e idempotência
└── ui/
    ├── DiscoveryTeaserCard.tsx   # Card com interações pré-revelação (pistas e palpite)
    ├── PokemonDiscoveryCard.tsx  # Card de Pokémon (reutiliza PokedexCard)
    ├── CountryDiscoveryCard.tsx  # Card de País (bandeiras HD, ficha geográfica, fatos)
    ├── MovieSeriesDiscoveryCard.tsx # Card de Filmes/Séries (motivo para assistir, watchlist)
    ├── HomeDiscoveriesPreview.tsx# Seção compacta de preview na página inicial
    ├── CollectionSection.tsx     # Coleção do usuário (Favoritos, Quero Assistir, Histórico)
    └── ShareDiscoveryButton.tsx  # Botão de compartilhamento formatado sem spoilers
```

---

## 🔄 3. Componentes Reutilizados & Refatorados
- **`PokedexCard` (Refatoração Solicitada):** Extrair o componente de renderização da Pokédex de `PokeGuessGame.tsx` para `src/components/PokedexCard.tsx`, permitindo uso limpo e sem duplicação tanto no jogo `PokéGuess` quanto no `PokemonDiscoveryCard`.
- **Reutilização de Dados de Países:** Consumir `COUNTRIES` de `src/games/mysteryCountry/data/countries.ts` e utilitários de bandeira `getFlagUrl`.
- **Reutilização de Dados de Pokémon:** Consumir `POKEMON` e `getPokemonArtworkUrl` de `src/games/pokeGuess/data/pokemon.ts`.
- **Componentes de UI:** Reutilizar `Card`, `Button`, `ProgressBar`, `StarRating` e tokens de `globals.css`.

---

## 📊 4. Modelo de Dados & Contratos TypeScript

```ts
export type DailyDiscoveryType = "pokemon" | "country" | "movie" | "series";

export interface DailyDiscoveryBase {
  id: string;          // ex: "2026-07-24:pokemon"
  dateKey: string;     // "YYYY-MM-DD" no fuso America/Sao_Paulo
  type: DailyDiscoveryType;
  contentId: string;
  title: string;
}

export interface UserDiscoveryState {
  discoveryId: string; // ex: "2026-07-24:pokemon"
  dateKey: string;
  type: DailyDiscoveryType;
  contentId: string;
  viewedAt?: string;
  revealedAt?: string;
  userGuess?: string;
  isCorrect?: boolean;
  isFavorite?: boolean;
  inWatchlist?: boolean;
}
```

---

## 🗓️ 5. Seleção Diária & Regras de Timezone
- **Timezone:** Referência estrita em `America/Sao_Paulo` utilizando o utilitário já consolidado `getDailyKey()` em `src/lib/dailyKey.ts`.
- **Seleção Determinística:** Baseada em hash da data diária (`seed = hash(dateKey + type)`).
- **Regras de Não-Repetição:** Seleção que evita repetições frequentes com fallback seguro para bases de menor volume.

---

## 🧭 6. Navegação & Rotas
- **Navegação Principal (`BottomNav.tsx`):**
  1. `Início` (`/`)
  2. `Jogos` (`/journey`)
  3. `Descobertas` (`/discoveries`) — **Nova Rota**
  4. `Ranking` (`/ranking`)
  5. `Perfil` (`/profile`)
- **Seção na Home (`page.tsx`):**
  - Bloco compacto "Descobertas de hoje" com progresso (ex: `2 de 3 reveladas`) e botões curtos para acessar cada card.

---

## 🧪 7. Plano de Testes
- Seleção diária determinística no fuso `America/Sao_Paulo`.
- Troca de data gerando novos conjuntos de descobertas.
- Revelação de descobertas e registro de palpites opcionais.
- Favoritar e desfavoritar de forma idempotente.
- Adicionar e remover da lista "Quero assistir".
- Manutenção da aprovação de 100% dos testes atuais dos 5 jogos (`npx vitest run`).
- Verificação TypeScript sem erros (`npm run typecheck`).
